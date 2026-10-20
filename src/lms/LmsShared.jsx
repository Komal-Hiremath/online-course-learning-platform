import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import S from "./lms.module.css";
import { useAuth } from "../hooks/fetchUser";
import { errMsg, formatDate, thumbnailUrl } from "../utils";
import { GetWishlistApi, ToggleWishlistApi, courseIdOf, courseOf, humanize, toList } from "./lmsApi";

/* ---------- data loading ---------- */
// useAsync(fn, deps) -> { data, loading, error, status, reload }
export const useAsync = (fn, deps = []) => {
  const [state, setState] = useState({ data: null, loading: true, error: "", status: 0 });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let off = false;
    setState((s) => ({ ...s, loading: true, error: "", status: 0 }));

    Promise.resolve()
      .then(fn)
      .then((data) => !off && setState({ data, loading: false, error: "", status: 200 }))
      .catch(
        (e) =>
          !off &&
          setState({
            data: null,
            loading: false,
            error: errMsg(e, "Something went wrong"),
            status: e.response?.status || 0,
          }),
      );

    return () => {
      off = true;
    };
  }, [...deps, tick]);

  return { ...state, reload: () => setTick((t) => t + 1) };
};

/* ---------- wishlist ---------- */
export const useWishlist = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ids, setIds] = useState(new Set());

  useEffect(() => {
    if (!user) return setIds(new Set());
    GetWishlistApi()
      .then((res) => setIds(new Set(toList(res, "wishlist", "courses").map(courseIdOf))))
      .catch(() => {});
  }, [user?._id]);

  const toggle = async (courseId) => {
    if (!user) {
      toast.error("Please log in to use your wishlist");
      return navigate("/auth/login");
    }
    try {
      const res = await ToggleWishlistApi(courseId);
      setIds((prev) => {
        const next = new Set(prev);
        const on = res?.wishlisted ?? !next.has(courseId);
        on ? next.add(courseId) : next.delete(courseId);
        return next;
      });
    } catch (e) {
      toast.error(errMsg(e, "Wishlist update failed"));
    }
  };

  return { ids, toggle };
};

/* ---------- small UI pieces ---------- */
export const Loading = () => <div className={S.loading}>Loading...</div>;
export const ErrorBox = ({ message }) => (message ? <div className={S.error}>{message}</div> : null);
export const Empty = ({ children }) => <div className={S.empty}>{children}</div>;

export const Tabs = ({ tabs, value, onChange }) => (
  <div className={S.tabs}>
    {tabs.map(([key, label]) => (
      <button
        key={key}
        type="button"
        className={`${S.tab} ${value === key ? S.tabActive : ""}`}
        onClick={() => onChange(key)}
      >
        {label}
      </button>
    ))}
  </div>
);

// handles loading + error for a useAsync result, then renders children(data)
export const Async = ({ state, children }) => {
  if (state.loading) return <Loading />;
  if (state.error) return <ErrorBox message={state.error} />;
  return children(state.data);
};

export const CourseCard = ({ item, wished, onWish }) => {
  const course = courseOf(item);
  const id = courseIdOf(item);

  return (
    <article className={S.card}>
      {onWish && (
        <button className={S.heart} title="Wishlist" onClick={() => onWish(id)}>
          {wished ? "❤️" : "🤍"}
        </button>
      )}
      <Link to={`/lms/course/${id}`}>
        <img src={thumbnailUrl(course.thumbnail)} alt={course.name} />
      </Link>
      <div className={S.cardBody}>
        {course.level && <span className={S.badge}>{course.level}</span>}
        <h3>{course.name}</h3>
        <p>{course.description}</p>
        <div className={S.meta}>
          <span className={S.price}>
            ₹{course.price ?? 0}
            {course.estimatedPrice > 0 && <del>₹{course.estimatedPrice}</del>}
          </span>
          <span>⭐ {course.rating || 0}</span>
        </div>
        <Link className={S.btn} to={`/lms/course/${id}`}>
          View course
        </Link>
      </div>
    </article>
  );
};

/* ---------- generic tables / stats for responses whose shape isn't documented ---------- */
const flattenRow = (row) => {
  const out = {};
  Object.entries(row || {}).forEach(([k, v]) => {
    if (k === "__v" || k === "password" || Array.isArray(v)) return;
    if (v && typeof v === "object") {
      const label = v.name ?? v.title ?? v.email;
      if (label !== undefined) out[k] = label;
      return;
    }
    out[k] = v ?? "";
  });
  return out;
};

const cell = (key, value) => {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (/(At|Date)$/.test(key) && value) return formatDate(value);
  const text = String(value);
  return text.length > 40 ? `${text.slice(0, 38)}…` : text;
};

// rows: array of objects. actions(row) -> JSX shown in the last column
export const AutoTable = ({ rows, actions, title }) => {
  if (!rows?.length) return <Empty>{title ? `No ${title.toLowerCase()} yet.` : "Nothing to show."}</Empty>;

  const flat = rows.map(flattenRow);
  let cols = Object.keys(flat[0]).filter((k) => k !== "_id" && k !== "id");
  if (!cols.length) cols = Object.keys(flat[0]);
  cols = cols.slice(0, 8);

  return (
    <>
      {title && <h3 className={S.tableTitle}>{title}</h3>}
      <div className={S.tableWrap}>
        <table className={S.table}>
          <thead>
            <tr>
              {cols.map((c) => (
                <th key={c}>{humanize(c)}</th>
              ))}
              {actions && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {flat.map((row, i) => (
              <tr key={rows[i]._id || i}>
                {cols.map((c) => (
                  <td key={c}>{cell(c, row[c])}</td>
                ))}
                {actions && <td>{actions(rows[i])}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

// any object: numbers/strings -> stat cards, arrays (or maps of objects) -> tables
export const AutoView = ({ data }) => {
  const stats = [];
  const tables = [];

  const walk = (obj, prefix = "") =>
    Object.entries(obj || {}).forEach(([k, v]) => {
      if (k === "success" || k === "message") return;
      const label = humanize(prefix ? `${prefix} ${k}` : k);

      if (Array.isArray(v)) tables.push([label, v.filter((x) => x && typeof x === "object")]);
      else if (v && typeof v === "object") {
        const vals = Object.values(v);
        if (vals.length && vals.every((x) => x && typeof x === "object" && !Array.isArray(x)))
          tables.push([label, Object.entries(v).map(([name, x]) => ({ name, ...x }))]);
        else if (!prefix) walk(v, k);
      } else stats.push([label, v]);
    });

  walk(data);

  return (
    <>
      {stats.length > 0 && (
        <div className={S.stats}>
          {stats.map(([label, v]) => (
            <div className={S.stat} key={label}>
              <span>{label}</span>
              <strong>{cell(label, v)}</strong>
            </div>
          ))}
        </div>
      )}
      {tables.map(([label, rows]) => (
        <AutoTable key={label} title={label} rows={rows} />
      ))}
      {!stats.length && !tables.length && <Empty>No data yet.</Empty>}
    </>
  );
};

/* ---------- tiny form helper ---------- */
export const useForm = (initial) => {
  const [values, setValues] = useState(initial);
  const bind = (name) => ({
    value: values[name] ?? "",
    onChange: (e) => setValues((v) => ({ ...v, [name]: e.target.value })),
  });
  return { values, setValues, bind, reset: () => setValues(initial) };
};

export const Field = ({ label, children }) => (
  <div className={S.field}>
    <label>{label}</label>
    {children}
  </div>
);
