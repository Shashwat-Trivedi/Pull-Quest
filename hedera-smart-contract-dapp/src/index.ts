import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import routes from "./routes";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api", routes);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    success: true, 
    message: "GitHub Issue Staking API is running",
    network: "Hedera Testnet"
  });
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`GitHub Issue Staking server running at http://localhost:${PORT}`);
  console.log(`Contract Address: ${process.env.CONTRACT_ADDRESS}`);
  console.log(`Network: Hedera Testnet`);
});