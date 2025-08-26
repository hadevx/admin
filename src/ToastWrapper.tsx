import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ToastWrapper({ children }: { children: React.ReactElement }) {
  return (
    <>
      <ToastContainer autoClose={1000} />
      {children}
    </>
  );
}

export default ToastWrapper;
