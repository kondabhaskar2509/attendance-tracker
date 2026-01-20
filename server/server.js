import express from "express";
import cors from "cors";
import "dotenv/config";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = 5000;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

import { createClient } from "@supabase/supabase-js";
const supabase = createClient(supabaseUrl, supabaseKey);

const TABLES = {
  login: `create table if not exists login (
        id serial primary key,
        name text not null,
        email text unique not null,
        created_at timestamptz default now() 
    );`,
  subjects: `create table if not exists subjects (
        id serial primary key,
        email text not null,
        subject_name text not null,
        attendance jsonb ,
        created_at timestamptz default now()
   );`,
};

async function createTables() {
  try {
    if (!supabase) return;
    for (const key in TABLES) {
      const { error } = await supabase.rpc("execute_sql", {
        sql: TABLES[key],
      });
      if (error) throw error;
    }
    console.log("tables created succesfully");
  } catch (e) {
    console.log("error creating tables :", e.message);
  }
}

(async () => {
  if (supabase) await createTables();
  app.locals.supabase = supabase;
  app.locals.tables = { login: "login", subjects: "subjects" };

  app.post("/addsubject", authenticateToken, async (req, res) => {
    const { email, subjectname } = req.body;
    const { error } = await supabase
      .from("subjects")
      .insert([{ email: email, subject_name: subjectname }]);
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ status: "success" });
  });

  app.post("/deletesubject", authenticateToken, async (req, res) => {
    const { id } = req.body;
    const { error } = await supabase.from("subjects").delete().eq("id", id);
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ status: "success" });
  });

  app.get("/fetchsubjects/:email", authenticateToken, async (req, res) => {
    const { email } = req.params;
    const { data, error } = await supabase
      .from("subjects")
      .select("id, subject_name, attendance")
      .eq("email", email);
    if (error) return res.status(400).json({ error: error.message });
    return res.json(data || []);
  });

  app.get("/fetchattendance/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("subjects")
      .select("attendance")
      .eq("id", id);
    if (error) return res.status(400).json({ error: error.message });
    return res.json(data?.[0]?.attendance || []);
  });

  app.post("/changeattendance", authenticateToken, async (req, res) => {
    const { id, attendance } = req.body;

    const { error } = await supabase
      .from("subjects")
      .update({ attendance })
      .eq("id", id);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ status: "success" });
  });

  app.get("/verify", authenticateToken, (req, res) => {
    res.json({ status: "success", user: req.user });
  });

  app.post("/signin", async (req, res) => {
    try {
      const { code } = req.body;
      const tokenresponse = await fetch(
        "https://auth.delta.nitt.edu/api/oauth/token",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            grant_type: "authorization_code",
            code: code,
            redirect_uri: "http://localhost:5173/signin",
          }),
        }
      );
      const tokendata = await tokenresponse.json();

      const userresponse = await fetch(
        "https://auth.delta.nitt.edu/api/resources/user",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokendata.access_token}`,
          },
        }
      );
      const userdata = await userresponse.json();

      if (userdata && userdata.email && userdata.name) {
        const { error } = await supabase
          .from("login")
          .insert([{ name: userdata.name, email: userdata.email }]);

          if (error && error.code !== "23505") {
            console.error("Error inserting user data:", error);
          }

        const token = jwt.sign(
          { name: userdata.name, email: userdata.email },
          JWT_SECRET
        );

        return res.json({
          status: "success",
          token,
          user: { name: userdata.name, email: userdata.email },
        });
      } else {
        return res
          .status(400)
          .json({ status: "error", error: "Invalid user data from DAuth" });
      }
    } catch (e) {
      res.status(500).json({ status: "error", error: e.message });
    }
  });

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
})();
