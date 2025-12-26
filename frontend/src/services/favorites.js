import axios from 'axios';

class FavoriteDataService{
    getAllFavorites(userId){
        return axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/recipes/favorites/${userId}`);
    }

    addFavorite(userId, recipeId) {
        console.log("addFavorite args:", { userId, recipeId });
        console.log(`POST addFavorite URL: ${process.env.REACT_APP_API_BASE_URL}/api/recipes/favorites/${userId}/${recipeId}`);
        return axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/recipes/favorites`, {userId, recipeId});
    }

    removeFavorite(userId, recipeId) {
        return axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/recipes/favorites/${userId}/${recipeId}`);
    }


    updateFavoritesList(userId, favoritesArray){
        return axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/recipes/favorites/${userId}`,
      { _id: userId, favorites: favoritesArray });
    }

    // getFavoritesByIds(recipeIdsArray) {
    //     // Join the array of movie IDs into a comma-separated string for the query parameter
    //     const idsString = recipeIdsArray.join(',');

    //     // Constructs the full URL including the base API URL, specific path, and query parameters
    //     return axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/recipes/favorites/by-ids?ids=${idsString}`);
    // }
}
export default new FavoriteDataService();