export interface AirQualityData {
  aqi: number;
  location: string;
  dominantPollutant: string;
  lastUpdate: string;
  pollutants: Polluant[];
  weather: WeatherData;
}

interface Polluant {
  id: string;
  value: number;
  unit: string;
}

interface WeatherData {
  temperature: number | null;
  humidity: number | null;
}

export interface ErrorResponse {
  error: string;
  message: string;
}
