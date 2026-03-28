import express from "express";
import cors from "cors";
import newsRoutes from "./routes/newsRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Finance News Dashboard API running");
});

app.use("/api/news", newsRoutes);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});