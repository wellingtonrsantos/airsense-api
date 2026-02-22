import { NextFunction, Request, Response } from "express";
import { fetchAirQualityDataFromWaqi } from "../services/waqiService";
import { AirQualityData } from "../types";
import { ApiError } from "../errors/ApiError";
import { validateCoordinates } from "../utils/validators";

import { mapPollutants } from "../utils/pollutantMapper";

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
    
    const start = performance.now();
    const payload = await fetchAirQualityDataFromWaqi(
      coordinates.lat,
      coordinates.lon
    );
    const end = performance.now();
    console.log(`[Metrics] WAQI_External_Call overhead: ${(end - start).toFixed(2)} ms`);

    const data: AirQualityData = {
      aqi: payload.aqi,
      location: payload.city.name,
      dominantPollutant: payload.dominentpol,
      lastUpdate: payload.time.iso,
      pollutants: mapPollutants(payload.iaqi),
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
