import { createContext, useEffect, useState } from "react";
import {
  createUser,
  Login,
  ActivationServiceApi,
  GetMe,
  Logout,
  UpdateUserInfoApi,
  UpdateProfilePictureApi,
  UpdateProfilePasswordApi,
} from "../services/api/AuthServices";
import { deleteUser, fetchAllUsers, updateRole } from "../services/api/adminServices";


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("TOKEN"));
  const [user, setUser] = useState(null); //initial state
  const [loading, setLoading] = useState(true);
  const [AllUsers , setAllUsers] = useState(null)
  //useEffect for fetching token and based token fetch users
  //GLOBAL DATA
  // --------------------------------
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("TOKEN");
      // No token -> user is not logged in
      if (!token) {
        setUser(null);
        setAllUsers(null)
        setLoading(false);
        return;
      }

      try {
        //if token present in localstorage call GetMe function
        const response = await GetMe();
        setLoading(true);
        setUser(response?.user ?? null);
      } catch (error) {
        console.error(error.response?.data || error.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);
  /*======================== REGISTER BLOCK START HERE ========================*/

  const register = async (name, email, password) => {
    try {
      //fetch
      const { success, activationToken, activationCode, mailUrl } =
        await createUser(name, email, password);

      if (success === true) {
        localStorage.setItem("activationToken", activationToken);
        localStorage.setItem("activationCode", activationCode);
        localStorage.setItem("successRes", success);
        localStorage.setItem("mailUrl", mailUrl);
      }
    } catch (error) {
      console.error(error);
    }
  };

  /*======================== REGISTER BLOCK ENDS HERE ========================*/

  /*========================ACTIVATION USER CODE STARTS HERE ========================*/

  const ActivationUser = async (activation_token, activation_code) => {
    try {
      await ActivationServiceApi(activation_token, activation_code);
    } catch (error) {
      throw error;
    }
  };

  /*========================ACTIVATION USER CODE ENDS HERE ========================*/

  // const login = async (email, password) => {
  //   try {
  //     let { accessToken } = await Login(email, password);
  //     localStorage.setItem("TOKEN", accessToken);
  //       // IMPORTANT
  //       setToken(accessToken);
  //       const userData = await GetMe();
  //       console.log("USER DATA:", userData);
  //       setUser(userData.user);
  //     return userData.user;

  //   } catch (error) {
  //     throw error;
  //   }
  // };

  // -----------------------------------------
  // LOGIN
  // -----------------------------------------
  const login = async (email, password) => {
    try {
      const response = await Login(email, password);
      if (!response?.accessToken) {
        throw new Error("Access token was not returned by login API");
      }
      // Save token
      localStorage.setItem("TOKEN", response.accessToken);
      // Login API already returns user
      setUser(response.user ?? null);
      return response.user;
    } catch (error) {
      console.error(error.response?.data || error.message);

      throw error;
    }
  };

  /*=========================LOGOUT =======================*/
  const logout = async () => {
    let response = await Logout();
    console.log(response);
    return response;
  };

  /*----------------------PROFILE ------------------------*/
  const updateUserInfo = async (payload) => {
    let res = await UpdateUserInfoApi(payload);
    if (res?.user) {
      setUser(res.user);
    }
    return res;
  };

  /*--------------UPDATE PROFILE Picture  ----------------*/
  const updateProfilePicture = async (payload) =>{
    let res = await UpdateProfilePictureApi({avatar:payload});
  
    if(res.user){
      setUser(res.user)
    }
    return res;
  }

  const updatePassword = async (payload) => {
    let res = await UpdateProfilePasswordApi(payload);
    return res;
  };

  /*------------------ADMIN DATA -----------------*/
  const getAllUsersApi = async () => {
    let  data  = await fetchAllUsers();
    setAllUsers(data.users)
   return data;
  };

  const updateRoleApi = async(payload) =>{
    let res = await updateRole(payload);
   setUser(res.user);
    return res;
  }

  const deleteUserApi = async(id) =>{
    let res = await deleteUser(id);
    return res;
  }

  /*------------------ADMIN DATA ENDS HERE ------------------*/

  return (
    <>
      <AuthContext.Provider
        value={{
          register,
          login,
          ActivationUser,
          token,
          user,
          logout,
          updateUserInfo,
          updateProfilePicture,
          updatePassword,
          loading,
          AllUsers,
          getAllUsersApi,
          updateRoleApi,
          deleteUserApi
        }}
      >
        {children}
      </AuthContext.Provider>
    </>
  );
};