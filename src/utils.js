// Shared helpers

export const PLACEHOLDER_IMG = "/course-placeholder.svg";

// API returns thumbnail as { public_id, url }; older data may be a plain string
export const thumbnailUrl = (thumbnail) =>
  (typeof thumbnail === "string" ? thumbnail : thumbnail?.url) || PLACEHOLDER_IMG;

// tags can be "a, b, c" or ["a","b"]
export const tagsToString = (tags) =>
  Array.isArray(tags) ? tags.join(", ") : String(tags ?? "");

// Extract an id from a string or a populated object
export const idOf = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id ? String(value._id) : "";
};

// Turn a YouTube / Vimeo link into an embeddable URL. Returns null for other links.
export const toEmbedUrl = (url = "") => {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return `https://www.youtube.com/embed${u.pathname}`;
    if (host.endsWith("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      if (u.pathname.startsWith("/embed/")) return url;
    }
    if (host === "vimeo.com") return `https://player.vimeo.com/video${u.pathname}`;
  } catch {
    /* not a valid URL */
  }
  return null;
};

export const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString();
};

export const errMsg = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;
