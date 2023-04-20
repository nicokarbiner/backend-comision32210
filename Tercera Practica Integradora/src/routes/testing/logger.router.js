import { Router } from "express";

const router = Router();

// 127.0.0.1:[8080|3000]&level=error
router.get("/", (req, res) => {
  const { level } = req.query;

  if (!level) return res.json("Waiting for queries.");

  if (!["debug", "http", "info", "warning", "error", "fatal"].includes(level)) {
    return res.json({ status: "error", error: "invalid query" });
  }

  req.logger[level]("testing logger");

  res.json({ result: "testing" });
});

export default router;