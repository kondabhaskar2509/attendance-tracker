import React from "react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { context } from "./Context";

const Profile = () => {
  const { name, email, setLoggedin, setName, setEmail } = useContext(context);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    setLoggedin(false);
    setName("");
    setEmail("");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-[80vw] h-[40vh] rounded-md m-5 bg-white shadow-sm shadow-black flex flex-col">
        <h1 className="text-5xl font-bold text-center m-2">Profile</h1>
        <h1 className="text-xl m-2 font-medium ">
          <span className="text-blue-500"> Hello , </span> {name}
        </h1>
        <span className="text-xl m-2 font-medium">
          {" "}
          <span className="text-blue-500">Email :</span> {email}{" "}
        </span>
        <div className="flex justify-center mt-auto mb-5">
          <button
            onClick={logout}
            className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
