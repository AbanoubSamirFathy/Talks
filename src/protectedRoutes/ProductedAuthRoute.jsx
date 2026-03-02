import React, { useContext } from "react";

export default function ProductedAuthRoute({ children }) {
  const { userToken } = useContext(authContext);
  const isLoggedIn = !!userToken;
  return isLoggedIn ? children : <Navigate to={"/"} />;
}
