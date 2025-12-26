import FavoritesDAO from "../dao/FavoritesDAO.js";

export default class FavoritesController {

  static async apiGetFavorites(req, res) {
    try {
      const userId = req.params.userId;
      const result = await FavoritesDAO.getFavorites(userId);
      if (!result || result.length === 0) {
        return res.json([]);
      }
      if (result && result.error) {
        return res.status(400).json({ message: result.error });
      }
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: e.toString() });
    }
  }

  static async apiAddFavorite(req, res) {
    try {
      const { userId, recipeId } = req.body;
      const result = await FavoritesDAO.addFavorite(userId, recipeId);
      if (result.error) {
        return res.status(400).json({ message: result.error });
      }
      if (result.modifiedCount === 0) {
        return res.status(404).json({ message: "User not found or recipe already favorited" });
      }
      return res.json({ message: "Recipe added to favorites" });
    } catch (e) {
      res.status(500).json({ error: e.toString() });
    }
  }

  static async apiRemoveFavorite(req, res) {
    try {
      const { userId, recipeId } = req.params;
      const result = await FavoritesDAO.removeFavorite(userId, recipeId);
      if (result.error) {
        return res.status(400).json({ message: result.error });
      }
      if (result.modifiedCount === 0) {
        return res.status(404).json({ message: "User not found or recipe not in favorites" });
      }
      res.json({ message: "Recipe removed from favorites" });
    } catch (e) {
      res.status(500).json({ error: e.toString() });
    }
  }

  /**
   * Handles updating a user's favorites list.
   */
  static async apiUpdateFavorites(req, res, next){
      try{
          console.log("PUT /favorites/:userId called with body:", req.body);

          const FavoritesResponse = await FavoritesDAO.updateFavorites(
              req.params.userId || req.body._id,
              req.body.favorites
          )
          var { error } = FavoritesResponse
          if (error){
              res.status(500).json({error});
              return;
          }

          res.json({status: "success"});
      }catch(e){
          res.status(500).json({error: e.message})
      }
  };

  // static async apiGetFavoritesByIds(req, res, next){
  //   try{
  //       // Get comma-separated IDs from query parameter
  //       const idsString = req.query.ids;

  //       // Split and trim whitespace
  //       const idsArray = idsString.split(',').map(id => id.trim()); 

  //       let recipes = await FavoritesDAO.getFavoritesByIds(idsArray);
  //       if (!recipes || recipes.length === 0){
  //           res.status(404).json({error: 'not found'});
  //           return;
  //       }
  //       res.json(recipes);
  //   }catch(e){
  //       console.error(`API Error in apiGetFavoritesByIds: ${e.message}`);
  //       res.status(500).json({error: e.message})
  //   }
  // }
}
