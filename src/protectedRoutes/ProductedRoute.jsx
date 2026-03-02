import React, { Children } from 'react'

export default function ProductedRoute({children}) {
  const isLoggedIn = !!localStorage.getItem("token")
  return isLoggedIn ? children : <Navigate to= {"/signin"}/>
}
