import api from "./axios"
// HTTP method is GET
// Response status code is 200
// Response status text is Ok
// This is admin view
// does not have req payload
// respnse has no data

export const fetchAllUsers = async () => {
    let { data } = await api.get("/auth/get-all-user-dashboard");
    return data;
}

export const updateRole = async (payload) => {
    let { data } = await api.put("/auth/update-user-roles", payload);
    return data;
}

export const deleteUser = async (id) => {
    let { data } = await api.delete(`/auth/delete-user/${id}`);
    return data;
}