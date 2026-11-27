import { useContext, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Styles from "./_admin.module.css";
import toast from "react-hot-toast";
import { AuthContext } from "../../state-mgmt/contextApi";

const SingleUser = () => {
  const navigate = useNavigate();
  let { updateRoleApi } = useContext(AuthContext);
  let { id } = useParams();
  const [role, setRole] = useState("");

  let handleSubmit = (e) => {
    e.preventDefault();
    try {
      const res = updateRoleApi({ id, role });
      toast.success("successfully Role has been updated");
      navigate("/admin/admin-dashboard");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <aside className={Styles.content}>
      <main className={Styles.updateForm}>
        <h1>update profile</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Role</label>
            <input
              type="text"
              value={role}
              placeholder="enter role"
              required
              onChange={(e) => setRole(e.target.value)}
            />
          </div>
          <div className="form-group">
            <button>update Role</button>
          </div>
        </form>
      </main>
    </aside>
  );
};

export default SingleUser;
