import { Router,Request, Response } from "express";

import { handleInputErrors } from "../middlewares/validation";
import { body, param } from "express-validator";

const router = Router();

router.get("/video-carpo", 
  (req: Request, res: Response) => {
    res.redirect(process.env.URL_VIDEO);
  }
);

export default router