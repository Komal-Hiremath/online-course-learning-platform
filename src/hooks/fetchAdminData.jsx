import { useContext } from "react";
import { AuthContext } from "../state-mangement/contextApi";

export const useAdmin = async () => {
  const adminUsers = await useContext(AuthContext);
  if (!adminUsers) {
    throw new Error("user is not available");
  }
  return adminUsers;
};
