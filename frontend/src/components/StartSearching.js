import { Container, Form, Button, Row, Col, Card } from 'react-bootstrap';
import React, { useState, useEffect, useMemo } from 'react';
import '../styles/Layout.css';
import '../styles/startSearching.css';
import RecipeDataService from '../services/recipes.js';
import FavoritesDataService from '../services/favorites.js';
import { GoHeart, GoHeartFill } from "react-icons/go";
import { FaStar } from "react-icons/fa";

function StartSearchingPage({
  user,
  favorites,
  addFavorite,
  deleteFavorite
}) {

  const [ingredients, setIngredients] = useState('');
  const [diet, setDiet] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [expandRecipeCard, setExpandedRecipeCard] = useState(null);
  const [dietOptions, setDietOptions] = useState([]);
  const [cuisineOptions, setCuisineOptions] = useState([]);
  const [ingredientSuggestions, setIngredientSuggestions] = useState([]);
  const [allIngredients, setAllIngredients] = useState([]);
  const [showSuggestionsPopup, setShowSuggestionsPopup] = useState(false);
  const [hoverRatings, setHoverRatings] = useState({});
  const [userRatings, setUserRatings] = useState({}); // store ratings per recipe

  const loginDataRaw = localStorage.getItem("login");
  let userId = null;

  if (loginDataRaw) {
    try {
      const loginData = JSON.parse(loginDataRaw);
      userId = loginData.googleId || loginData._id || loginData.id || null;
    } catch (e) {
      console.error("Failed to parse login data:", e);
    }
  }

  useEffect(() => {
    const fetchApprovedRecipes = async () => {
      try {
        const res = await RecipeDataService.getAllRecipes();
        const approvedRecipes = res.data.filter(recipe => recipe.approved === true);
        setRecipes(approvedRecipes);

        // Extract unique diet and cuisine values to populate filter dropdowns
        const uniqueDiets = [...new Set(approvedRecipes.map(r => r.diet).filter(Boolean))];
        const uniqueCuisines = [...new Set(approvedRecipes.map(r => r.cuisine).filter(Boolean))];

        // Extract all ingredients from approved recipes
        const allIngredientsSet = new Set(
          approvedRecipes.flatMap(recipe => recipe.ingredients.map(i => i.toLowerCase().trim()))
        );
        setAllIngredients([...allIngredientsSet].sort());

        console.log('All ingredients:', Array.from(allIngredientsSet));
        setAllIngredients(Array.from(allIngredientsSet).sort());
        setDietOptions(uniqueDiets);
        setCuisineOptions(uniqueCuisines);

        // Build userRatings object from fetched recipes
        if (userId) {
          const ratingsMap = {};
          approvedRecipes.forEach(recipe => {
            if (recipe.ratings && recipe.ratings[userId]) {
              ratingsMap[recipe._id] = recipe.ratings[userId];
            }
          });
          setUserRatings(ratingsMap);
        }
      } catch (err) {
        console.error("Failed to fetch approved recipes on load:", err);
      }
    };

    fetchApprovedRecipes();
  }, []);


  const toggleExpand = (id) => {
    setExpandedRecipeCard(expandRecipeCard === id ? null : id)
  }

  const searchIngredients = async () => {
    // Log the search input
    console.log('Searching with:', ingredients, diet, cuisine);

    // Clean up ingredients string: remove trailing commas and spaces
    const cleanIngredients = ingredients.trim().replace(/,+$/, '').trim();
    // if no filters show all approved recipes

    if (!cleanIngredients && !diet && !cuisine) {
      const res = await RecipeDataService.getAllRecipes();
      console.log('Raw API response:', res.data);
      const approvedRecipes = res.data.filter(recipe => recipe.approved);
      setRecipes(approvedRecipes);
      return;
    }
    try {
      setExpandedRecipeCard(null);

      const res = await RecipeDataService.findByAll(cleanIngredients, diet, cuisine);
      console.log('API response:', res);
      const recipeList = Array.isArray(res.data.recipesList) ? res.data.recipesList : [];
      setRecipes(recipeList);
      console.log('Recipes state updated.');
    } catch (err) {
      console.error("Could not fetch recipes: ", err);
      setRecipes([]); // Set recipes to empty array on error
    }
  };
  const handleIngredientChange = (e) => {
    const value = e.target.value;
    setIngredients(value);

    if (value) {
      const parts = value.split(",").map(part => part.trim().toLowerCase());
      const lastPart = parts[parts.length - 1];
      if (lastPart) {
        const suggestions = allIngredients.filter(ing =>
          ing.includes(lastPart)
        );
        setIngredientSuggestions(suggestions.slice(0, 10));
        setShowSuggestionsPopup(suggestions.length > 0);
      } else {
        setIngredientSuggestions([]);
        setShowSuggestionsPopup(false);
      }
    } else {
      setIngredientSuggestions([]);
      setShowSuggestionsPopup(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const parts = ingredients.split(",");
    parts[parts.length - 1] = " " + suggestion;
    setIngredients(parts.join(",").replace(/^,/, "").trimStart() + ", ");
    setIngredientSuggestions([]);
  };

  // const recipeIdString = (recipe) => {
  //   return typeof recipe._id === 'string' ? recipe._id : recipe._id.toString();
  // };

  // // Create a Set of favorite IDs for efficient lookup
  // const favoriteIdSet = useMemo(() => {
  //   return new Set(favorites);
  // }, [favorites]);

  return (
    <Container fluid>
      <h4 className='text-success fw-bold  my-4'>Search Healthy Recipes</h4>
      <h6 className="mb-3">Enter Ingredients and filter by diet and cuisine</h6>

      <Form className='mb-3'>
        <Row >
          <Col md={7}>
            <Form.Group controlId="ingredients-input" className="mb-3">
              <Form.Control
                type="text"
                placeholder="Enter ingredients (comma separated)"
                value={ingredients}
                onChange={handleIngredientChange}
                onFocus={() => {
                  if (ingredients.trim() === "") {
                    setIngredientSuggestions(allIngredients.slice(0, 10));
                    setShowSuggestionsPopup(true);
                  }
                }}
                autoComplete="off"
              />
            </Form.Group>

          </Col>
          <Col md={2}>
            <Form.Group controlId="diet-select" className="mb-3">
              <Form.Select value={diet} onChange={(e) => setDiet(e.target.value)}>
                <option value="">Select a diet</option>
                {dietOptions.map((d, idx) => (
                  <option key={idx} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group controlId="cuisine-select" className="mb-3">
              <Form.Select value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
                <option value="">Select a cuisine</option>
                {cuisineOptions.map((c, idx) => (
                  <option key={idx} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={1}>
            <Button variant="success" onClick={searchIngredients}>
              Search
            </Button>
          </Col>
        </Row>
      </Form>
      {showSuggestionsPopup && (
        <div
          className="suggestions-overlay"
          onClick={() => setShowSuggestionsPopup(false)}
        >
          <div
            className="suggestions-popup"
            onClick={e => e.stopPropagation()}
          >
            <ul>
              {ingredientSuggestions.map((suggestion, index) => (
                <li key={index} onClick={() => {
                  handleSuggestionClick(suggestion);
                  setShowSuggestionsPopup(false);
                }}>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <hr />

      {recipes.length === 0 ? (
        <p>No recipes found. Try searching with different ingredients or filters.</p>
      ) : (
        <Row className="g-4 ">
          {recipes.map((recipe) => (
            <Col key={recipe._id} xs={12} sm={6} md={4} lg={3}>
              <Card className="card">
                {user && (
                  favorites.includes(recipe._id) ?
                  <GoHeartFill className="heart heartFill" onClick={() => {
                    deleteFavorite(recipe._id)
                  }} />
                  :
                  <GoHeart className="heart heartEmpty" onClick={() => {
                    addFavorite(recipe._id)
                  }}/>
                )}
                <Card.Img
                  className="recipe-img"
                  variant="top"
                  src={recipe.imageURL || "/images/food-icon.png"}
                />
                <Card.Body className="recipe-body">
                  <Card.Title className="recipe-title">{recipe.title}</Card.Title>
                  <p><strong>Diet:</strong> {recipe.diet} | <strong>Cuisine:</strong> {recipe.cuisine}</p>
                  <div className="text-end mt-2 ratings-info">
                    <FaStar color="#FFD700" />
                    <strong> {recipe.averageRating?.toFixed(1) || "0.0"}</strong>
                    <span className="text-muted"> ({recipe.totalRatings || 0})</span>
                  </div>
                  <div className="mb-3 text-end">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        size={20}
                        color={
                          (hoverRatings[recipe._id] || userRatings[recipe._id] || 0) >= star
                            ? "#FFD700"
                            : "#ccc"
                        }
                        style={{ cursor: "pointer" }}
                        onMouseEnter={() =>
                          setHoverRatings((prev) => ({ ...prev, [recipe._id]: star }))
                        }
                        onMouseLeave={() =>
                          setHoverRatings((prev) => ({ ...prev, [recipe._id]: 0 }))
                        }
                        onClick={async () => {
                          try {
                            if (!userId) {
                              alert("You must be logged in to rate recipes.");
                              return;
                            }
                            console.log(`Submitting rating ${star} for recipe ${recipe._id} by user ${userId}`);
                            await RecipeDataService.submitRating({
                              recipeId: recipe._id,
                              userId: userId,
                              stars: star
                            });
                            setUserRatings((prev) => ({ ...prev, [recipe._id]: star }));
                            alert(`You rated this recipe ${star} star${star > 1 ? "s" : ""}!`);
                            const updatedRecipe = await RecipeDataService.getRecipeById(recipe._id);
                            setRecipes((prev) =>
                              prev.map((r) =>
                                r._id === recipe._id ? { ...r, ...updatedRecipe.data } : r
                              )
                            );
                          } catch (err) {
                            console.error("Rating failed:", err);
                            alert("Could not submit rating. Please try again.");
                          }
                        }}
                      />
                    ))}
                  </div>


                  <Button
                    className="card-button"
                    variant="primary"
                    onClick={() => toggleExpand(recipe._id)}
                  >
                    {expandRecipeCard === recipe._id ? "Hide Recipe" : "View Recipe"}
                  </Button>

                  {expandRecipeCard === recipe._id && (
                    <div className="expanded-card">
                      <p><strong>Ingredients: </strong>{recipe.ingredients?.join(', ')}</p>
                      <h6>Instructions:</h6>
                      <p>{recipe.instructions}</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

export default StartSearchingPage;