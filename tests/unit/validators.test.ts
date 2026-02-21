import { validateCoordinates } from "../../src/utils/validators";
import { ApiError } from "../../src/errors/ApiError";

describe("validateCoordinates", () => {
  it("should return parsed coordinates when valid numbers are provided", () => {
    const result = validateCoordinates(-23.55, -46.63);

    expect(result).toEqual({
      lat: -23.55,
      lon: -46.63,
    });
  });

  it("should convert string values to numbers", () => {
    const result = validateCoordinates("-23.55", "-46.63");

    expect(result).toEqual({
      lat: -23.55,
      lon: -46.63,
    });
  });

  it("should throw error when coordinates are not numbers", () => {
    expect(() => validateCoordinates("invalid", -46.63)).toThrow(ApiError);

    expect(() => validateCoordinates(-23.55, "invalid")).toThrow(
      "Coordenadas devem ser números válidos",
    );
  });

  it("should throw error when latitude is out of range", () => {
    expect(() => validateCoordinates(100, 0)).toThrow(
      "Latitude deve estar entre -90 e 90",
    );

    expect(() => validateCoordinates(-100, 0)).toThrow(ApiError);
  });

  it("should throw error when longitude is out of range", () => {
    expect(() => validateCoordinates(0, 200)).toThrow(
      "Longitude deve estar entre -180 e 180",
    );

    expect(() => validateCoordinates(0, -200)).toThrow(ApiError);
  });
});
