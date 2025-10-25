import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import router from "./routes";
import { ApiError } from "./errors/ApiError";
import { ErrorResponse } from "./types";

const PORT = Number(process.env.PORT) || 3000;

const app = express();

app.use(router);

// Middleware de erro global
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof ApiError) {
    const errorResponse: ErrorResponse = {
      error: "API Error",
      message: error.message,
    };

    return res.status(error.statusCode).json(errorResponse);
  }

  console.error("Erro não tratado:", error);

  const errorResponse: ErrorResponse = {
    error: "Internal Server Error",
    message: "Ocorreu um erro interno no servidor",
  };

  res.status(500).json(errorResponse);
});

// 404 handler
app.use((req: Request, res: Response) => {
  const errorResponse: ErrorResponse = {
    error: "Not Found",
    message: "Rota não encontrada",
  };

  res.status(404).json(errorResponse);
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
});
