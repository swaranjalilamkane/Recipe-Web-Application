
import supertest from 'supertest';
import { expect } from 'chai';
import app from '../index.js';
import { describe } from 'mocha';

const requestWithSupertest = supertest(app);

describe('Testing GET /api/recipes endpoint', function () {
  it('respondes with valid HTTP status code and all recipes', async function () {
    const response = await requestWithSupertest.get('/api/recipes');
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
    expect(response.body.length).to.be.greaterThan(0);
    expect(response.body[0]).to.have.property('title');
  });
});

describe('Testing GET /api/recipes/:id endpoint', function () {
  it('responds with valid HTTP status code and a specific recipe', async function () {
    const responseRecipes = await requestWithSupertest.get('/api/recipes');
    const firstRecipeId = responseRecipes.body[0]._id;
    const response = await requestWithSupertest.get(`/api/recipes/${firstRecipeId}`);
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('object');
    expect(response.body).to.have.property('title');
  });

  it('responds with 400 for non-existent recipe', async function () {
    const response = await requestWithSupertest.get('/api/recipes/60c72b2f9b1e8c001c8e4d3b');
    expect(response.status).to.equal(400);
  });
});

describe('Testing POST /api/recipes endpoint', function () {
  it('responds with valid HTTP status code and adds a new recipe', async function () {
    const newRecipe = {
      title: 'Test Recipe',
      ingredients: ['ingredient1', 'ingredient2'],
      instructions: 'Test instructions',
      diet: 'vegan',
      cuisine: 'Italian',
      approved: true,
      imageURL: 'http://example.com/image.jpg',
    };
    const response = await requestWithSupertest.post('/api/recipes').send(newRecipe);
    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('insertedId');
  });
});
describe('Testing GET /api/recipes/search endpoint', function () {
  it('responds with valid HTTP status code and returns recipes based on search criteria', async function () {
    const searchQuery = {
      ingredients: 'ingredient1,ingredient2',
      diet: 'vegan',
      cuisine: 'Italian',
    };
    const response = await requestWithSupertest.get('/api/recipes/search').query(searchQuery);
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('recipesList');
    expect(response.body.recipesList).to.be.an('array');
    expect(response.body.recipesList.length).to.be.greaterThan(0);
  });
});

describe('Testing POST /api/users/register endpoint', function () {
  const deleteTestUser = async (username) => {
    await requestWithSupertest.delete(`/api/users/${username}`);
  };
  it('responds with valid HTTP status code and registers a new user', async function () {
    const newUser = {
      username: 'testuser',
      email: 'sample@example.com',
      password: 'password123',
      isAdmin: false,
    };
    await deleteTestUser(newUser.username); // Clean up before test
    const response = await requestWithSupertest.post('/api/users/register').send(newUser);
    expect(response.body).to.have.property('message', 'User created');
    expect(response.body).to.have.property('userId');
  });
});

describe('Testing POST /api/users/login endpoint', function () {
  it('responds with valid HTTP status code and logs in a user', async function () {
    const loginUser = {
      email: 'sample@example.com',
      password: 'password123',
    };
    const response = await requestWithSupertest.post('/api/users/login').send(loginUser);
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('message', 'Login successful');
    expect(response.body.user).to.have.property('email', loginUser.email);
  });
});

describe('Testing DELETE /api/users/:username endpoint', function () {
  it('responds with valid HTTP status code and deletes a user', async function () {
    const usernameToDelete = 'testuser';
    const response = await requestWithSupertest.delete(`/api/users/${usernameToDelete}`);
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('message', 'User deleted successfully');
  });

  it('responds with 400 for non-existent user', async function () {
    const response = await requestWithSupertest.delete('/api/users/nonexistentuser');
    expect(response.status).to.equal(400);
    expect(response.body).to.have.property('message', 'User not found');
  });
});