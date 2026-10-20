import { useEffect, useState } from "react";

import Spinner from "../../Spinner";
import Styles from "./_adminPanels.module.css";
import { GetAllOrdersApi } from "../../services/api/orderService";
import { GetAdminCoursesApi } from "../../services/api/courseService";
import { fetchAllUsers } from "../../services/api/adminServices";
import { errMsg, formatDate, idOf } from "../../utils";

const OrdersDashboard = () => {
  const [orders, setOrders] = useState(null);
  const [courseNames, setCourseNames] = useState({});
  const [userNames, setUserNames] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      // orders are required; course / user names are only a nice-to-have
      const [ordersRes, coursesRes, usersRes] = await Promise.allSettled([
        GetAllOrdersApi(),
        GetAdminCoursesApi(),
        fetchAllUsers(),
      ]);

      if (ordersRes.status === "rejected") {
        setError(errMsg(ordersRes.reason, "Failed to load orders"));
        setOrders([]);
        return;
      }

      setOrders(ordersRes.value.orders || []);

      if (coursesRes.status === "fulfilled") {
        setCourseNames(
          Object.fromEntries(
            (coursesRes.value.courses || []).map((c) => [c._id, c.name]),
          ),
        );
      }
      if (usersRes.status === "fulfilled") {
        setUserNames(
          Object.fromEntries(
            (usersRes.value.users || []).map((u) => [u._id, u.name]),
          ),
        );
      }
    };

    load();
  }, []);

  if (orders === null) return <Spinner />;

  const paid = orders.filter(
    (o) => o.payment_info?.status === "succeeded",
  ).length;

  return (
    <section className={Styles.panel}>
      <h1>Orders</h1>

      {error && <p className={Styles.error}>{error}</p>}

      <div className={Styles.stats}>
        <div className={Styles.stat}>
          <span>Total orders</span>
          <strong>{orders.length}</strong>
        </div>
        <div className={Styles.stat}>
          <span>Payment succeeded</span>
          <strong>{paid}</strong>
        </div>
      </div>

      {orders.length === 0 ? (
        <p className={Styles.muted}>No orders yet.</p>
      ) : (
        <div className={Styles.tableWrap}>
          <table className={Styles.table}>
            <thead>
              <tr>
                <th>Order</th>
                <th>Course</th>
                <th>User</th>
                <th>Payment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const courseId = idOf(order.courseId);
                const userId = idOf(order.userId);
                const status = order.payment_info?.status;

                return (
                  <tr key={order._id}>
                    <td className={Styles.mono}>{order._id}</td>
                    <td>
                      {courseNames[courseId] || (
                        <span className={Styles.mono}>{courseId}</span>
                      )}
                    </td>
                    <td>
                      {userNames[userId] || (
                        <span className={Styles.mono}>{userId}</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`${Styles.badge} ${
                          status === "succeeded" ? Styles.badgeOk : Styles.badgeWarn
                        }`}
                      >
                        {status || "unknown"}
                      </span>
                      {order.payment_info?.id && (
                        <div className={Styles.mono}>{order.payment_info.id}</div>
                      )}
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default OrdersDashboard;
