import express from 'express';
import { renderChat } from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/", renderChat);

export default router;