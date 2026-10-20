import React from "react";
import { Link } from "react-router-dom";
import Styles from "./_navbar.module.css";
import AuthNav from "./navbar/AuthNav";
import AnonUser from "./navbar/AnonUser";
import { useAuth } from "../../hooks/fetchUser";

const Navbar = () => {
  const { user } = useAuth();
  
  return (
    <section id={Styles.navbar}>
      <article className={Styles.container}>
        <aside className={Styles.logoBlock}>
          <Link to="/">Shopify</Link>
        </aside>
        <aside className={Styles.menuBlock}>
          <nav>
            <ul>{user ? <AuthNav /> : <AnonUser />}</ul>
          </nav>
        </aside>
      </article>
    </section>
  );
};

export default Navbar;
