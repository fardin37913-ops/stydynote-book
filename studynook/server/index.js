const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion } = require("mongodb");

const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://localhost:5177",
  "http://localhost:5178",
  "http://localhost:5179",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (/^http:\/\/localhost:\d+$/.test(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

const uri = process.env.MONGO_URI;

if (!uri) {
  console.error("MongoDB URI is missing. Please add MONGO_URI in server/.env file.");
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const db = client.db("studynookDB");
    app.locals.db = db;

    app.use("/api/auth", authRoutes);
    app.use("/api/rooms", roomRoutes);
    app.use("/api/bookings", bookingRoutes);

    app.get("/", (req, res) => {
      res.send("StudyNook server is running successfully.");
    });

    app.get("/health", (req, res) => {
      res.status(200).json({
        success: true,
        message: "Server and database connected successfully.",
      });
    });

    app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: "API route not found.",
      });
    });

    app.listen(port, () => {
      console.log(`StudyNook server running on port ${port}`);
    });
  } catch (error) {
    console.error("Server connection error:", error.message);
  }
}

run();