import { Router } from "express";
import { getAirQuality } from "./controllers/airQualityController";

const router = Router();

router.get("/air-quality", getAirQuality);

router.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Air Quality API",
    version: "1.0.0",
  });
});

export default router;
