import { useState } from "react";
import toast from "react-hot-toast";

import S from "./lms.module.css";
import { errMsg } from "../utils";
import {
  GetCategoriesApi,
  GetMarketHomeApi,
  GetPublishedCoursesApi,
  SearchCoursesApi,
  humanize,
  toList,
} from "./lmsApi";
import { Async, CourseCard, Empty, useAsync, useWishlist } from "./LmsShared";

const Grid = ({ items, wishIds, toggle }) =>
  items.length ? (
    <div className={S.grid}>
      {items.map((c, i) => (
        <CourseCard key={c._id || i} item={c} wished={wishIds.has(c._id)} onWish={toggle} />
      ))}
    </div>
  ) : (
    <Empty>No courses found.</Empty>
  );

const LmsHome = () => {
  const home = useAsync(GetMarketHomeApi);
  const all = useAsync(GetPublishedCoursesApi);
  const cats = useAsync(GetCategoriesApi);
  const { ids, toggle } = useWishlist();

  const [q, setQ] = useState("");
  const [results, setResults] = useState(null); // null = show the normal home
  const [searching, setSearching] = useState(false);

  const search = async (term) => {
    if (!term.trim()) return setResults(null);
    try {
      setSearching(true);
      setResults(toList(await SearchCoursesApi(term.trim()), "courses"));
    } catch (e) {
      toast.error(errMsg(e, "Search failed"));
    } finally {
      setSearching(false);
    }
  };

  const categories = toList(cats.data, "categories");
  // /lms/home returns several named lists (featured, topRated, newest ...): show each one
  const sections = Object.entries(home.data || {}).filter(
    ([, v]) => Array.isArray(v) && v.length,
  );

  return (
    <>
      <form
        className={S.search}
        onSubmit={(e) => {
          e.preventDefault();
          search(q);
        }}
      >
        <input
          type="text"
          placeholder="Search published courses..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className={S.btn} disabled={searching}>
          {searching ? "Searching..." : "Search"}
        </button>
        {results && (
          <button
            type="button"
            className={`${S.btn} ${S.btnGhost}`}
            onClick={() => {
              setQ("");
              setResults(null);
            }}
          >
            Clear
          </button>
        )}
      </form>

      {categories.length > 0 && (
        <div className={S.chips}>
          {categories.map((c, i) => {
            const name = c.name ?? c.title ?? c._id;
            return (
              <button
                key={c._id || i}
                className={S.chip}
                onClick={() => {
                  setQ(String(name));
                  search(String(name));
                }}
              >
                {name}
                {(c.count ?? c.total) !== undefined && ` (${c.count ?? c.total})`}
              </button>
            );
          })}
        </div>
      )}

      {results ? (
        <section className={S.section}>
          <h2>Search results ({results.length})</h2>
          <Grid items={results} wishIds={ids} toggle={toggle} />
        </section>
      ) : (
        <>
          <Async state={home}>
            {() =>
              sections.map(([key, list]) => (
                <section className={S.section} key={key}>
                  <h2>{humanize(key)}</h2>
                  <Grid items={list} wishIds={ids} toggle={toggle} />
                </section>
              ))
            }
          </Async>

          <section className={S.section}>
            <h2>All courses</h2>
            <Async state={all}>
              {(res) => <Grid items={toList(res, "courses")} wishIds={ids} toggle={toggle} />}
            </Async>
          </section>
        </>
      )}
    </>
  );
};

export default LmsHome;
