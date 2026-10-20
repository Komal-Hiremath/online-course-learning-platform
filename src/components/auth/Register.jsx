import Style from "./auth.module.css";
import {useState,useContext} from "react"
import { AuthContext } from "../../state-mgmt/contextApi";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast'

const Register = () => {
    let {register}=useContext(AuthContext)
    let [mailUrl,setMailUrl]=useState(localStorage.getItem("mailUrl"))

    const navigate=useNavigate()
    
    let [state,setState]=useState({
        name:"",
        email:"",
        password:"",
        isLoading:false,
    });

    let {name,email,password,isLoading}=state;

    let handleChange=e=>{
        const {name,value}=e.target
        setState({...state,[name]:value})
    }

    let handleSubmit=async(e)=>{
        e.preventDefault();
        try{
            let payload={name,email,password}
            setState({isLoading:true})
            await register(payload)
            toast.success(`Successfully email has been sent to ${email}`)
            navigate("/auth/activate")
            // window.location.assign(mailUrl)
            window.open(mailUrl, "_blank");
        }
        catch(error){
            console.error(error)
            toast.error("Something went wrong")
        }
        finally{
            setState({isLoading:false,name:"",email:"",password:""})
        }
    }

    return (
    <section id={Style.auth}>
        <article className={Style.auth_block}>
        <header>
            <h1>Register</h1>
        </header>
        <main>
        <form onSubmit={handleSubmit}>
            <div className={Style.form_group}>
                <label htmlFor="name">Name</label>
                <input
                type="text"
                className="form-control"
                name="name"
                placeholder="Enter name"
                required
                value={name}
                id="name"
                onChange={handleChange}/>
            </div>

            <div className={Style.form_group}>
                <label htmlFor="email">Email</label>
                <input
                type="email"
                className="form-control"
                name="email"
                placeholder="Enter email"
                required
                value={email}
                id="email"
                onChange={handleChange}/>

            </div>

            <div className={Style.form_group}>
                <label htmlFor="password">Password</label>
                <input
                type="password"
                className="form-control"
                name="password"
                placeholder="Enter password"
                required
                value={password}
                id="password"
                onChange={handleChange}/>
            </div>

            <div className={Style.form_group}>
            <button>{isLoading ? 'loading ' : "Register"}</button>
            </div>
            </form>
        </main>
        </article>
    </section>
);
};

export default Register;
