import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Styles from "./_profile.module.css";
import { useAuth } from "../../hooks/fetchUser";
import { AuthContext } from "../../state-mgmt/contextApi";
import { errMsg } from "../../utils";

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

const UpdatedProfilePicture = ({ onSuccess }) => {
  const navigate = useNavigate();
  const { updateProfilePicture } = useContext(AuthContext);
  const { user } = useAuth();

  const [preview, setPreview] = useState(null); // base64 data URI
  const [saving, setSaving] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      e.target.value = "";
      return toast.error("Please choose an image (png, jpeg or webp)");
    }

    if (file.size > MAX_SIZE) {
      e.target.value = "";
      return toast.error("Image must be 2 MB or smaller");
    }

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.onerror = () => toast.error("Could not read the image");
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // the file may still be reading, or nothing was chosen
    if (!preview) return toast.error("Please choose an image first");

    try {
      setSaving(true);
      await updateProfilePicture(preview);
      toast.success("Profile picture updated successfully");
      setPreview(null);
      onSuccess ? onSuccess() : navigate("/user/profile");
    } catch (error) {
      toast.error(errMsg(error, "Failed to update profile picture"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <aside className={Styles.content}>
      <main className={Styles.updateForm}>
        <h1>Update profile picture</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Current picture</label>
            <img
              className={Styles.avatarPreview}
              src={user?.avatar?.url || "/avatar-placeholder.svg"}
              alt="Current avatar"
            />
          </div>

          <div className="form-group">
            <label htmlFor="avatar">Choose new picture (max 2 MB)</label>
            <input id="avatar" type="file" accept="image/*" onChange={handleFileChange} />
          </div>

          {preview && (
            <div className="form-group">
              <label>New picture preview</label>
              <img className={Styles.avatarPreview} src={preview} alt="New avatar preview" />
            </div>
          )}

          <div className="form-group">
            <button disabled={saving || !preview}>
              {saving ? "Uploading..." : "Update profile picture"}
            </button>
          </div>
        </form>
      </main>
    </aside>
  );
};

export default UpdatedProfilePicture;
