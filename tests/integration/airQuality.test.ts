import request from "supertest";
import app from "../../src/app";
import * as waqiService from "../../src/services/waqiService";

// Mock the waqiService module
jest.mock("../../src/services/waqiService");

describe("GET /air-quality", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 Bad Request if lat and lon are missing", async () => {
    const response = await request(app).get("/air-quality");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "API Error");
    expect(response.body).toHaveProperty(
      "message",
      "Parâmetros lat e lon são obrigatórios"
    );
  });

  it("should return 200 and mapped structure when lat/lon are provided", async () => {
    // mock WAQI response
    const mockWaqiResponse = {
      aqi: 42,
      city: { name: "São Paulo" },
      dominentpol: "pm25",
      time: { iso: "2023-11-20T10:00:00Z" },
      iaqi: {
        pm25: { v: 10 },
        co: { v: 0.1 },
        t: { v: 25 },
        h: { v: 60 },
      },
    };

    (waqiService.fetchAirQualityDataFromWaqi as jest.Mock).mockResolvedValue(
      mockWaqiResponse
    );

    const response = await request(app).get("/air-quality?lat=-23.55&lon=-46.63");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      aqi: 42,
      location: "São Paulo",
      dominantPollutant: "pm25",
      lastUpdate: "2023-11-20T10:00:00Z",
      pollutants: [
        { id: "pm25", value: 10, unit: "µg/m³" },
        { id: "co", value: 0.1, unit: "ppm" },
      ],
      weather: {
        temperature: 25,
        humidity: 60,
      },
    });
  });
});
