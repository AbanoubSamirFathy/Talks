import { Input, Select, SelectItem, Button } from "@heroui/react";
import React, { useState } from "react";
import { EyeSlashFilledIcon } from "../components/password/EyeSlashFilledIcon";
import { EyeFilledIcon } from "../components/password/EyeFilledIcon";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignupSchema } from "../helpers/SignupSchema";
import axios from "axios";
import { Alert } from "@heroui/react";
import { Link, useNavigate } from "react-router-dom";
import { addToast } from "@heroui/react";

function getInputProps(label, type, error) {
  return {
    variant: "bordered",
    label,
    type,
    isInvalid: !!error,
    errorMessage: error?.message,
  };
}

export default function SignUp() {
  const [isVisible, setIsVisible] = React.useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrMsg] = useState("");

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(SignupSchema),
  });

  async function signUp(formData) {
    setErrMsg("");
    setIsLoading(true);
    try {
      const { data } = await axios.post(
        "https://route-posts.routemisr.com/users/signup",
        formData,
      );
      localStorage.token = data.data.token;
      addToast({
        title: "Success",
        description: "Account created successfully",
        color: "success",
      });
      navigate("/signin");
    } catch (error) {
      if (error.response) {
        setErrMsg(error.response.data.error);
      } else {
        setErrMsg(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(signUp)}>
      <div className="grid gap-4">
        <div className="grid gap-3 text-center">
          <h1>Join Us Today</h1>
          <p>Create your account and start connecting</p>
        </div>
        <Input
          {...register("name")}
          {...getInputProps("Full Name", "text", errors.name)}
        />
        <Input
          {...register("email")}
          {...getInputProps("Email", "email", errors.email)}
        />
        <Input
          {...register("password")}
          {...getInputProps(
            "Password",
            isVisible ? "text" : "password",
            errors.password,
          )}
          endContent={
            <button
              aria-label="toggle password visibility"
              className="focus:outline-solid outline-transparent"
              type="button"
              onClick={toggleVisibility}
            >
              {isVisible ? (
                <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
              ) : (
                <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
              )}
            </button>
          }
        />
        <Input
          {...register("rePassword")}
          {...getInputProps(
            "Confirm Password",
            isVisible ? "text" : "password",
            errors.rePassword,
          )}
        />
        <Input
          {...register("dateOfBirth")}
          {...getInputProps("Birth Date", "date", errors.dateOfBirth)}
        />
        <Select
          {...register("gender")}
          {...getInputProps("Gender", undefined, errors.gender)}
        >
          <SelectItem key="male">Male</SelectItem>
          <SelectItem key="female">Female</SelectItem>
        </Select>
        <div className="flex gap-2">
          <p>Have an account?</p>
          <Link to="/signin" className="text-blue-500">Sign In</Link>
        </div>
        <Button isLoading={isLoading} color="primary" type="submit">
          Submit
        </Button>
        {errorMsg && (
          <Alert
            color="danger"
            hideIcon
            title={errorMsg}
            classNames="py-0 capitalize text-center"
          />
        )}
      </div>
    </form>
  );
}
