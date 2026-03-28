import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./config/db.js";
import truthRoutes from './routes/truthRoutes.js';


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
app.use('/api/truth', truthRoutes);

app.get("/", (req, res) => {
  res.send("Server is running!");
});


const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () =>
    console.log("Server is running on PORT: " + PORT)
  );
}

export default app;