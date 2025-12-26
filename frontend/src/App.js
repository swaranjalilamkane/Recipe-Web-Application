import { Routes, Route, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useState, useEffect, useCallback } from "react";
import Login from "./components/Login.js";
import FavoritesPage from "./components/Favorites.js";
import PantryPalPage from "./components/HomePage.js";
import StartSearchingPage from "./components/StartSearching.js";
import "./App.css";
import LayoutApp from "./components/Layout.js";
import Register from "./components/Register.js";
import SubmitRecipePage from "./components/Submit.js";
import RecipesReview from "./components/RecipesReview.js";
import FavoriteDataService from './services/favorites.js';



const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function App() {

  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const userId = user?.userId;
  
  // `favorites` will store just the movie IDs (strings)
  const [favorites, setFavorites] = useState([]);
  // `favoriteMovies` will store the full movie objects fetched from the backend
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  // const [doSaveFaves, setDoSaveFaves] = useState(false);
  
    
  const handleLogout = () => {
    localStorage.removeItem("login");
    setUser(null);
    navigate("/"); // navigate home after logout
  }

  useEffect(() => {
    let loginData = JSON.parse(localStorage.getItem("login"));
    if (loginData) {
      if (loginData.exp) {
        let loginExp = loginData.exp;
        let now = Date.now() / 1000;
        if (now < loginExp) {
          setUser({
            ...loginData,
            userId: loginData.userId || loginData._id || loginData.sub
          });
        } else {
            handleLogout();
        }
      } else {
          // If no expiration, assume valid because it was email and password login using the backend api
          setUser({
            ...loginData,
            userId: loginData.userId || loginData._id || loginData.sub
          });
      }
    }
  }, []);

// Function to retrieve favorites (IDs and full movie objects) from backend
  const retrieveFavorites = useCallback(() => {
    if (!userId) return;
    FavoriteDataService.getAllFavorites(userId)
    .then(({data}) => {
      console.log("Favorites API response:", data);
      setFavorites(data.favorites || []);
      setFavoriteRecipes(data.recipes || []);  // fallback to []
      console.log("Movies array (full objects):", data.recipes);
    })
    .catch(e => {
      console.error("Error retrieving favorites:", e);
      setFavorites([]);
      setFavoriteRecipes([]);
    })
  }, [userId]);

  const addFavorite = useCallback((recipeId) => {
    if (!userId) return;
    const id = String(recipeId);

    // optimistic update
    setFavorites(prev => (prev.includes(id) ? prev : [...prev, id]));

    return FavoriteDataService.addFavorite(userId, id)
      .then(() => {
        // optionally re-sync from server
        retrieveFavorites();
      })
      .catch(e => {
        console.error("Add favorite failed:", e);
        // revert optimistic update
        setFavorites(prev => prev.filter(x => x !== id));
      });
  }, [userId, retrieveFavorites]);

  const deleteFavorite = useCallback((recipeId) => {
    if (!userId) return;
    const id = String(recipeId);

    // optimistic update
    setFavorites(prev => prev.filter(x => x !== id));

    return FavoriteDataService.removeFavorite(userId, id)
      .then(() => {
        // optionally re-sync
        retrieveFavorites();
      })
      .catch(e => {
        console.error("Remove favorite failed:", e);
        // revert optimistic update
        setFavorites(prev => (prev.includes(id) ? prev : [...prev, id]));
      });
  }, [userId, retrieveFavorites]);

  // const addFavorite = useCallback((recipeId) =>{
  //     if(!user) return;
  //     // Only add if not already present
  //     setFavorites(prev => (prev.includes(recipeId) ? prev: [...prev, recipeId]));
  //     // setDoSaveFaves(true);
  //     FavoriteDataService.addFavorite(user.userId, recipeId)
  //     .then(() => {
  //       retrieveFavorites()
  //     })
  //     .catch(e => {
  //       console.error("Add favorite failed:", e)
  //       setFavorites(prev => prev.filter(id => id !== recipeId));
  //     })
      
  //   }, [user]) // Dependency on favorites to get the latest state
  
  //   const deleteFavorite = useCallback((recipeId) => {
  //     if(!user) return;
  //     // Optimistic update
  //     setFavorites(prev => prev.filter(id => id !== recipeId));
  //     FavoriteDataService.removeFavorite(user.userId, recipeId)
  //     .then (() => {
  //       retrieveFavorites();
    
  //     // setDoSaveFaves(true);
  //     .catch(e => {
  //       console.error("Remove favorite failed: ", e)
  //       // revert optimistic update
  //       setFavorites(prev => (prev.includes(recipeId) ? prev : [...prev, recipeId]));
  //     }) 
  //   }
  //   }, [user]); // Dependency on favorites to get the latest startSearchangeed state


  //  const deleteFavorite = useCallback((recipeId) => {
  //     if(!user) return;
  //     // Optimistic update
  //     if (favorites.includes(recipeId)) {
  //       setFavorites(prev => prev.filter(id => id !== recipeId));
  //       FavoriteDataService.removeFavorite(user.userId, recipeId)
  //       .then (() => {
  //         retrieveFavorites();
  //       })
  //       // setDoSaveFaves(true);
  //       .catch(e => {
  //         console.error("Remove favorite failed: ", e)
  //         // revert optimistic update
  //         setFavorites(prev => (prev.includes(recipeId) ? prev : [...prev, recipeId]));
  //       }) 
  //     }
  //   }, [user]); // Dependency on favorites to get the latest state

  
  // const saveFavorites = useCallback(() => {
  //   console.log("saveFavorites called")
  //   if (doSaveFaves && user){
  //     var data = {
  //       _id: user.userId,
  //       favorites: favorites
  //     }
  //     console.log("Saving favorites to backend:", data);

  //     console.log(
  //       "PUT URL:",
  //       `${process.env.REACT_APP_API_BASE_URL}/api/recipes/favorites/${user.userId}`
  //     );

  //     FavoriteDataService.updateFavoritesList(data)
  //       .then((res) => {
  //         console.log("Save successful:", res.data);
  //       })
  //       .catch(e => {
  //         console.error("Save failed:", e);
  //     });
  //   }
  // }, [favorites, user, doSaveFaves]);

  // useEffect(() => {
  //   if (user && doSaveFaves) {
  //     saveFavorites();
  //     setDoSaveFaves(false);
  //   }
  // }, [user, favorites, saveFavorites, doSaveFaves]);

  useEffect(() => {
    if (userId) {
      retrieveFavorites();
    }
  }, [userId, retrieveFavorites]);


  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="App">
        <Routes>
          <Route path="/" element={<LayoutApp user={user} handleLogout={handleLogout} /> }>          
              <Route index element={<PantryPalPage/>}/>
              <Route path='/search' element={<StartSearchingPage
                user={user}
                addFavorite={addFavorite}
                deleteFavorite={deleteFavorite}
                favorites={favorites}/>}/>
              <Route path='/submit' element={<SubmitRecipePage/>}/>
              <Route 
                path='/favorites' 
                element={
                  <FavoritesPage
                    user={user}
                    favorites={favoriteRecipes}
                    />
                  }/>
              <Route path="login" element={<Login setUser={setUser} />} />
              <Route path="register" element={<Register />} />
              <Route path="adminRecipeReview" element={<RecipesReview />} />
            </Route>  
        </Routes>
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;