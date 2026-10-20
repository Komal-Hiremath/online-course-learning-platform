import api from "./axios";

// type: "banner" | "faq" | "categories"  (lowercase)
export const GetLayoutApi = async (type) => {
  const { data } = await api.get("/layout/get-layout", { params: { type } });
  return data;
};

// Admin only
export const CreateLayoutApi = async (payload) => {
  const { data } = await api.post("/layout/create-layout", payload);
  return data;
};

// Admin only
export const UpdateLayoutApi = async (payload) => {
  const { data } = await api.put("/layout/update-layout", payload);
  return data;
};
