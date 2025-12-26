from locust import HttpUser, task, between
import random
import json

class RecipeUser(HttpUser):
    wait_time = between(1, 3)  # user wait between requests

    # Change this for AWS vs LocalStack
    host = "https://cn50au1lh4.execute-api.us-east-1.amazonaws.com"

    @task(5)
    def get_all_recipes(self):
        """Hit GET /api/recipes"""
        self.client.get("/api/recipes")

    @task(2)
    def create_recipe(self):
        """Hit POST /api/recipes"""
        recipe = {
            "title": f"Test Recipe {random.randint(1,1000)}",
            "ingredients": ["egg", "flour"],
            "instructions": "Mix and cook.",
            "diet": "vegetarian",
            "cuisine": "indian",
            "user_id": "user123",
            "approved": True,
            "imageURL": "http://example.com/img.jpg"
        }

        self.client.post(
            "/api/recipes",
            data=json.dumps(recipe),
            headers={"Content-Type": "application/json"}
        )
