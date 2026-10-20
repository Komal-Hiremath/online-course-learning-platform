import api from "./axios";

export const CreateOrderApi = async (payload) => {
    const { data } = await api.post("/order/create-order", payload);
    return data;
};

export const GetAllOrdersApi = async () => {
    const { data } = await api.get("/order/get-all-order-dashboard");
    return data;
};