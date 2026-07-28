import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import aiRoutes from "./routes/ai.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Разрешаваме CORS заявки от нашия фронтенд
app.use(cors());
app.use(express.json());

// Маршрути
app.use("/api", aiRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Бекендът работи на http://localhost:${PORT}`);
});