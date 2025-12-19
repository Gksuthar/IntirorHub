import { Router } from "express";
import AuthMiddleware from "../middleware/auth.js";
import { listSites, createSite, updateContractValue } from "../controllers/SiteController.js";

const siteRouter = Router();

siteRouter.use(AuthMiddleware);


siteRouter.get("/", listSites);
siteRouter.post("/", createSite);
// Admin: update contract value
siteRouter.put("/:siteId/contract-value", updateContractValue);

export default siteRouter;
