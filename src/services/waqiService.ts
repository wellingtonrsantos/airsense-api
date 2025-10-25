import axios, { AxiosError } from "axios";
import https from "https";
import { ApiError } from "../errors/ApiError";

const AQICN_TOKEN = process.env.AQICN_TOKEN;

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

export async function fetchAirQualityDataFromWaqi(
  lat: number,
  lon: number
): Promise<any> {
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

    return payload;
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
    throw new ApiError(500, "Erro interno ao processar dados");
  }
}
