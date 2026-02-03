import React, { createContext, useState, useEffect } from "react";
export const context = createContext();

const Context = (props) => {
  const [loggedin, setLoggedin] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const serverUrl = process.env.BACKEND;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${serverUrl}/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "success") {
            setLoggedin(true);
            setName(data.user.name);
            setEmail(data.user.email);
          }
        })
        .catch(() => localStorage.removeItem("token"));
    }
  }, []);

  const value = {
    loggedin,
    setLoggedin,
    name,
    email,
    setName,
    setEmail,
    serverUrl
  };

  return <context.Provider value={value}>{props.children}</context.Provider>;
};

export default Context;
