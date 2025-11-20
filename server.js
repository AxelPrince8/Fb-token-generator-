import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
app.use(cookieParser());
app.use(express.static("public"));

const FB_APP_ID = process.env.FB_APP_ID;
const FB_APP_SECRET = process.env.FB_APP_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI; // e.g. https://yourapp.onrender.com/callback

// Step 1: Send user to Facebook Login
app.get("/login", (req, res) => {
  const url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${FB_APP_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=public_profile,email&response_type=code`;

  res.redirect(url);
});

// Step 2: Facebook sends ?code=XXX
app.get("/callback", async (req, res) => {
  const { code } = req.query;

  const tokenURL = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${FB_APP_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&client_secret=${FB_APP_SECRET}&code=${code}`;

  const tokenResponse = await fetch(tokenURL);
  const tokenData = await tokenResponse.json();

  // tokenData.access_token is the token
  res.send(`
    <h1>Facebook Token:</h1>
    <textarea style="width:100%;height:150px;">${tokenData.access_token}</textarea>
    <br><br>
    <a href="/">Go Back</a>
  `);
});

app.listen(3000, () => console.log("Server running on 3000"));
