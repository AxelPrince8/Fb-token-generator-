import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// Fix __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cookieParser());

// Public folder serve (index.html, privacy.html, delete.html)
app.use(express.static(path.join(__dirname, "public")));

const FB_APP_ID = process.env.FB_APP_ID;
const FB_APP_SECRET = process.env.FB_APP_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

// Step 1: Send user to Facebook Login
app.get("/login", (req, res) => {
  const url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${FB_APP_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=public_profile,email&response_type=code`;

  res.redirect(url);
});

// Step 2: Facebook sends back code
app.get("/callback", async (req, res) => {
  const { code } = req.query;

  const tokenURL = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${FB_APP_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&client_secret=${FB_APP_SECRET}&code=${code}`;

  const tokenResponse = await fetch(tokenURL);
  const tokenData = await tokenResponse.json();

  res.send(`
    <h1>Facebook Token:</h1>
    <textarea style="width:100%;height:150px;">${tokenData.access_token || "Error: " + JSON.stringify(tokenData)}</textarea>
    <br><br>
    <a href="/">Go Back</a>
  `);
});

// Privacy policy page
app.get("/privacy", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "privacy.html"));
});

// Data deletion page
app.get("/delete", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "delete.html"));
});

// Run server
app.listen(3000, () => console.log("Server running on 3000"));
