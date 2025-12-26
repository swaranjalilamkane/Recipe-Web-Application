import React, { useState } from 'react';
import { Container, Form, Button } from "react-bootstrap";
import '../styles/Layout.css';
import RecipeDataService from '../services/recipes';

function SubmitRecipePage() {
  const [formData, setFormData] = useState({
    title: '',
    ingredients: '',
    instructions: '',
    diet: '',
    cuisine: '',
    imageURL: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: formData.title,
      ingredients: formData.ingredients.split(',').map(ing => ing.trim()),
      instructions: formData.instructions,
      diet: formData.diet,
      cuisine: formData.cuisine,
      imageURL: formData.imageURL,
      approved: false // Default to false until reviewed
    };

    try {
      const response = await RecipeDataService.createRecipe(payload);
      console.log("Recipe submitted:", response.data);
      alert("Recipe submitted successfully!");
      setFormData({
        title: '',
        ingredients: '',
        instructions: '',
        diet: '',
        cuisine: '',
        imageURL: '',
        approved: false
      });
    } catch (error) {
      console.error("Error submitting recipe:", error);
      alert("Failed to submit recipe. Please try again.");
    }
  };

  return (
    <Container fluid className="py-4">
      <h4 className='text-success fw-bold  my-4'><i className="bi bi-fork-knife"></i>Submit Your Healthy Recipe</h4>
      <Form id="submit-form" onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="recipe-title">
          <Form.Label>Recipe Title</Form.Label>
          <Form.Control
            type="text"
            name="title"
            placeholder="Enter recipe title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="recipe-ingredients">
          <Form.Label>Ingredients (comma-separated)</Form.Label>
          <Form.Control
            as="textarea"
            name="ingredients"
            placeholder="e.g. eggs, spinach, cheese"
            value={formData.ingredients}
            onChange={handleChange}
            required
            rows={2}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="recipe-instructions">
          <Form.Label>Instructions</Form.Label>
          <Form.Control
            as="textarea"
            name="instructions"
            placeholder="Step-by-step cooking instructions"
            value={formData.instructions}
            onChange={handleChange}
            required
            rows={4}
          />
        </Form.Group>

        <div className="row">
          <div className="col-md-6 text-center">
            <Form.Group className="mb-3" controlId="diet-select">
              <Form.Label>Diet Type</Form.Label>
              <Form.Select
                name="diet"
                value={formData.diet}
                onChange={handleChange}
              >
                <option value="">Select Diet Type</option>
                <option value="vegan">Vegan</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="non-vegetarian">Gluten-Free</option>
                <option value="pescatarian">Pescatarian</option>
                <option value="paleo">Paleo</option>
                <option value="keto">Keto</option>
                <option value="whole-food-plant-based">Whole Food Plant-Based</option>
                <option value="raw-vegan">Raw Vegan</option>
                <option value="gluten-free">Gluten-Free</option>
                <option value="dairy-free">Dairy-Free</option>
                <option value="diabetic-friendly">Diabetic-Friendly</option>
                <option value="low-sodium">Low-Sodium</option>
                <option value="heart-healthy">Heart-Healthy</option>
                <option value="flexitarian">Flexitarian</option>
                <option value="mediterranean">Mediterranean</option>
                <option value="lacto-vegetarian">Lacto-Vegetarian</option>
                <option value="ovo-vegetarian">Ovo-Vegetarian</option>
                <option value="lacto-ovo-vegetarian">Lacto-Ovo Vegetarian</option>
                <option value="low-fodmap">Low FODMAP</option>
                <option value="no-preference">No Preference</option>
              </Form.Select>

            </Form.Group>
          </div>
          <div className="col-md-6 text-center">
            <Form.Group className="mb-3" controlId="cuisine-select">
              <Form.Label>Cuisine Type</Form.Label>
              <Form.Select
                name="cuisine"
                value={formData.cuisine}
                onChange={handleChange}
              >
                <option value="">Select Cuisine Type</option>
                <option value="indian">Indian</option>
                <option value="italian">Italian</option>
                <option value="mexican">Mexican</option>
                <option value="american">American</option>
                <option value="thai">Thai</option>
                <option value="chinese">Chinese</option>
                <option value="korean">Korean</option>
                <option value="japanese">Japanese</option>
                <option value="greek">Greek</option>
                <option value="french">French</option>
                <option value="turkish">Turkish</option>
                <option value="brazilian">Brazilian</option>
                <option value="spanish">Spanish</option>
                <option value="vietnamese">Vietnamese</option>
                <option value="moroccan">Moroccan</option>
                <option value="lebanese">Lebanese</option>
                <option value="ethiopian">Ethiopian</option>
                <option value="german">German</option>
                <option value="caribbean">Caribbean</option>
                <option value="russian">Russian</option>
                <option value="persian">Persian</option>
                <option value="cajun">Cajun</option>
                <option value="southern">Southern US</option>
                <option value="no-preference">No Preference</option>
              </Form.Select>

            </Form.Group>
          </div>
        </div>


        <Form.Group className="mb-3" controlId="image-url">
          <Form.Label>Image URL</Form.Label>
          <Form.Control
            type="url"
            name="imageURL"
            placeholder="https://example.com/your-image.jpg"
            value={formData.imageURL}
            onChange={handleChange}
          />
        </Form.Group>

        <Button variant="success" type="submit">
          Submit for Review
        </Button>
      </Form>
    </Container>
  );
}

export default SubmitRecipePage;