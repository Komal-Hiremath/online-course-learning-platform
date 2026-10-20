import Style from "./auth.module.css";
import {useState,useContext} from "react"
import { AuthContext } from "../../state-mgmt/contextApi";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast'

const ActivationCOde = () => {
  let { ActivationUser } = useContext(AuthContext);

  let navigate = useNavigate();
  
  let [state, setState] = useState({
    activationToken: localStorage.getItem("activationToken"),
    successRes: localStorage.getItem("successRes"),
    activationCode: null,
    isLoading: false,
  });
  
  let { activationToken, successRes, isLoading, activationCode } = state;

  let handleChange = (e) => {
    const { name, value } = e.target;
    setState({ ...state, [name]: value });
  };

  let handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (successRes) {
        ActivationUser({
          activation_token: activationToken,
          activation_code: activationCode,
        });
        toast.success("user has been successfully activated account");
        navigate("/auth/login");
      }
    } catch (error) {
      toast.error("activation link has been expired or unavailable ...", error);
    }
  };

  return (
    <section id={Style.auth}>
      <article className={Style.auth_block}>
        <header>
          <h1>Activation</h1>
        </header>
        <main>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Activation Code</label>
              <input
                type="number"
                className="form-control"
                name="activationCode"
                placeholder="Enter Activation Code"
                required
                value={activationCode}
                id="activationCode"
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <button>{isLoading ? "loading " : "Activation"}</button>
            </div>
          </form>
        </main>
      </article>
    </section>
  );
};

export default ActivationCOde;