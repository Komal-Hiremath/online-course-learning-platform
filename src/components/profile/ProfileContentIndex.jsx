import { useAuth } from "../../hooks/fetchUser";
import Styles from "./_profile.module.css";
import MyLearning from "./MyLearning";

const ProfileContentIndex = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <div>
      <aside className={Styles.content}>
        <main>
          <div>
            <strong>Email</strong>
            <span>{user?.email}</span>
          </div>

          <div>
            <strong>Role</strong>
            <span>{user?.role}</span>
          </div>
        </main>
      </aside>

      {/* admins don't buy courses */}
      {!isAdmin && (
        <aside className={Styles.content}>
          <MyLearning />
        </aside>
      )}
    </div>
  );
};

export default ProfileContentIndex;
