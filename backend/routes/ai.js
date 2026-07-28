import express from "express";
import admin from "firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { readFileSync } from "fs";

const router = express.Router();

// 1. Инициализираме Firebase Admin със ключа
const serviceAccount = JSON.parse(
  readFileSync(new URL("../serviceAccountKey.json", import.meta.url))
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// 2. Middleware за проверка дали потребителят е логнат във Firebase
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Нямате достъп! Моля, влезте в профила си." });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Потребителят е потвърден!
    next();
  } catch (error) {
    console.error("Грешка при валидиране на токен:", error);
    return res.status(403).json({ error: "Невалиден или изтекъл токен!" });
  }
};

// 3. Защитен рут за генериране на тренировка с Gemini
router.post("/generate", authenticate, async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Липсва prompt в заявката!" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    res.json({ text: responseText });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "Грешка при генериране от AI." });
  }
});

export default router;