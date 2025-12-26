import mongodb from "mongodb";
const ObjectId = mongodb.ObjectId;


let users;
let recipesCollection;
let favoritesCollection;

export default class FavoritesDAO {
  static async injectDB(conn) {
    if (favoritesCollection && users && recipesCollection) return;
    try {
      users = await conn.db(process.env.RECIPES_DB_NAME).collection("users");
      recipesCollection = await conn.db(process.env.RECIPES_DB_NAME).collection("recipes");
      favoritesCollection = await conn.db(process.env.RECIPES_DB_NAME).collection("favorites")
    } catch (e) {
      console.error(`Unable to connect in FavoritesDAO: ${e}`);
    }
  }

  // Get all favorites for a user
  static async getFavorites(userId) {
    try {
      const userFavorites = await favoritesCollection.findOne({ _id: String(userId) });
      console.log("User Favorites Document:", userFavorites);

      if (!userFavorites || !Array.isArray(userFavorites.favorites) || userFavorites.favorites.length === 0) {
      console.log("No favorites found for user:", userId);
      return { favorites: [], recipes: [] };
  }

      const recipeIds = userFavorites.favorites.map(favId => {
        try {
          return new ObjectId(favId)
        }catch{
          console.warn("Invalid ObjectId string:", favId)
          return null; // Return null for invalid IDs
        }
        }).filter(Boolean);
        console.log("Object IDs:", recipeIds);

        const recipes = await recipesCollection.find({_id: { $in: recipeIds }}).toArray();
        console.log("FavoritesDAO: Fetched recipes:", recipes);

        // Return both raw IDs and movie objects
        return { favorites: userFavorites.favorites, recipes}
    } catch (e) {
        console.error(`Something went wrong in getFavorites: ${e}`);
        throw e;
    }
  }

  // Add a recipe to user favorites
  static async addFavorite(userId, recipeId) {
    try {
      // Check if the user exists in the favorites collection
      const user = await favoritesCollection.findOne({ _id: String(userId) });
      if (!user) {
        console.log("User not found:", userId);
        //creat a new user document with an empty favorites array if not found
        const newUser = {
          _id: String(userId),
          favorites:[recipeId]
        };
        const res = await favoritesCollection.insertOne(newUser);
        console.log("Created new user document with empty favorites:", newUser);
        return res;
      }
      const update = await favoritesCollection.updateOne(
        { _id: String(userId) },
        { $addToSet: { favorites: String(recipeId) } },
        { upsert: true }
      );
      return update;
    } catch (e) {
      console.error("Error in addFavorite:", e);
      return { error: "Failed to add favorite" };
    }
  }

  // Remove a recipe from favorites
  static async removeFavorite(userId, recipeId) {
    try {
      const update = await favoritesCollection.updateOne(
        { _id: String(userId) },
        { $pull: { favorites: String(recipeId) } }
      );
      return update;
    } catch (e) {
      console.error("Error in removeFavorite:", e);
      return { error: "Failed to remove favorite" };
    }
  }
   /**
     * Updates or inserts a user's favorite movie list.
     */
    static async updateFavorites(userId, favorites){
      try{
        console.log("Updating favorites for userId:", userId, "favorites:", favorites);

        const updateResponse = await favoritesCollection.updateOne(
          {_id: String(userId)},
          {$set: {favorites: favorites}},
          {upsert: true}
        )
        
        console.log("Update response:", updateResponse);

        // Return success status or the update result.
        // If updateResponse.modifiedCount > 0 or updateResponse.upsertedCount > 0, it's a success.
        if (updateResponse.matchedCount === 0 && updateResponse.upsertedCount === 0) {
          console.warn(`FavoritesDAO: No document matched or upserted for userId: ${userId}`);
        }

        return updateResponse;
      }catch(e){
        console.error(`Unable to update favorites: ${e}`);
        return {error: e};
      }
    };

//   /**
//    * Retrieves a batch of recipe details using their recipe IDs.
//    * This method assumes the input 'ids' are the _id values of the recipe documents themselves.
//    */
//   static async getFavoritesByIds(recipeIds) {
//     try {
//         if (!Array.isArray(recipeIds) || recipeIds.length === 0) {
//             console.warn("FavoritesDAO: getFavoritesByIds called with empty or invalid favoriteIds array.");
//             return []; // Return empty array if no IDs provided
//         }

//         // Convert recipe ID strings to MongoDB ObjectIds
//         const objectIds = recipeIds.map(id => {
//             try {
//                 return new ObjectId(id);
//             } catch (e) {
//                 console.warn(`FavoritesDAO: Invalid recipe ID string in getFavoritesByIds: ${id}, Error: ${e.message}`);
//                 return null; // Return null for invalid IDs
//             }
//         }).filter(Boolean); // Filter out any null values (invalid ObjectIds)

//         if (objectIds.length === 0) {
//             console.warn("FavoritesDAO: No valid ObjectIds to query in getFavoritesByIds.");
//             return []; // Return empty array if all IDs were invalid
//         }

//         console.log("FavoritesDAO: Fetching recipes by IDs:", objectIds);
//         const results = await recipesCollection.find({ _id: { $in: objectIds } }).toArray();
//         console.log("FavoritesDAO: Fetched recipes by IDs:", results);
//         return results;
//     } catch (e) {
//         console.error(`FavoritesDAO: Failed to fetch recipes by ID: ${e}`);
//         throw e; // Re-throw to be caught by the controller
//     }
//   }
}
