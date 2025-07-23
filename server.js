import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import uploadedroutes from "./routes/uploadRoutes.js";
import mergeRoutes from "./routes/imageMergeRoutes.js";
// dotenv.config();
import path from "path"
import { fileURLToPath } from "url";
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ['https://www.chatrarifle.com','https://chatra-rifles.vercel.app','http://localhost:3000'],
}));
app.use(express.json());

app.use("/api", uploadedroutes);
// Serve merged image
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/merged', express.static(path.join(__dirname, 'merged-output')));

// Routes
app.use('/api', mergeRoutes);

app.get("/", (req,res) =>
  res.send("Welcome to the Image Upload API")
);
app.listen(3000, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log('MongoDB connected');

//   })
//   .catch((err) => {
//     console.error('MongoDB connection failed:', err.message);
//   });
