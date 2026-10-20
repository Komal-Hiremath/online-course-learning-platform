import { useState } from "react";
import toast from "react-hot-toast";

import S from "./lms.module.css";
import { errMsg } from "../utils";
import {
  CloneCourseApi,
  CreateCategoryApi,
  CreateCouponApi,
  DeleteCategoryApi,
  ExportEnrollmentsApi,
  GetAdminAnalyticsApi,
  GetAdminCoursesApi,
  GetAdminEnrollmentsApi,
  GetAdminOrdersApi,
  GetAllCategoriesApi,
  GetCouponsApi,
  GetInstructorsApi,
  RefundOrderApi,
  SetCourseStatusApi,
  UpdateCategoryApi,
  toList,
} from "./lmsApi";
import { Async, AutoTable, AutoView, Field, Tabs, useAsync, useForm } from "./LmsShared";

const STATUSES = ["DRAFT", "SUBMITTED", "PUBLISHED", "REJECTED"];

// run an API call, toast the result, then refresh the list
const run = async (fn, okMsg, reload) => {
  try {
    await fn();
    toast.success(okMsg);
    reload?.();
  } catch (e) {
    toast.error(errMsg(e, "Action failed"));
  }
};

const Overview = () => {
  const state = useAsync(GetAdminAnalyticsApi);
  return (
    <>
      <div className={S.actions} style={{ marginBottom: 16 }}>
        <button className={S.btn} onClick={() => run(ExportEnrollmentsApi, "Export downloaded")}>
          ⬇ Export enrollments (CSV)
        </button>
      </div>
      <Async state={state}>{(d) => <AutoView data={d} />}</Async>
    </>
  );
};

const Courses = () => {
  const state = useAsync(GetAdminCoursesApi);
  return (
    <Async state={state}>
      {(res) => (
        <AutoTable
          title="All courses"
          rows={toList(res, "courses")}
          actions={(c) => (
            <div className={S.actions}>
              <select
                defaultValue=""
                onChange={(e) =>
                  e.target.value &&
                  run(() => SetCourseStatusApi(c._id, e.target.value), `Status set to ${e.target.value}`, state.reload)
                }
              >
                <option value="">Set status…</option>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
              <button
                className={`${S.btn} ${S.btnSm} ${S.btnGhost}`}
                onClick={() => run(() => CloneCourseApi(c._id), "Course cloned as DRAFT", state.reload)}
              >
                Clone
              </button>
            </div>
          )}
        />
      )}
    </Async>
  );
};

const Orders = () => {
  const state = useAsync(GetAdminOrdersApi);
  return (
    <Async state={state}>
      {(res) => (
        <AutoTable
          title="Orders"
          rows={toList(res, "orders")}
          actions={(o) => (
            <button
              className={`${S.btn} ${S.btnSm} ${S.btnDanger}`}
              onClick={() =>
                window.confirm("Refund this order and remove the enrollment?") &&
                run(() => RefundOrderApi(o._id), "Refund processed", state.reload)
              }
            >
              Refund
            </button>
          )}
        />
      )}
    </Async>
  );
};

const Categories = () => {
  const state = useAsync(GetAllCategoriesApi);
  const f = useForm({ name: "", description: "" });

  const add = (e) => {
    e.preventDefault();
    if (!f.values.name.trim()) return toast.error("Category name is required");
    run(async () => {
      await CreateCategoryApi({ name: f.values.name.trim(), description: f.values.description.trim() });
      f.reset();
    }, "Category created", state.reload);
  };

  return (
    <>
      <form className={`${S.panel} ${S.form}`} onSubmit={add}>
        <h3>New category</h3>
        <div className={S.formRow}>
          <Field label="Name"><input type="text" {...f.bind("name")} /></Field>
          <Field label="Description"><input type="text" {...f.bind("description")} /></Field>
        </div>
        <button className={S.btn}>Create category</button>
      </form>

      <Async state={state}>
        {(res) => (
          <AutoTable
            title="Categories"
            rows={toList(res, "categories")}
            actions={(c) => (
              <div className={S.actions}>
                <button
                  className={`${S.btn} ${S.btnSm} ${S.btnGhost}`}
                  onClick={() =>
                    run(() => UpdateCategoryApi(c._id, { name: c.name, description: c.description, isActive: !c.isActive }),
                      c.isActive ? "Category deactivated" : "Category activated", state.reload)
                  }
                >
                  {c.isActive === false ? "Activate" : "Deactivate"}
                </button>
                <button
                  className={`${S.btn} ${S.btnSm} ${S.btnDanger}`}
                  onClick={() =>
                    window.confirm(`Delete “${c.name}”?`) &&
                    run(() => DeleteCategoryApi(c._id), "Category deleted", state.reload)
                  }
                >
                  Delete
                </button>
              </div>
            )}
          />
        )}
      </Async>
    </>
  );
};

