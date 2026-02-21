jest.mock("axios", () => {
  const mockGet = jest.fn();

  return {
    create: jest.fn(() => ({
      get: mockGet,
    })),
    isAxiosError: jest.fn(),
    __mockGet: mockGet, // expomos o mock
  };
});

import axios from "axios";
import { fetchAirQualityDataFromWaqi } from "../../src/services/waqiService";
import { ApiError } from "../../src/errors/ApiError";

const mockedAxios: any = axios;
const mockGet = mockedAxios.__mockGet;

describe("fetchAirQualityDataFromWaqi", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return payload when API responds ok", async () => {
    mockGet.mockResolvedValue({
      data: {
        status: "ok",
        data: { iaqi: {} },
      },
    });

    const result = await fetchAirQualityDataFromWaqi(1, 1);

    expect(result).toEqual({ iaqi: {} });
  });

  it("should throw ApiError when API status is not ok", async () => {
    mockGet.mockResolvedValue({
      data: { status: "error" },
    });

    await expect(fetchAirQualityDataFromWaqi(1, 1)).rejects.toThrow(ApiError);
  });

  it("should throw timeout error", async () => {
    mockedAxios.isAxiosError.mockReturnValue(true);

    mockGet.mockRejectedValue({
      code: "ETIMEDOUT",
      response: {},
    });

    await expect(fetchAirQualityDataFromWaqi(1, 1)).rejects.toThrow("Timeout");
  });

  it("should throw 503 when no response", async () => {
    mockedAxios.isAxiosError.mockReturnValue(true);

    mockGet.mockRejectedValue({
      response: undefined,
    });

    await expect(fetchAirQualityDataFromWaqi(1, 1)).rejects.toThrow(ApiError);
  });
});
