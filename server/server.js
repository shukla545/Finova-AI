import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./config/db.js";

import truthRoutes from './routes/truthRoutes.js';
import portfolioRoutes from "./routes/portfolioRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";
import smsAlertRoutes from "./routes/smsAlertRoutes.js";
import finPilotRoutes from "./routes/finPilotRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
 
dotenv.config();

const app = express();

// ✅
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
 
app.use(cors(corsOptions));
app.options("/{*path}", cors(corsOptions));


app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

await connectDB();


app.get("/", (req, res) => {
  res.send("Server is running!");
});



app.use('/api/truth', truthRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/sms", smsAlertRoutes);
app.use("/api/finpilot", finPilotRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/news", newsRoutes);


const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () =>
    console.log("Server is running on PORT: " + PORT)
  );
}

export default app;