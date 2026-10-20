import { useSearchParams } from "react-router-dom";

import Styles from "./_profile.module.css";
import UpdateProfileInfo from "./UpdateProfileInfo";
import UpdatedProfilePicture from "./UpdatedProfilePicture";
import UpdateProfilePassword from "./UpdateProfilePassword";

const TABS = [
  { key: "info", label: "Profile Info" },
  { key: "picture", label: "Profile Picture" },
  { key: "password", label: "Password" },
];

// stay on this page after saving (the standalone pages navigate away instead)
const stay = () => {};

// /user/profile/settings            -> Profile Info
// /user/profile/settings?tab=password
const ProfileSettings = () => {
  const [params, setParams] = useSearchParams();
  const requested = params.get("tab");
  const tab = TABS.some((t) => t.key === requested) ? requested : "info";

  return (
    <div className={Styles.settings}>
      <h2>Profile Settings</h2>

      <div className={Styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`${Styles.tab} ${tab === t.key ? Styles.tabActive : ""}`}
            onClick={() => setParams({ tab: t.key })}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "info" && <UpdateProfileInfo onSuccess={stay} />}
      {tab === "picture" && <UpdatedProfilePicture onSuccess={stay} />}
      {tab === "password" && <UpdateProfilePassword onSuccess={stay} />}
    </div>
  );
};

export default ProfileSettings;
