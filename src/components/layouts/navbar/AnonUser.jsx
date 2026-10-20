import { Link } from "react-router-dom";

const AnonUser = () => {
  return (
    <>
      <li>
        <Link to="/">Home</Link>
      </li>
      <li>
        <Link to="/courses">Courses</Link>
      </li>
      <li>
        <Link to="/lms">LMS Marketplace</Link>
      </li>
      <li>
        <Link to="/auth/register">Register</Link>
      </li>
      <li>
        <Link to="/auth/login">Login</Link>
      </li>
    </>
  );
};

export default AnonUser;
