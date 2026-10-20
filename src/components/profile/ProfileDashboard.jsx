import { Outlet } from "react-router-dom";

import ProfileSidebar from "./ProfileSidebar";
import Styles from "./_profile.module.css";

/*
  Layout for everything under /user/profile.
  Before, this file contained the "My Learning" list and had no <Outlet />,
  so the nested pages (update info / picture / password / course content)
  could never render. The list now lives in MyLearning.jsx.
*/
const ProfileDashboard = () => {
  return (
    <section className={Styles.profileDashboard}>
      <div className={Styles.container}>
        <ProfileSidebar />

        <div className={Styles.main}>
          <Outlet />
        </div>
      </div>
    </section>
  );
};

export default ProfileDashboard;
