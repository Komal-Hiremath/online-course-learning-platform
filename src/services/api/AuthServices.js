import api from './axios'

// HTTP method is POST
// Response_STATUS CODE is 201
// Response status text is created 
// this global view
// must have request paylod and response has data

// api.push("users/");//need http request for creating new

export const createUser = async (payload) => {
    const { data } = await api.post("/auth/register", payload)
    console.log(data)
    return data
}


//activation service
export const ActivationServiceApi = async (payload) => {
    const { data } = await api.post("/auth/activate-user", payload)
    console.log(data)
    return data
}

export const Login = async (payload) => {
    const { data } = await api.post("/auth/login", payload)
    console.log(data)
    return data
}

//  HTTP method is GET
// Response_STATUS CODE is 200
// Response status text is ok 
// this private view
// does not have request paylod and 
// response has data

export const GetMe = async () => {
    const { data } = await api.get("/auth/me")
    return data;
}

export const Logout = async () => {
    const { data } = await api.get("/auth/logout")
    return data;
}

//  HTTP method is PUT
// Response_STATUS CODE is 200
// Response status text is ok 
// this private view
// It has request paylod  
// response has data

export const UpdateUserInfoApi = async (payload) => {
    const { data } = await api.put("/auth/update-user-info", payload)
    return data;
}

export const UpdateProfilePictureApi = async (payload) => {
    const { data } = await api.put("/auth/update-user-profile-picture", payload);
    return data;
}

export const UpdateProfilePasswordApi = async (payload) => {
    const { data } = await api.put("/auth/update-user-password", payload);
    console.log(data)
    return data;
}

