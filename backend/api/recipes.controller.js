import RecipesDAO from "../dao/RecipesDAO.js";

export default class RecipesController {
  static async apiGetAllRecipes(req, res) {
    try {
      const recipesPerPage = req.query.recipesPerPage ? parseInt(req.query.recipesPerPage) : 10;
      const page = req.query.page ? parseInt(req.query.page) : 0;
      const recipes = await RecipesDAO.getAllRecipes(page, recipesPerPage);
      if (!recipes || recipes.length === 0) {
        return res.status(404).json({ message: "No recipes found" });
      }
      res.json(recipes);
    } catch (e) {
      res.status(500).json({ error: e.toString() });
    }
  }

  static async apiSearchRecipes(req, res) {
        try {
            const { diet, cuisine } = req.query;
            const page = parseInt(req.query.page) || 0;
            const recipesPerPage = parseInt(req.query.recipesPerPage) || 12;

            const query = {};
            
            let ingredients = req.query.ingredients;
            if (ingredients) {
                // Check if ingredients is already an array (for multiple params) or a string
                if (typeof ingredients === 'string') {
                    query.ingredients = ingredients.split(",");
                } else if (Array.isArray(ingredients)) {
                    query.ingredients = ingredients;
                }
            }
            if (diet) {
                query.diet = diet;
            }
            if (cuisine) {
                query.cuisine = cuisine;
            }

            const { recipesList, totalNumRecipes } = await RecipesDAO.searchRecipes(query, { page, recipesPerPage });

            if (!recipesList || recipesList.length === 0) {
                return res.status(404).json({ message: "No recipes found with those filters" });
            }

            // Return the recipes and total count
            res.json({
                recipesList,
                totalNumRecipes,
                page,
                recipesPerPage,
            });
        } catch (e) {
            res.status(500).json({ error: e.toString() });
        }
    }

  static async apiGetRecipeById(req, res) {
    try {
      const recipe = await RecipesDAO.getRecipeById(req.params.id);
      if (!recipe) return res.status(404).json({ message: "Recipe not found" });
      if (recipe.error) {
        return res.status(400).json({ message: recipe.error });
      }
      res.json(recipe);
    } catch (e) {
      res.status(500).json({ error: e.toString() });
    }
  }

  static async apiAddRecipe(req, res) {
    try {
      const recipe = await RecipesDAO.addRecipe(req.body);
      if (recipe.error) {
        return res.status(400).json({ message: recipe.error });
      }
      if (!recipe.insertedId) {
        return res.status(400).json({ message: "Failed to add recipe" });
      }
      res.status(201).json(recipe);
    } catch (e) {
      res.status(500).json({ error: e.toString() });
    }
  }

  static async apiUpdateRecipe(req, res) {
    try {
      const result = await RecipesDAO.updateRecipe(req.params.id, req.body);
      if (result.modifiedCount === 0) {
        return res.status(404).json({ message: "Recipe not found or no changes made" });
      }
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: e.toString() });
    }
  }

  static async apiDeleteRecipe(req, res) {
    try {
      const result = await RecipesDAO.deleteRecipe(req.params.id);
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      if (result.error) {
        return res.status(400).json({ message: result.error });
      }
      res.json({ status: "success" });
    } catch (e) {
      res.status(500).json({ error: e.toString() });
    }
  }

  // Submit or update rating for a recipe
static async apiSubmitRating(req, res) {
  try {
    const { recipeId, userId, stars } = req.body;
    if (!recipeId || !userId || stars === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await RecipesDAO.submitRating(recipeId, userId, stars);
    if (result.error) {
      return res.status(400).json({ message: result.error });
    }

    res.status(200).json({ message: "Rating submitted successfully", result });
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
}
  // Get rating summary for a recipe
static async apiGetRecipeRatingSummary(req, res) {
  try {
    const recipeId = req.params.id;
    if (!recipeId) {
      return res.status(400).json({ message: "Recipe ID is required" });
    }

    const ratingSummary = await RecipesDAO.getRecipeRatingSummary(recipeId);
    if (ratingSummary.error) {
      return res.status(400).json({ message: ratingSummary.error });
    }

    res.status(200).json(ratingSummary);
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
}
}