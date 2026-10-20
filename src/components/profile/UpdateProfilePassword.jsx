import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Styles from "./_profile.module.css";
import { AuthContext } from "../../state-mgmt/contextApi";
import { errMsg } from "../../utils";

const UpdateProfilePassword = ({ onSuccess }) => {
  const navigate = useNavigate();
  const { updatePassword } = useContext(AuthContext);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6)
      return toast.error("New password must be at least 6 characters");
    if (newPassword !== confirmPassword)
      return toast.error("New password and confirm password do not match");
    if (newPassword === oldPassword)
      return toast.error("New password must be different from the current one");

    try {
      setSaving(true);
      await updatePassword({ oldPassword, newPassword });
      toast.success("Password updated successfully");

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      onSuccess ? onSuccess() : navigate("/user/profile");
    } catch (error) {
      toast.error(errMsg(error, "Failed to update password"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <aside className={Styles.content}>
      <main className={Styles.updateForm}>
        <h1>Update Password</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="oldPassword">Current Password</label>
            <input
              id="oldPassword"
              type="password"
              value={oldPassword}
              placeholder="Enter current password"
              autoComplete="current-password"
              required
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              placeholder="Enter new password"
              autoComplete="new-password"
              required
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              placeholder="Re-enter new password"
              autoComplete="new-password"
              required
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Update Password"}
            </button>
          </div>
        </form>
      </main>
    </aside>
  );
};

export default UpdateProfilePassword;
