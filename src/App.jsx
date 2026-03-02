// import "./App.css";
// import { HeroUIProvider } from "@heroui/react";
// import { RouterProvider, createBrowserRouter } from "react-router-dom";
// import Feed from "./pages/Feed";
// import NotFound from "./pages/NotFound";
// import PostDetails from "./pages/PostDetails";
// import Profile from "./pages/Profile";
// import SignIn from "./pages/SignIn";
// import SignUp from "./pages/SignUp";
// import MainLayout from "./layouts/MainLayout";
// import AuthLayout from "./layouts/AuthLayout";

// const router = createBrowserRouter([
//   {
//     path: "",
//     element: <MainLayout />,
//     children: [
//       { index: true, element: <Feed /> },
//       { path: "profile", element: <Profile /> },
//       { path: "postdetails", element: <PostDetails /> },
//       { path: "*", element: <NotFound /> },
//     ],
//   },
//   {
//     path: "",
//     element: <AuthLayout />,
//     children: [
//       { path: "signin", element: <SignIn /> },
//       { path: "signup", element: <SignUp /> },
//     ],
//   },
// ]);

// function App() {
//   return (
//     <>
//       <HeroUIProvider>
//         <RouterProvider router={router} />
//       </HeroUIProvider>

//     </>
//   );
// }

// export default App;

// // export default function App() {
// //   return <h1 style={{ color: "red", fontSize: "40px" }}>APP WORKS</h1>;
// // }

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

const router = createBrowserRouter([
  {
    path: "",
    element: <MainLayout />,
    children: [
      { index: true, element: <Feed /> },
      { path: "profile", element: <Profile /> },
      { path: "feed", element: <Feed /> },
      { path: "*", element: <NotFound /> },
      { path: "/postDetails/:id", element: <PostDetails /> },
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
