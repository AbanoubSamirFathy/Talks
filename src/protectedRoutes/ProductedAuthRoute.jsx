// import React, { useContext } from "react";

// export default function ProductedAuthRoute({ children }) {
//   const { userToken } = useContext(authContext);
//   const isLoggedIn = !!userToken;
//   return isLoggedIn ? children : <Navigate to={"/"} />;
// }

import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { authContext } from "../contexts/authContext";

export default function ProtectedAuthRoute({ children }) {
  const { user } = useContext(authContext); 
  return user ? children : <Navigate to="/signup" replace />;
}
