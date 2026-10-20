import { Link } from "react-router-dom";
import S from "./lms.module.css";

// The "LMS Marketplace" entry card (used on the home page)
const LmsCard = () => (
  <section className={S.lmsCard}>
    <div>
      <h2>LMS Marketplace</h2>
      <p>
        Browse published courses, wishlist favourites, watch lectures with saved progress and
        earn certificates. Instructors can publish courses; admins manage the marketplace.
      </p>
    </div>
    <Link className={S.btn} to="/lms">
      Open LMS Marketplace
    </Link>
  </section>
);

export default LmsCard;
