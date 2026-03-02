import { Input, Button } from "@heroui/react";
import React, { useContext, useState } from "react";
import { EyeSlashFilledIcon } from "../components/password/EyeSlashFilledIcon";
import { EyeFilledIcon } from "../components/password/EyeFilledIcon";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SigninSchema } from "../helpers/SigninSchema";
import axios from "axios";
import { Alert } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { addToast } from "@heroui/react";
import { authContext } from "../contexts/authContext";

function getInputProps(label, type, error) {
  return {
    variant: "bordered",
    label,
    type,
    isInvalid: !!error,
    errorMessage: error?.message,
  };
}

export default function SignIn() {
  const [isVisible, setIsVisible] = React.useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrMsg] = useState("");
  const navigate = useNavigate();
  const { setUserToken } = useContext(authContext);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(SigninSchema),
  });

  async function signIn(formData) {
    setErrMsg("");
    setIsLoading(true);
    try {
      const { data } = await axios.post(
        "https://route-posts.routemisr.com/users/signin",
        formData,
      );
      localStorage.token = data.data.token;
      setUserToken(data.data.token);
      addToast({
        title: "Success",
        description: "Login Successefully",
        color: "success",
      });
      navigate("/feed");
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
    <form onSubmit={handleSubmit(signIn)}>
      <div className="grid gap-4">
        <div className="grid gap-3 text-center">
          <h1>Join Us Today</h1>
          <p>Create your account and start connecting</p>
        </div>
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
