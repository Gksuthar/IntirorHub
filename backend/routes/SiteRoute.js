import { Router } from "express";
import AuthMiddleware from "../middleware/auth.js";
import { listSites, createSite } from "../controllers/SiteController.js";

const siteRouter = Router();

siteRouter.use(AuthMiddleware);

siteRouter.get("/", listSites);
siteRouter.post("/", createSite);

export default siteRouter;
