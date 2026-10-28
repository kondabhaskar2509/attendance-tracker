import React, { useContext, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { context } from "./Context";

const DAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setEmail, setName, setLoggedin, serverUrl } = useContext(context);
  const hasFetched = useRef(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get("code");

    if (code && !hasFetched.current) {
      hasFetched.current = true;
      const isNetlify =
        typeof window !== "undefined" &&
        window.location.origin.includes("netlify.app");
      const redirectUri = isNetlify
        ? "https://attendance-app-in.netlify.app/signin"
        : process.env.REDIRECT_URI ||
          `${(
            process.env.FRONTEND ||
            (typeof window !== "undefined"
              ? window.location.origin
              : "http://localhost:5173")
          ).replace(/\/+$/, "")}/signin`;

      fetch(`${serverUrl}/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, redirect_uri: redirectUri }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "success") {
            localStorage.setItem("token", data.token);
            setLoggedin(true);
            setName(data.user.name);
            setEmail(data.user.email);
            navigate("/");
          } else {
            console.error("Sign in failed:", data.error);
            alert("Sign in failed: " + (data.error || "Unknown error"));
            navigate("/");
          }
        })
        .catch((err) => {
          console.error("Error signing in:", err);
          alert("Sign in error: " + err.message);
          navigate("/");
        });
    }
  }, [location.search, navigate, serverUrl, setEmail, setName, setLoggedin]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#10182b]">
      <div className="w-full max-w-md bg-white text-black rounded-lg shadow-lg flex flex-col items-center p-10">
        <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-xl font-extrabold mb-4 text-black text-center">
          DAuth login successful.
          <br />
          Redirecting to your app...
        </h2>
      </div>
    </div>
  );
};

export default DAuthCallback;
