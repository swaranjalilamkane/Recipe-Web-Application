import { Link } from "react-router-dom";
import { Container, Button, Card, Row, Col} from 'react-bootstrap';
import React, {useState, useCallback, useEffect, useRef} from 'react';
import '../styles/Layout.css';


function FavoritesPage({user, favorites: initialFavorites}) {
  // Placeholder for favorite recipes; could come from props, context, or API
  //const favoriteRecipes = []; // You can load this dynamically
  const [favorites, setFavorites] = useState(initialFavorites || []);
  const [expandRecipeCard, setExpandedRecipeCard] = useState(null);

  useEffect(() => {
    setFavorites(initialFavorites || []);
  }, [initialFavorites])

  const toggleExpand = (id) => {
    setExpandedRecipeCard(expandRecipeCard === id ? null : id)
  }

  return (
    <Container className='favoritesContainer'>
      <div className="favoritesPanel">
        <h4 className='text-success fw-bold  my-4'>Your Saved Recipes</h4>
      </div>
      
        {user && favorites && favorites.length > 0 ? (
          <Row className="g-4">
            {favorites.map((recipe, index) => (
              <Col key={recipe._id || index} xs={12} sm={6} md={4} lg={3}>
                <Card className="card">
                  <Card.Img
                    className="recipe-img"
                    variant="top"
                    src={recipe.imageURL || "/images/food-icon.png"}
                  />
                  <Card.Body className="recipe-body">
                    <Card.Title className="recipe-title">{recipe.title}</Card.Title>
                    <p><strong>Diet:</strong> {recipe.diet} | <strong>Cuisine:</strong> {recipe.cuisine}</p>
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
        ) : (
          <p>You have no saved recipes yet.</p>
        )}
      
    </Container>
  );
};

export default FavoritesPage;