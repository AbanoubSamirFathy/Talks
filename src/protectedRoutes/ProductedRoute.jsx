// import React, { Children } from 'react'

// export default function ProductedRoute({children}) {
//   const isLoggedIn = !!localStorage.getItem("token")
//   return isLoggedIn ? children : <Navigate to= {"/signin"}/>
// }

import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { authContext } from "../contexts/authContext";

export default function ProtectedRoute({ children }) {
  const { user } = useContext(authContext);

  if (!user) {
    return <Navigate to="/signup" replace />;
  }

  return children;
}
