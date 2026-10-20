import { useEffect, useState } from "react";

import Spinner from "../../Spinner";
import Styles from "./_adminPanels.module.css";
import {
  GetUsersAnalyticsApi,
  GetCourseAnalyticsApi,
  GetOrderAnalyticsApi,
} from "../../services/api/analyticsService";
import { errMsg } from "../../utils";

// Docs only show the users shape ({ last12Months: [{ month, count }] });
// courses / orders come back as `{}` in the docs, so read any array inside.
const extractSeries = (section) => {
  if (!section) return [];
  const rows = Array.isArray(section)
    ? section
    : Object.values(section).find(Array.isArray);

  return (rows || []).map((row) => ({
    label: String(row.month ?? row.label ?? row.name ?? ""),
    value: Number(row.count ?? row.value ?? row.total ?? 0),
  }));
};

const BarChart = ({ data }) => {
  if (!data.length) return <p className={Styles.muted}>No data yet.</p>;

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <>
      <div className={Styles.bars}>
        {data.map((d, i) => (
          <div className={Styles.barCol} key={`${d.label}-${i}`}>
            <span className={Styles.barValue}>{d.value}</span>
            <div
              className={Styles.barFill}
              style={{ height: `${(d.value / max) * 100}%` }}
              title={`${d.label}: ${d.value}`}
            />
          </div>
        ))}
      </div>
      <div className={Styles.barLabels}>
        {data.map((d, i) => (
          <span key={`${d.label}-${i}`} title={d.label}>
            {d.label.split(" ")[0].slice(0, 3)}
          </span>
        ))}
      </div>
    </>
  );
};

const SECTIONS = [
  { key: "users", title: "User signups (last 12 months)", call: GetUsersAnalyticsApi },
  { key: "courses", title: "Courses created (last 12 months)", call: GetCourseAnalyticsApi },
  { key: "orders", title: "Orders (last 12 months)", call: GetOrderAnalyticsApi },
];

const Analytics = () => {
  const [results, setResults] = useState(null);

  useEffect(() => {
    Promise.allSettled(SECTIONS.map((s) => s.call())).then((settled) => {
      const out = {};
      settled.forEach((r, i) => {
        const { key } = SECTIONS[i];
        out[key] =
          r.status === "fulfilled"
            ? { data: extractSeries(r.value[key]) }
            : { error: errMsg(r.reason, "Failed to load") };
      });
      setResults(out);
    });
  }, []);

  if (!results) return <Spinner />;

  return (
    <section className={Styles.panel}>
      <h1>Analytics</h1>

      <div className={Styles.stats}>
        {SECTIONS.map(({ key, title }) => (
          <div className={Styles.stat} key={key}>
            <span>{title.split(" (")[0]}</span>
            <strong>
              {results[key].data
                ? results[key].data.reduce((sum, d) => sum + d.value, 0)
                : "-"}
            </strong>
          </div>
        ))}
      </div>

      {SECTIONS.map(({ key, title }) => (
        <div className={Styles.chartCard} key={key}>
          <h2>{title}</h2>
          {results[key].error ? (
            <p className={Styles.error}>{results[key].error}</p>
          ) : (
            <BarChart data={results[key].data} />
          )}
        </div>
      ))}
    </section>
  );
};

export default Analytics;
