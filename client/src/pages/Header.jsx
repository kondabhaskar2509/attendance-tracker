import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex justify-between items-center bg-blue-200">
      <button onClick={() => navigate("/")} className="text-3xl font-bold p-2">
        Attendance Tracker
      </button>
      {location.pathname != "/profile" && (
        <button
          onClick={() => navigate("/profile")}
          className="m-2 w-10 h-10 bg-gray-200 hover:bg-red-200 border rounded-full text-center font-bold  border-black">
          P
        </button>
      )}
    </div>
  );
};

export default Header;
