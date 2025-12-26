import axios from 'axios'

/**
 * RecipeDataService handles all HTTP requests related to recipes
 * using axios. This service provides methods to:
 * - Fetch all recipes (paginated)
 * - Search recipes by cuisine or other fields
 * - Get a single recipe by its ID
 * - Create or update recipe entries
 * 
 * Environment variable RREACT_APP_API_BASE_URL is used as the base URL.
 * 
 * Note: Review-related methods to be added once backend review functionality is implemented.
 */
class RecipeDataService {
    getAllRecipes (page = 0){
        return axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/recipes?page=${page}`);
    }

    findByAll(ingredients, diet, cuisine, page = 0) {
        const params = new URLSearchParams();
        params.append("page", page);

        if (ingredients) {
            const ingArray = typeof ingredients === "string" ? ingredients.split(",") : ingredients;
            ingArray.forEach(ing => params.append("ingredients", ing.trim()));
        }

        if (diet) params.append("diet", diet);
        if (cuisine) params.append("cuisine", cuisine);

        const url = `${process.env.REACT_APP_API_BASE_URL}/api/recipes/search?${params.toString()}`;
        return axios.get(url);
    }

    getRecipeById(id){
        return axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/recipes/${id}`);
    }
    updateRecipe(id, data){
        return axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/recipes/${id}`, data)
    }
    createRecipe(data){
        return axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/recipes`, data)
    }
    deleteRecipe(id) {
        return axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/recipes/${id}`);
    }
    submitRating(data) {;
        return axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/recipes/rate`, data);
    }
   
    // implement review api calls that allow users to create, update and delete reviews once the review functionality is implemented in the backend
}

export default new RecipeDataService();