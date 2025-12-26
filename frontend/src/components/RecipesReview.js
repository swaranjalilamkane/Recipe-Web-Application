import React, { useEffect, useState } from "react";
import { Card, Button, Container, Row, Col, Spinner } from "react-bootstrap";
import RecipeDataService from "../services/recipes";

const RecipesReview = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  // Fetch unapproved recipes
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await RecipeDataService.getAllRecipes();
        console.log("Fetched recipes:", response.data);
        //filter recipes that are not approved
        const unapprovedRecipes = response.data.filter(recipe => !recipe.approved);
        setRecipes(unapprovedRecipes);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();

  }, []);

  const handleApprove = async (id) => {
    try {
      await RecipeDataService.updateRecipe(id, { approved: true });
      setRecipes(prev => prev.filter(recipe => recipe._id !== id));
      alert("Recipe approved successfully!");
    } catch (error) {
      console.error("Error approving recipe:", error);
      alert("Failed to approve recipe. Please try again.");
    }

  };

  const handleReject = async (id) => {
    try {
      await RecipeDataService.deleteRecipe(id);
      setRecipes(prev => prev.filter(recipe => recipe._id !== id));
      alert("Recipe rejected successfully!");
    } catch (error) {
      console.error("Error rejecting recipe:", error);
      alert("Failed to reject recipe. Please try again.");
    }

  };
  const toggleExpand = (id) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status" />
        <p>Loading recipes...</p>
      </Container>
    );
  }

  if (recipes.length === 0) {
    return (
      <Container className="mt-5 text-center">
        <h4 className='text-success fw-bold  my-4'>No pending recipes to review.</h4>
      </Container>
    );
  }

  return (
  <Container fluid className="py-4">
      <h4 className='text-success fw-bold  my-4'>Pending recipe reviews</h4>
      <Row>
        {recipes.map((recipe) => (
          <Col md={6} lg={3} key={recipe._id} className="mb-3">
            <Card>
              <Card.Img variant="top" src={recipe.imageURL || "/Images/bowl.png"} style={{ height: "200px", objectFit: "cover", width: "100%" }} />
              <Card.Body>
                <Card.Title>{recipe.title}</Card.Title>
                 <p><strong>Diet: </strong> {recipe.diet} | <strong>Cuisine: </strong>{recipe.cuisine}</p>
                  <p><strong>Ingredients: </strong>{recipe.ingredients?.join(', ')}</p>
                  <p><strong>Instructions:</strong> {
                    expanded[recipe._id]
                      ? recipe.instructions
                      : recipe.instructions.slice(0, 70) + (recipe.instructions.length > 70 ? "..." : "")
                  }</p>
                  {recipe.instructions.length > 70 && (
                    <Button
                      variant="link"
                      className="p-0"
                      onClick={() => toggleExpand(recipe._id)}
                    >
                      {expanded[recipe._id] ? "Show less" : "Show more"}
                    </Button>
                  )}
                  
                <div className="d-flex justify-content-between">
                  <Button variant="success" size="sm" onClick={() => handleApprove(recipe._id)}>
                    Approve
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleReject(recipe._id)}>
                    Reject
                  </Button>
                </div>
              </Card.Body>

            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default RecipesReview;
