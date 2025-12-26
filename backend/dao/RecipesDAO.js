import mongodb from "mongodb";
const ObjectId = mongodb.ObjectId;

let recipes;
let ratings; // for the new collection

export default class RecipesDAO {
  static async injectDB(conn) {
  if (recipes) return;
 try {
      recipes = await conn.db(process.env.RECIPES_DB_NAME).collection("recipes");
    } catch (e) {
      console.error(`Unable to connect in RecipesDAO: ${e}`);
    }
  }


  // Fetch all approved recipes with optional user info
  static async getAllRecipes() {
    try {
      return await recipes.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "submittedBy"
          }
        },
        {
          $unwind: {
            path: "$submittedBy",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            title: 1,
            ingredients: 1,
            instructions: 1,
            diet: 1,
            cuisine: 1,
            approved: 1,
            createdAt: 1,
            imageURL: 1,
            averageRating: 1,
            totalRatings: 1,
            ratings: 1,
            submittedBy: { username: "$submittedBy.username", email: "$submittedBy.email" }
          }
        }
      ]).toArray();
    } catch (e) {
      console.error("Error in getAllApprovedRecipes:", e);
      return [];
    }
  }

  // search recipes by ingredients, diet and cuisine
  static async searchRecipes(query = {}, { page = 0, recipesPerPage = 12} = {}) {
    let findQuery = {};

    // Only return approved recipes
    findQuery.approved = true;

    // Build the query dynamically
    if (query.ingredients && Array.isArray(query.ingredients)) {
      // Assuming 'ingredients' in the database is an array of strings.
      // This query uses $in with a case-insensitive regex for each ingredient
      // to find recipes that contain at least one of the specified ingredients.
      // The split() method on the ingredients parameter is handled in the controller,
      // so we expect it to be an array here.
      const pattern = query.ingredients.map(i => i.trim()).join("|");
      findQuery.ingredients = {
        $elemMatch: {
          $regex: pattern,
          $options: "i"
      }
    };
    }

    if (query.diet) {
      findQuery.diet = query.diet;
    }

    if (query.cuisine) {
      findQuery.cuisine = query.cuisine;
    }

    let cursor;
    try {
      cursor = await recipes.find(findQuery);
    } catch (e) {
      console.error(`Unable to issue find command, ${e}`);
      return { recipesList: [], totalNumRecipes: 0 };
    }

    const displayCursor = cursor.limit(recipesPerPage).skip(page * recipesPerPage);

    try {
      const recipesList = await displayCursor.toArray();
      const totalNumRecipes = await recipes.countDocuments(findQuery);
      return { recipesList, totalNumRecipes };
    } catch (e) {
      console.error(`Unable to convert cursor to array or count documents, ${e}`);
      return { recipesList: [], totalNumRecipes: 0 };
    }
  }

  // Get recipe by ID
 static async getRecipeById(id) {
  try {
    const recipe = await recipes.findOne({ _id: new ObjectId(id) });
    if (!recipe) {
      return { error: "Recipe not found" };
    }
    return recipe;
  } catch (e) {
    console.error("Error in getRecipeById:", e);
    return { error: "Failed to fetch recipe" };
  }
}


  // Add recipe with user ID
  static async addRecipe(recipeData) {
    try {
      const { user_id, imageURL, ...rest } = recipeData;
      return await recipes.insertOne({
        ...rest,
        imageURL,
        user_id: new ObjectId(user_id),
        createdAt: new Date(),
        ratings: {},         // Initialize empty ratings object
        averageRating: 0,    // Initialize average rating to zero
        totalRatings: 0      // Initialize total ratings to zero (optional)
    });
    
    } catch (e) {
      console.error("Error in addRecipe:", e);
      return { error: "Failed to add recipe" };
    }
  }

  // Update recipe (admin)
  static async updateRecipe(id, data) {
  try {
    const result = await recipes.updateOne(
      { _id: new ObjectId(id) },
      { $set: data }
    );
    if (result.matchedCount === 0) {
      return { error: "Recipe not found" };
    }
    return result;
  } catch (e) {
    console.error("Error in updateRecipe:", e);
    return { error: "Failed to update recipe" };
  }
}

  //  Delete recipe (admin)
 static async deleteRecipe(id) {
  try {
    const result = await recipes.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return { error: "Recipe not found" };
    }

    return result;
  } catch (e) {
    console.error("Error in deleteRecipe:", e);
    return { error: "Failed to delete recipe" };
  }
}
static async submitRating(recipeId, userId, stars) {
  try {
    const recipeObjectId = new ObjectId(recipeId);

    // Validate stars
    if (typeof stars !== 'number' || stars < 1 || stars > 5) {
      return { error: "Stars must be a number between 1 and 5" };
    }

    // Validate recipe exists
    const recipe = await recipes.findOne({ _id: recipeObjectId });
    if (!recipe) {
      return { error: "Recipe not found" };
    }

    // Determine if userId is a valid ObjectId string
    let userKey;
    if (ObjectId.isValid(userId)) {
      userKey = new ObjectId(userId).toHexString();
    } else {
      userKey = userId;
    }

    // Update or add the rating
    const updatedRatings = { ...recipe.ratings, [userKey]: stars };

    // Recalculate totalRatings and averageRating
    const ratingValues = Object.values(updatedRatings);
    const totalRatings = ratingValues.length;
    const averageRating = ratingValues.reduce((sum, val) => sum + val, 0) / totalRatings;

    // Save updated data back to DB
    const result = await recipes.updateOne(
      { _id: recipeObjectId },
      {
        $set: {
          ratings: updatedRatings,
          totalRatings,
          averageRating
        }
      }
    );

    if (result.modifiedCount === 0) {
      return { error: "Failed to update rating" };
    }

    return { message: "Rating submitted successfully" };
  } catch (e) {
    console.error("Error in submitRating:", e);
    return { error: "Failed to submit rating" };
  }
}

// Arushi added to recount the new average for the recipe
  static async getAverageRating(recipeId) {
    try {
      const result = await ratings.aggregate([
        { $match: { recipeId: new ObjectId(recipeId) } },
        {
          $group: {
            _id: "$recipeId",
            averageRating: { $avg: "$stars" },
            totalRatings: { $sum: 1 }
          }
        }
      ]).toArray();

      if (result.length === 0) {
        return { averageRating: 0, totalRatings: 0 };
      }

      return result[0];
    } catch (e) {
      console.error("Error in getAverageRating:", e);
      return { error: "Failed to get rating stats" };
    }
  }
static async getRecipeRatingSummary(recipeId) {
  try {
    const recipeObjectId = new ObjectId(recipeId);
    const recipe = await recipes.findOne({ _id: recipeObjectId });

    if (!recipe) {
      return { error: "Recipe not found" };
    }

    return {
      averageRating: recipe.averageRating,
      totalRatings: recipe.totalRatings,
      ratings: recipe.ratings
    };
  } catch (e) {
    console.error("Error in getRecipeRatingSummary:", e);
    return { error: "Failed to fetch rating summary" };
  }
}

}