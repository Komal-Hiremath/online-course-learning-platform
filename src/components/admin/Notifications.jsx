import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Spinner from "../../Spinner";
import Styles from "./_adminPanels.module.css";
import {
  GetNotificationsApi,
  UpdateNotificationStatusApi,
} from "../../services/api/notificationService";
import { errMsg, formatDate } from "../../utils";

const Notifications = () => {
  const [items, setItems] = useState(null);
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    GetNotificationsApi()
      .then((res) => setItems(res.notifications || []))
      .catch((error) => {
        toast.error(errMsg(error, "Failed to load notifications"));
        setItems([]);
      });
  }, []);

  const markRead = async (id) => {
    try {
      setBusyId(id);
      const res = await UpdateNotificationStatusApi(id);

      // the API returns the refreshed list; fall back to a local update
      if (Array.isArray(res?.notifications)) {
        setItems(res.notifications);
      } else {
        setItems((prev) =>
          prev.map((n) => (n._id === id ? { ...n, status: "read" } : n)),
        );
      }
    } catch (error) {
      toast.error(errMsg(error, "Failed to update notification"));
    } finally {
      setBusyId("");
    }
  };

  if (items === null) return <Spinner />;

  const unread = items.filter((n) => n.status === "unread").length;

  return (
    <section className={Styles.panel}>
      <h1>Notifications</h1>
      <p className={Styles.muted} style={{ marginBottom: 16 }}>
        {unread} unread of {items.length}
      </p>

      {items.length === 0 ? (
        <p className={Styles.muted}>No notifications.</p>
      ) : (
        <div className={Styles.list}>
          {items.map((n) => {
            const isUnread = n.status === "unread";
            return (
              <article
                key={n._id}
                className={`${Styles.notification} ${isUnread ? Styles.notificationUnread : ""}`}
              >
                <div>
                  <h3>{n.title}</h3>
                  <p>{n.message}</p>
                  <span className={Styles.muted}>{formatDate(n.createdAt)}</span>
                </div>

                {isUnread ? (
                  <button
                    className={Styles.btn}
                    disabled={busyId === n._id}
                    onClick={() => markRead(n._id)}
                  >
                    Mark as read
                  </button>
                ) : (
                  <span className={Styles.badge}>Read</span>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default Notifications;
