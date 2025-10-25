import { NextFunction, Request, Response } from "express";
import { fetchAirQualityDataFromWaqi } from "../services/waqiService";
import { AirQualityData } from "../types";
import { ApiError } from "../errors/ApiError";
import { validateCoordinates } from "../utils/validators";

const POLLUTANT_UNITS: Record<string, string> = {
  pm25: "µg/m³",
  pm10: "µg/m³",
  o3: "µg/m³",
  co: "ppm",
  so2: "µg/m³",
  no2: "µg/m³",
};

export async function getAirQuality(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      throw new ApiError(400, "Parâmetros lat e lon são obrigatórios");
    }

    const coordinates = validateCoordinates(lat, lon);
    const payload = await fetchAirQualityDataFromWaqi(
      coordinates.lat,
      coordinates.lon
    );

    const data: AirQualityData = {
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

    res.json(data);
  } catch (error) {
    next(error);
  }
}
