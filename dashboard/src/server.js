import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

let latestData = {};

app.post("/api/receiveData", (req, res) => {
  latestData = req.body;
  console.log("Received Data:", latestData);
  res.json({ status: "ok" });
});

app.get("/api/data", (req, res) => {
  res.json(latestData);
});

app.listen(3000, () => console.log("Server running on port 3000"));
