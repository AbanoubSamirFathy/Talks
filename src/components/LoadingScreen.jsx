import {Spinner} from "@heroui/react";

export default function LoadingScreen() {
  return <Spinner color="default" label="Loading..." className="w-full mx-auto bg-gray-500 overflow-hidden min-h-screen"/>;
}
