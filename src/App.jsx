import "./App.css";
import { HeroUIProvider } from "@heroui/react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Feed from "./pages/Feed";
import NotFound from "./pages/NotFound";
import PostDetails from "./pages/PostDetails";
import Profile from "./pages/Profile";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import { ToastProvider } from "@heroui/toast";
import AuthContextProvider from "./contexts/authContext";
import ProtectedRoute from "./protectedRoutes/ProductedRoute";

const router = createBrowserRouter([
  {
    path: "",
    element: <MainLayout />,
    children: [
      { index: true, element: <ProtectedRoute><Feed /></ProtectedRoute> },
      { path: "profile", element: <ProtectedRoute><Profile /></ProtectedRoute> },
      { path: "feed", element: <ProtectedRoute><Feed /></ProtectedRoute>},
      { path: "*", element: <ProtectedRoute><NotFound /></ProtectedRoute> },
      { path: "/postDetails/:id", element: <ProtectedRoute><PostDetails /></ProtectedRoute> },
    ],
  },
  {
    path: "",
    element: <AuthLayout />,
    children: [
      { path: "signin", element: <SignIn /> },
      { path: "signup", element: <SignUp /> },
    ],
  },
]);

export default function App() {
  return (
    <AuthContextProvider>
      <HeroUIProvider>
        <ToastProvider />
        <RouterProvider router={router} />
      </HeroUIProvider>
    </AuthContextProvider>
  );
}
