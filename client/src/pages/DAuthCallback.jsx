import React, { useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { context } from "./Context";

const DAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setEmail, setName, setLoggedin, serverUrl } = useContext(context);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get("code");

    if (code) {
      fetch(`${serverUrl}/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "success") {
            localStorage.setItem("token", data.token);
            setLoggedin(true);
            setName(data.user.name);
            setEmail(data.user.email);
            navigate("/");
          }
        });
    }
  }, [location.search, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#10182b]">
      <div className="w-full max-w-md bg-white text-black rounded-lg shadow-lg flex flex-col items-center p-10">
        <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-xl font-extrabold mb-4 text-black text-center">
          DAuth login successful.
          <br />
          Redirecting to NF Forms...
        </h2>
      </div>
    </div>
  );
};

export default DAuthCallback;
