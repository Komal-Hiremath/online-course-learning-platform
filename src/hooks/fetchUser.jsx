import { useContext } from "react";
import { AuthContext } from "../state-mgmt/contextApi";

export const useAuth = () => {
  const user = useContext(AuthContext);
  if (!user) {
    throw new Error("User is not available");
  }
  return user;
};