const Coupons = () => {
  const state = useAsync(GetCouponsApi);
  const f = useForm({
    code: "", discountType: "percentage", discountValue: "", maxDiscount: "",
    minPurchaseAmount: "", courseId: "", usageLimit: "", endDate: "",
  });

  const create = (e) => {
    e.preventDefault();
    const v = f.values;
    if (!v.code.trim() || !(Number(v.discountValue) > 0)) return toast.error("Code and a discount value are required");

    const payload = { code: v.code.trim().toUpperCase(), discountType: v.discountType, discountValue: Number(v.discountValue) };
    ["maxDiscount", "minPurchaseAmount", "usageLimit"].forEach((k) => v[k] !== "" && (payload[k] = Number(v[k])));
    if (v.courseId.trim()) payload.courseId = v.courseId.trim();
    if (v.endDate) payload.endDate = new Date(v.endDate).toISOString();

    run(async () => {
      await CreateCouponApi(payload);
      f.reset();
    }, "Coupon created", state.reload);
  };

  return (
    <>
      <form className={`${S.panel} ${S.form}`} onSubmit={create}>
        <h3>New coupon</h3>
        <div className={S.formRow}>
          <Field label="Code"><input type="text" {...f.bind("code")} /></Field>
          <Field label="Type">
            <select {...f.bind("discountType")}>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed amount</option>
            </select>
          </Field>
          <Field label="Value"><input type="number" min="0" {...f.bind("discountValue")} /></Field>
        </div>
        <div className={S.formRow}>
          <Field label="Max discount"><input type="number" min="0" {...f.bind("maxDiscount")} /></Field>
          <Field label="Min purchase"><input type="number" min="0" {...f.bind("minPurchaseAmount")} /></Field>
          <Field label="Usage limit"><input type="number" min="0" {...f.bind("usageLimit")} /></Field>
        </div>
        <div className={S.formRow}>
          <Field label="Course ID (optional, blank = all courses)"><input type="text" {...f.bind("courseId")} /></Field>
          <Field label="Expires"><input type="datetime-local" {...f.bind("endDate")} /></Field>
        </div>
        <button className={S.btn}>Create coupon</button>
      </form>

      <Async state={state}>{(res) => <AutoTable title="Coupons" rows={toList(res, "coupons")} />}</Async>
    </>
  );
};

const List = ({ call, keys, title }) => {
  const state = useAsync(call);
  return <Async state={state}>{(res) => <AutoTable title={title} rows={toList(res, ...keys)} />}</Async>;
};

const TABS = [
  ["overview", "Overview"],
  ["courses", "Courses"],
  ["orders", "Orders"],
  ["enrollments", "Enrollments"],
  ["instructors", "Instructors"],
  ["categories", "Categories"],
  ["coupons", "Coupons"],
];

const LmsAdmin = () => {
  const [tab, setTab] = useState("overview");

  return (
    <>
      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === "overview" && <Overview />}
      {tab === "courses" && <Courses />}
      {tab === "orders" && <Orders />}
      {tab === "enrollments" && <List call={GetAdminEnrollmentsApi} keys={["enrollments"]} title="Enrollments" />}
      {tab === "instructors" && <List call={GetInstructorsApi} keys={["instructors", "users"]} title="Instructors" />}
      {tab === "categories" && <Categories />}
      {tab === "coupons" && <Coupons />}
    </>
  );
};

export default LmsAdmin;
