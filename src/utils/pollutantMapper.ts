const POLLUTANT_UNITS: Record<string, string> = {
  pm25: "µg/m³",
  pm10: "µg/m³",
  o3: "µg/m³",
  co: "ppm",
  so2: "µg/m³",
  no2: "µg/m³",
};

export function mapPollutants(iaqi: any): any[] {
  if (!iaqi) return [];
  
  return Object.entries(iaqi)
    .filter(([key]) => key in POLLUTANT_UNITS)
    .map(([key, data]: [string, any]) => ({
      id: key,
      value: data.v,
      unit: POLLUTANT_UNITS[key],
    }));
}
