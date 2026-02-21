import { mapPollutants } from "../../src/utils/pollutantMapper";

describe("pollutantMapper", () => {
  it('should map pollutants and append unit: "µg/m³" or "ppm" correctly', () => {
    // Mock WAQI payload iaqi object
    const mockIaqi = {
      pm25: { v: 15 },
      co: { v: 0.5 },
      no2: { v: 12.3 },
      invalidPollutant: { v: 99 }, // Should be filtered out
    };

    const result = mapPollutants(mockIaqi);

    expect(result).toHaveLength(3);
    
    // Check if expected items are present
    expect(result).toContainEqual({
      id: "pm25",
      value: 15,
      unit: "µg/m³",
    });

    expect(result).toContainEqual({
      id: "co",
      value: 0.5,
      unit: "ppm",
    });

    expect(result).toContainEqual({
      id: "no2",
      value: 12.3,
      unit: "µg/m³",
    });
  });

  it("should return an empty array if no known pollutants are present", () => {
    const mockIaqi = {
      unknown: { v: 1 },
      another: { v: 2 },
    };

    const result = mapPollutants(mockIaqi);

    expect(result).toEqual([]);
  });
});
