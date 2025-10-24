import express from "express";

const app = express();

app.get("/test", (req, res) => {
  res.json({ message: "Server is working!" });
});

const PORT = 5000;
const server = app.listen(PORT, () => {
  console.log(`Simple server running on port ${PORT}`);
});

server.on("error", (err) => {
  console.error("Server error:", err);
});
