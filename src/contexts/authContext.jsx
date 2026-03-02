import { createContext, useEffect, useState } from "react";
import { apiServices } from "../services/apiServices";

export const authContext = createContext(0);

export default function AuthContextProvider({ children }) {
  const [userToken, setUserToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);

  async function getMyProfile() {
    const user = await apiServices.getMyProfile()
    setUser(user);
  }

  useEffect(() => {
    if (userToken) {
      getMyProfile();
    }
  }, []);

  return (
    <authContext.Provider value={{ userToken, setUserToken, user }}>
      {children}
    </authContext.Provider>
  );
}
