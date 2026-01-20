import React, { useState } from "react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { context } from "./Context";
import { useEffect } from "react";

const Home = () => {
  const navigate = useNavigate();
  const [addsubject, setAddsubject] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [subjectname, setSubjectname] = useState("");
  const { loggedin, email, serverUrl } = useContext(context);

  const DAUTH_CLIENT_ID = "8c6Bna.YrZM1M8GC";
  const DAUTH_REDIRECT_URI = "http://localhost:5173/signin";
  const DAUTH_SCOPE = "email openid profile user";
  const DAUTH_AUTH_URL = "https://auth.delta.nitt.edu/authorize";

  function generateRandomString(length = 16) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  const state = generateRandomString(12);
  const nonce = generateRandomString(12);

  const dauthUrl = `${DAUTH_AUTH_URL}?client_id=${encodeURIComponent(
    DAUTH_CLIENT_ID
  )}&redirect_uri=${encodeURIComponent(
    DAUTH_REDIRECT_URI
  )}&response_type=code&grant_type=authorization_code&scope=${encodeURIComponent(
    DAUTH_SCOPE
  )}&state=${state}&nonce=${nonce}`;

  const calculatePercentage = (attendance) => {
    if (!Array.isArray(attendance)) return 0;
    let total = 0;
    let present = 0;
    attendance.forEach((a) => {
      const weight = a.extra ? 2 : 1;
      total += weight;
      if (a.status === "present") present += weight;
    });
    return total === 0 ? 0 : Math.round((present / total) * 100);
  };

  const handleSave = async () => {
    if (subjectname.trim()) {
      await fetch(`${serverUrl}/addsubject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ email, subjectname }),
      });

      setSubjectname("");
      setAddsubject(false);
    }
  };

  useEffect(() => {
    const fetchsubjects = async () => {
      if (!loggedin || !email) return;

      await fetch(`${serverUrl}/fetchsubjects/${email}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setSubjects(data);
        });
    };

    fetchsubjects();
  }, [loggedin, email, subjectname]);

  return (
    <>
      {loggedin ? (
        <div className="flex justify-center items-center">
          <div className="w-full max-w-md ">
            {subjects.map((subject) => (
              <div
                onClick={() =>
                  navigate(`/subject/${subject.subject_name}/${subject.id}`)
                }
                className="flex justify-between items-center m-2 rounded-md p-3 text-xl font-semibold bg-gray-300 hover:bg-gray-200 cursor-pointer"
                key={subject.id}>
                {subject.subject_name}
                <div className="w-12 h-12 rounded-full bg-white border-4 border-blue-500 flex items-center justify-center text-sm font-bold text-black">
                  {calculatePercentage(subject.attendance)}%
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setAddsubject(true)}
            className="fixed bottom-3 right-3  text-5px p-2 font-medium bg-blue-200 hover:bg-gray-300 rounded-xl">
            Add Subject
          </button>
          {addsubject && (
            <div className="fixed inset-0 bg-opacity-50 bg-black flex items-center justify-center">
              <div className="bg-white p-5 rounded-lg flex-col w-60 h-auto">
                <h2 className="font-bold text-2xl flex justify-center mb-2">
                  Subject Name
                </h2>
                <input
                  type="text"
                  value={subjectname}
                  onChange={(e) => setSubjectname(e.target.value)}
                  placeholder="Subject Name"
                  className="w-full p-2 mb-4 bg-gray-200 border border-black rounded focus:outline-none focus:border-blue-500"
                />
                <div className="flex justify-end ">
                  <button
                    onClick={() => setAddsubject(false)}
                    className="p-2 rounded-md mr-2 bg-gray-400">
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="p-2 rounded-md mr-1 bg-blue-400">
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="fixed inset-0  flex justify-center items-center ">
          <div className="grid">
            <h1 className="text-4xl mb-4 font-bold">Attendance Tracker</h1>
            <button
              onClick={() => {
                window.location.href = dauthUrl;
              }}
              className="bg-blue-500 rounded-md p-2 hover:bg-blue-300">
              {" "}
              Login with DAuth{" "}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
