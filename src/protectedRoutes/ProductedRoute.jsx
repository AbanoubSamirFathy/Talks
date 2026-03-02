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
