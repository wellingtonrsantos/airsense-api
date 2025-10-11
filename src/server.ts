import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import axios, { AxiosError } from "axios";
import https from "https";
import { AirQualityData, ErrorResponse } from "./types";

const AQICN_TOKEN = process.env.AQICN_TOKEN;
const PORT = Number(process.env.PORT) || 3000;

const app = express();

// Criar agente HTTPS customizado
const httpsAgent = new https.Agent({
  keepAlive: false,
  timeout: 30000,
  rejectUnauthorized: true,
});

// Criar instância do axios com configurações
const axiosInstance = axios.create({
  timeout: 30000,
  httpsAgent: httpsAgent,
  family: 4, // Força IPv4
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  },
});

// Mapeamento de unidades de poluentes
const POLLUTANT_UNITS: Record<string, string> = {
  pm25: "µg/m³",
  pm10: "µg/m³",
  o3: "µg/m³",
  co: "ppm",
  so2: "µg/m³",
  no2: "µg/m³",
};

class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

async function fetchAirQualityData(
  lat: number,
  lon: number
): Promise<AirQualityData> {
  const url = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${AQICN_TOKEN}`;

  try {
    const response = await axiosInstance.get(url);
    const { status, data: payload } = response.data;

    if (status !== "ok") {
      throw new ApiError(502, "API externa retornou status inválido");
    }

    if (!payload || !payload.iaqi) {
      throw new ApiError(502, "Dados da API incompletos.");
    }

    console.log(payload);

    return {
      aqi: payload.aqi,
      location: payload.city.name,
      dominantPollutant: payload.dominentpol,
      lastUpdate: payload.time.iso,
      pollutants: Object.entries(payload.iaqi)
        .filter(([key]) => key in POLLUTANT_UNITS)
        .map(([key, data]: [string, any]) => ({
          id: key,
          value: data.v,
          unit: POLLUTANT_UNITS[key],
        })),
      weather: {
        temperature: payload.iaqi.t ? payload.iaqi.t.v : null,
        humidity: payload.iaqi.h ? payload.iaqi.h.v : null,
      },
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (
        axiosError.code === "ETIMEDOUT" ||
        axiosError.code === "ECONNABORTED"
      ) {
        throw new ApiError(504, "Timeout ao buscar dados da API externa");
      }

      if (!axiosError.response) {
        throw new ApiError(503, "API externa indisponível");
      }

      throw new ApiError(502, "Erro ao comunicar com API externa");
    }
  }

  throw new ApiError(500, "Erro interno ao processar dados");
}

function validateCoordinates(
  lat: unknown,
  lon: unknown
): { lat: number; lon: number } {
  const latitude = Number(lat);
  const longitude = Number(lon);

  if (isNaN(latitude) || isNaN(longitude)) {
    throw new ApiError(400, "Coordenadas devem ser números válidos");
  }

  if (latitude < -90 || latitude > 90) {
    throw new ApiError(400, "Latitude deve estar entre -90 e 90");
  }

  if (longitude < -180 || longitude > 180) {
    throw new ApiError(400, "Longitude deve estar entre -180 e 180");
  }

  return { lat: latitude, lon: longitude };
}

app.get("/", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "Air Quality API",
    version: "1.0.0",
  });
});

app.get(
  "/air-quality",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { lat, lon } = req.query;

      if (!lat || !lon) {
        throw new ApiError(400, "Parâmetros lat e lon são obrigatórios");
      }

      const coordinates = validateCoordinates(lat, lon);
      const data = await fetchAirQualityData(coordinates.lat, coordinates.lon);

      res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

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
