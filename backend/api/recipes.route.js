import express from "express";
import RecipesController from "./recipes.controller.js";
import FavoritesController from "./favorites.controller.js";

const router = express.Router();
router.route("/").get(RecipesController.apiGetAllRecipes);
router.route("/").post(RecipesController.apiAddRecipe);

router.route("/search").get(RecipesController.apiSearchRecipes);
  
router
  .route("/favorites/:userId/:recipeId")
  .delete(FavoritesController.apiRemoveFavorite);

router
  .route("/favorites")
  .post(FavoritesController.apiAddFavorite);
  
// User Favorites Routes
// Handles getting and updating a user's *entire* favorites list
router.route("/favorites/:userId")
    .put(FavoritesController.apiUpdateFavorites)
    .get(FavoritesController.apiGetFavorites);
    
// router.route("/favorites/by-ids")
//     .get(FavoritesController.apiGetFavoritesByIds);

router.route("/:id").get(RecipesController.apiGetRecipeById);
router.route("/:id").put(RecipesController.apiUpdateRecipe);
router.route("/:id").delete(RecipesController.apiDeleteRecipe);

router
  .route("/favorites/:userId")
  .get(FavoritesController.apiGetFavorites)


router.route("/ratings/:id").get(RecipesController.apiGetRecipeRatingSummary); // Get ratings summary for a recipe
router.route("/rate")
  .post(RecipesController.apiSubmitRating);
export default router;
