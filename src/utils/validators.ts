import { ApiError } from "../errors/ApiError";

export function validateCoordinates(
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
