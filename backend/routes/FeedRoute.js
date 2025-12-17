import { Router } from "express";
import AuthMiddleware from "../middleware/auth.js";
import { listFeed, createFeedItem } from "../controllers/FeedController.js";

const feedRouter = Router();

feedRouter.use(AuthMiddleware);

feedRouter.get("/", listFeed);
feedRouter.post("/", createFeedItem);

export default feedRouter;
