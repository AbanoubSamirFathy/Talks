import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { authContext } from "../contexts/authContext";

export default function ProtectedAuthRoute({ children }) {
  const { user } = useContext(authContext); 
  return user ? children : <Navigate to="/signup" replace />;
}
