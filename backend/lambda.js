import serverless from "serverless-http";
import app from "./server.js";  
import RecipesDAO from "./dao/RecipesDAO.js";

let initialized = false;

export const handler = serverless(async (req, res) => {
  if (!initialized) {
    await RecipesDAO.injectDB();
    console.log("RecipesDAO initialized with in-memory store");
    initialized = true;
  }

  console.log("Lambda request received...");
  
  return app(req, res);
});
