import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { apiServices } from "../services/apiServices";
import { Button, Input } from "@heroui/react";
import { EyeSlashFilledIcon } from "../components/password/EyeSlashFilledIcon";
import { EyeFilledIcon } from "../components/password/EyeFilledIcon";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addToast } from "@heroui/react";
import { ChangePasswordSchema } from "../helpers/changePasswordSchema";

export default function Profile() {
  const [user, setUser] = useState(null);
  const userToken = localStorage.getItem("token");
  const fileInputRef = useRef();
  const [selectedFile, setSelectedFile] = useState(null);
  const toggleVisibility = () => setIsVisible(!isVisible);
  const [isVisible, setIsVisible] = React.useState(false);
  const [loading, setLoading] = useState(false);

  function getInputProps(label, type, error) {
    return {
      variant: "bordered",
      label,
      type,
      isInvalid: !!error,
      errorMessage: error?.message,
      // isRequired: true,
    };
  }
  
  async function getMyProfile() {
    const user = await apiServices.getMyProfile();
    setUser(user);
  }

  useEffect(() => {
    if (userToken) {
      getMyProfile();
    }
  }, []);

  async function uploadProfilePhoto(file) {
    try {
      const formData = new FormData();
      formData.append("photo", file);

      const { data } = await axios.put(
        "https://route-posts.routemisr.com/users/upload-photo",
        formData,
        {
          headers: {
            token: userToken,
          },
        },
      );

      setUser((prev) => ({
        ...prev,
        photo: data?.data?.photo,
      }));

      setSelectedFile(null);

      console.log(data);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  }

  async function handleChangePassword(data) {
    try {
      setLoading(true);

      const payload = {
        password: data.currentPassword,
        newPassword: data.newPassword,
      };

      await apiServices.changePassword(payload);

      reset();

      addToast({
        title: "Success",
        description: "Password changed successfully",
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Error",
        description: error.response?.data?.message || "Something went wrong",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(ChangePasswordSchema),
  });

  return (
    <div className="bg-gray-500 min-h-screen">
      <div className="flex items-center gap-3 rounded p-5 bg-gray-300 w-[64%] mx-auto pt-40">
        <div className="relative w-fit">
          <img
            src={selectedFile ? URL.createObjectURL(selectedFile) : user?.photo}
            alt="user-photo"
            className="w-20 h-20 rounded-full bg-white object-cover"
          />

          <button
            onClick={() => fileInputRef.current.click()}
            className="absolute bottom-0 right-0 bg-gray-800 text-white p-2 rounded-full"
          >
            <i className="fa-solid fa-camera"></i>
          </button>

          {/* input */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setSelectedFile(file);
                uploadProfilePhoto(file);
              }
            }}
          />
        </div>

        <div>
          <h4>{user?.name}</h4>
          <div className="flex gap-3">
            <p>{user?.followingCount} Following</p>
            <p>{user?.followersCount} Followers</p>
          </div>
        </div>
      </div>

      <div className="w-[64%] mx-auto p-5">
        <h3>Personal Information:</h3>
        <p>Email: {user?.email}</p>
        <p>
          Birth Date:{" "}
          {user?.dateOfBirth ? user.dateOfBirth.slice(0, 10) : "N/A"}
        </p>
        <p className="capitalize">Gender: {user?.gender}</p>
        <div className="pt-5">
          <h3>Change your password:</h3>

          <div className="flex gap-3 items-center mt-2">
            <label>Current Password:</label>
            <div className="flex flex-col gap-2 w-[280px]">
              <Input
                {...register("currentPassword")}
                isInvalid={!!errors.currentPassword}
                errorMessage={errors.currentPassword?.message}
                type={isVisible ? "text" : "password"}
                className="w-full"
                classNames={{
                  inputWrapper:
                    "rounded-xl border border-gray-300 focus-within:border-blue-500 px-2",
                  input: "text-sm",
                }}
                endContent={
                  <button
                    type="button"
                    onClick={toggleVisibility}
                    className="flex items-center justify-center text-gray-400 hover:text-gray-600 transition"
                  >
                    {isVisible ? (
                      <EyeFilledIcon className="text-xl pointer-events-none" />
                    ) : (
                      <EyeSlashFilledIcon className="text-xl pointer-events-none" />
                    )}
                  </button>
                }
              />
            </div>
          </div>

          <div className="flex gap-3 items-center mt-2">
            <label>New Password:</label>
            <div className="flex flex-col gap-2 w-[280px]">
              <Input
                {...register("newPassword")}
                isInvalid={!!errors.newPassword}
                errorMessage={errors.newPassword?.message}
                type={isVisible ? "text" : "password"}
                className="w-full"
                classNames={{
                  inputWrapper:
                    "rounded-xl border border-gray-300 focus-within:border-blue-500 px-2",
                  input: "text-sm",
                }}
                endContent={
                  <button
                    type="button"
                    onClick={toggleVisibility}
                    className="flex items-center justify-center text-gray-400 hover:text-gray-600 transition"
                  >
                    {isVisible ? (
                      <EyeFilledIcon className="text-xl pointer-events-none" />
                    ) : (
                      <EyeSlashFilledIcon className="text-xl pointer-events-none" />
                    )}
                  </button>
                }
              />
            </div>
          </div>

          <div className="flex gap-3 items-center mt-2">
            <label>Confirm New Password:</label>
            <div className="flex flex-col gap-2 w-[280px]">
              <Input
                {...register("confirmPassword")}
                isInvalid={!!errors.confirmPassword}
                errorMessage={errors.confirmPassword?.message}
                type={isVisible ? "text" : "password"}
                className="w-full"
                classNames={{
                  inputWrapper:
                    "rounded-xl border border-gray-300 focus-within:border-blue-500 px-2",
                  input: "text-sm",
                }}
                endContent={
                  <button
                    type="button"
                    onClick={toggleVisibility}
                    className="flex items-center justify-center text-gray-400 hover:text-gray-600 transition"
                  >
                    {isVisible ? (
                      <EyeFilledIcon className="text-xl pointer-events-none" />
                    ) : (
                      <EyeSlashFilledIcon className="text-xl pointer-events-none" />
                    )}
                  </button>
                }
              />
            </div>
          </div>

          <div className="flex pt-2 gap-2">
            <Button
              onPress={handleSubmit(handleChangePassword)}
              isLoading={loading}
              className="bg-blue-500 text-white"
            >
              Save
            </Button>
            <Button
              onPress={() =>
                setPasswords({ currentPassword: "", newPassword: "" })
              }
              className="bg-red-500 text-white"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
