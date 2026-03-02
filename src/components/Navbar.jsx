import React, { useContext, useState, useEffect } from "react";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  Avatar,
} from "@heroui/react";
import { useNavigate, useLocation } from "react-router-dom";
import { authContext } from "../contexts/authContext";
import axios from "axios";

export default function Navbar() {
  const navigate = useNavigate();
  const { setUserToken } = useContext(authContext);
  const [user, setUser] = useState(null);
  const userToken = localStorage.getItem("token");
  const location = useLocation();

  async function getMyProfile() {
    try {
      const { data } = await axios.get(
        "https://route-posts.routemisr.com/users/profile-data",
        {
          headers: {
            token: userToken,
          },
        },
      );
      return data.data.user;
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    async function fetchProfile() {
      const userData = await getMyProfile();
      setUser(userData);
    }

    fetchProfile();
  }, []);

  function logout() {
    localStorage.removeItem("token");
    setUserToken(null);
    navigate("/signin")
  }

  return (
    <HeroUINavbar shouldHideOnScroll>
      <NavbarBrand>
        <h1 className="font-bold text-inherit">Talks</h1>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4 " justify="center">
        <NavbarItem>
          <Link
            onPress={() => navigate("/")}
            className={
              location.pathname === "/" ? "text-blue-500 font-medium" : "text-gray-900 cursor-pointer"
            }
          >
            Feed
          </Link>
        </NavbarItem>

        <NavbarItem>
          <Link
            onPress={() => navigate("/profile")}
            className={
              location.pathname === "/profile"
                ? "text-blue-500 font-medium"
                : "text-gray-900 cursor-pointer"
            }
          >
            Profile
          </Link>
        </NavbarItem>

        <NavbarItem>
          <Link
            onPress={() => navigate("/notifications")}
            className={
              location.pathname === "/notifications"
                ? "text-blue-500 font-medium"
                : "text-gray-900 cursor-pointer"
            }
          >
            Notifications
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent as="div" justify="end">
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              isBordered
              as="button"
              className="transition-transform"
              color="default"
              name={user?.name}
              size="sm"
              src={user?.photo}
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownItem key="profile" className="h-14 gap-2">
              <p className="font-semibold">Signed in as</p>
              <p className="font-semibold">{user?.email}</p>
            </DropdownItem>
            <DropdownItem key="settings">My Settings</DropdownItem>
            <DropdownItem key="logout" color="danger" onPress={logout}>
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
    </HeroUINavbar>
  );
}
