import React from "react";
import Styles from "./_admin.module.css";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

const AdminDashboard = () => {
  return (
    <section className={Styles.adminDashboard}>
      <article className={Styles.container}>
        <aside>
          <AdminSidebar />
        </aside>

        <aside>
          <Outlet />
        </aside>
      </article>
    </section>
  );
};

export default AdminDashboard;
