"use client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * Toast container used at the root of the app.
 */
export default function Toasts() {
  return <ToastContainer position="bottom-right" />;
}
