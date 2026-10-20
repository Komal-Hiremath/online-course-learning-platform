import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import Spinner from "../../Spinner";
import Styles from "./_adminPanels.module.css";
import {
  GetLayoutApi,
  CreateLayoutApi,
  UpdateLayoutApi,
} from "../../services/api/layoutService";
import { errMsg } from "../../utils";

const TABS = ["banner", "faq", "categories"];

// load one layout type; a missing layout is not an error (nothing created yet)
const useLayout = (type) => {
  const [state, setState] = useState({ loading: true, layout: null });

  const reload = useCallback(async () => {
    try {
      const res = await GetLayoutApi(type);
      setState({ loading: false, layout: res?.layout ?? null });
    } catch {
      setState({ loading: false, layout: null });
    }
  }, [type]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { ...state, reload };
};

const layoutExists = (layout) => Boolean(layout && Object.keys(layout).length);

// create when nothing exists yet, otherwise update. If the server disagrees
// with our guess (400/404/409) try the other call once.
const saveLayout = async (body, exists) => {
  const primary = exists ? UpdateLayoutApi : CreateLayoutApi;
  const secondary = exists ? CreateLayoutApi : UpdateLayoutApi;

  try {
    return await primary(body);
  } catch (error) {
    if ([400, 404, 409].includes(error.response?.status)) {
      return await secondary(body);
    }
    throw error;
  }
};

const useSave = (type, layout, reload) => {
  const [saving, setSaving] = useState(false);

  const save = async (body) => {
    try {
      setSaving(true);
      await saveLayout({ type, ...body }, layoutExists(layout));
      toast.success(`${type} saved`);
      await reload();
    } catch (error) {
      toast.error(errMsg(error, `Failed to save ${type}`));
    } finally {
      setSaving(false);
    }
  };

  return { saving, save };
};

/* ---------------- BANNER ---------------- */

const BannerForm = ({ layout, reload }) => {
  const banner = layout?.banner ?? layout ?? {};

  const [title, setTitle] = useState(banner.title || "");
  const [subTitle, setSubTitle] = useState(banner.subTitle || "");
  const [image, setImage] = useState(banner.image?.url || banner.image || "");
  const { saving, save } = useSave("banner", layout, reload);

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Choose an image");
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be under 5 MB");

    const reader = new FileReader();
    reader.onload = () => setImage(reader.result); // data:image/...;base64,...
    reader.readAsDataURL(file);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Title is required");
    if (!image) return toast.error("Banner image is required");

    // image: existing URL (unchanged) or a new base64 data URI
    save({ image, title: title.trim(), subTitle: subTitle.trim() });
  };

  return (
    <form className={Styles.form} onSubmit={submit}>
      <div className={Styles.field}>
        <label>Title</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className={Styles.field}>
        <label>Sub title</label>
        <textarea value={subTitle} onChange={(e) => setSubTitle(e.target.value)} />
      </div>

      <div className={Styles.field}>
        <label>Image</label>
        <input type="file" accept="image/*" onChange={onFile} />
        {image && <img className={Styles.preview} src={image} alt="Banner preview" />}
      </div>

      <div className={Styles.actions}>
        <button className={Styles.btn} disabled={saving}>
          {saving ? "Saving..." : "Save banner"}
        </button>
      </div>
    </form>
  );
};

/* ---------------- FAQ ---------------- */

const FaqForm = ({ layout, reload }) => {
  const [items, setItems] = useState(() =>
    (layout?.faq || []).map((f) => ({ question: f.question || "", answer: f.answer || "" })),
  );
  const { saving, save } = useSave("faq", layout, reload);

  const update = (i, patch) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));

  const submit = (e) => {
    e.preventDefault();
    const faq = items
      .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() }))
      .filter((f) => f.question && f.answer);

    if (!faq.length) return toast.error("Add at least one question and answer");
    save({ faq });
  };

  return (
    <form className={Styles.form} onSubmit={submit}>
      {items.map((it, i) => (
        <div className={Styles.faqBox} key={i}>
          <div>
            <input
              type="text"
              placeholder="Question"
              value={it.question}
              onChange={(e) => update(i, { question: e.target.value })}
            />
            <textarea
              placeholder="Answer"
              value={it.answer}
              onChange={(e) => update(i, { answer: e.target.value })}
            />
          </div>
          <button
            type="button"
            className={`${Styles.btn} ${Styles.btnDanger}`}
            onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
          >
            Remove
          </button>
        </div>
      ))}

      <div className={Styles.actions}>
        <button
          type="button"
          className={`${Styles.btn} ${Styles.btnGhost}`}
          onClick={() => setItems((prev) => [...prev, { question: "", answer: "" }])}
        >
          + Add question
        </button>
        <button className={Styles.btn} disabled={saving}>
          {saving ? "Saving..." : "Save FAQ"}
        </button>
      </div>
    </form>
  );
};

/* ---------------- CATEGORIES ---------------- */

const CategoriesForm = ({ layout, reload }) => {
  const [items, setItems] = useState(() =>
    (layout?.categories || []).map((c) => ({ title: c.title || "" })),
  );
  const { saving, save } = useSave("categories", layout, reload);

  const submit = (e) => {
    e.preventDefault();
    const categories = items
      .map((c) => ({ title: c.title.trim() }))
      .filter((c) => c.title);

    if (!categories.length) return toast.error("Add at least one category");
    save({ categories });
  };

  return (
    <form className={Styles.form} onSubmit={submit}>
      {items.map((it, i) => (
        <div className={Styles.itemRow} key={i}>
          <div>
            <input
              className={Styles.field}
              style={{ width: "100%", padding: "11px 13px", border: "1px solid #ccc", borderRadius: 5 }}
              type="text"
              placeholder="Category title"
              value={it.title}
              onChange={(e) =>
                setItems((prev) =>
                  prev.map((c, idx) => (idx === i ? { title: e.target.value } : c)),
                )
              }
            />
          </div>
          <button
            type="button"
            className={`${Styles.btn} ${Styles.btnDanger}`}
            onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
          >
            Remove
          </button>
        </div>
      ))}

      <div className={Styles.actions}>
        <button
          type="button"
          className={`${Styles.btn} ${Styles.btnGhost}`}
          onClick={() => setItems((prev) => [...prev, { title: "" }])}
        >
          + Add category
        </button>
        <button className={Styles.btn} disabled={saving}>
          {saving ? "Saving..." : "Save categories"}
        </button>
      </div>
    </form>
  );
};

/* ---------------- PAGE ---------------- */

const FORMS = { banner: BannerForm, faq: FaqForm, categories: CategoriesForm };

const Editor = ({ type }) => {
  const { loading, layout, reload } = useLayout(type);
  const Form = FORMS[type];

  if (loading) return <Spinner />;

  return (
    <>
      {!layoutExists(layout) && (
        <p className={Styles.muted} style={{ marginBottom: 14 }}>
          Nothing saved for {type} yet. Saving will create it.
        </p>
      )}
      {/* key re-initialises the form with fresh server data after each save */}
      <Form key={JSON.stringify(layout)} layout={layout} reload={reload} />
    </>
  );
};

const LayoutManager = () => {
  const [tab, setTab] = useState("banner");

  return (
    <section className={Styles.panel}>
      <h1>Site Layout</h1>

      <div className={Styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t}
            className={`${Styles.tab} ${tab === t ? Styles.tabActive : ""}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <Editor key={tab} type={tab} />
    </section>
  );
};

export default LayoutManager;
