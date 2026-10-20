import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/fetchUser";
import { CourseContext } from "../state-mgmt/CourseContext";
import { GetLayoutApi } from "../services/api/layoutService";
import { thumbnailUrl } from "../utils";

import LmsCard from "../lms/LmsCard";
import Styles from "./_home.module.css";
import CourseStyles from "../courses/_course.module.css";

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { courses, getPublicCourses } = useContext(CourseContext);

  const [layout, setLayout] = useState({ banner: null, faq: [], categories: [] });

  useEffect(() => {
    // each piece is optional: one failing request must not blank the page
    Promise.allSettled([
      GetLayoutApi("banner"),
      GetLayoutApi("faq"),
      GetLayoutApi("categories"),
    ]).then(([banner, faq, categories]) => {
      const pick = (r) => (r.status === "fulfilled" ? r.value?.layout : null);
      const b = pick(banner);

      setLayout({
        banner: b?.banner ?? b ?? null,
        faq: pick(faq)?.faq || [],
        categories: pick(categories)?.categories || [],
      });
    });

    getPublicCourses().catch(() => {});
  }, []);

  const { banner, faq, categories } = layout;
  const bannerImage = banner?.image?.url || banner?.image;
  const featured = courses.slice(0, 6);

  return (
    <div className={Styles.home}>
      <section className={Styles.hero}>
        <div>
          {user && <p>Welcome back, {user.name}!</p>}
          <h1>{banner?.title || "Learn something new today"}</h1>
          <p>
            {banner?.subTitle ||
              "Browse our collection of professional courses and start learning."}
          </p>
          <Link className={Styles.cta} to="/courses">
            Explore courses
          </Link>
        </div>

        {bannerImage && <img src={bannerImage} alt={banner?.title || "Banner"} />}
      </section>

      <LmsCard />

      {categories.length > 0 && (
        <section className={Styles.section}>
          <h2>Categories</h2>
          <div className={Styles.chips}>
            {categories.map((c, i) => (
              <Link
                key={c._id || i}
                className={Styles.chip}
                to={`/courses?search=${encodeURIComponent(c.title)}`}
              >
                {c.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className={Styles.section}>
          <h2>Featured courses</h2>
          <div className={CourseStyles.courseGrid}>
            {featured.map((course) => (
              <article className={CourseStyles.courseCard} key={course._id}>
                <img src={thumbnailUrl(course.thumbnail)} alt={course.name} />
                <div className={CourseStyles.courseCardBody}>
                  <span>{course.level}</span>
                  <h2>{course.name}</h2>
                  <div className={CourseStyles.courseMeta}>
                    <strong>₹{course.price}</strong>
                    <span>⭐ {course.rating || 0}</span>
                  </div>
                  <button onClick={() => navigate(`/courses/${course._id}`)}>
                    View Course
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {faq.length > 0 && (
        <section className={`${Styles.section} ${Styles.faq}`}>
          <h2>FAQ</h2>
          {faq.map((f, i) => (
            <details key={f._id || i}>
              <summary>{f.question}</summary>
              <p>{f.answer}</p>
            </details>
          ))}
        </section>
      )}
    </div>
  );
};

export default HomePage;
