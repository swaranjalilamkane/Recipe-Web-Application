import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, Link } from "react-router-dom";
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import UserDataService from '../services/users'; 

function Login({ setUser }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const onGoogleSuccess = (res) => {
    const tokenData = jwtDecode(res.credential);
    const loginData = {
      googleId: tokenData.sub,
      ...tokenData
    };
    const userId = loginData.sub || loginData.googleId; // safe fallback
    const normalized = { ...loginData, userId };
    setUser(normalized);
    localStorage.setItem("login", JSON.stringify(normalized));
    console.log('Login success with Google:', loginData);
    navigate("/");
  };

  const onGoogleFailure = (res) => {
    console.log('Google login failed:', res);
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await UserDataService.loginUser(formData);
      const user = response.data.user;
      setUser({ ...user, userId: user._id });
      localStorage.setItem("login", JSON.stringify({ ...user, userId: user._id }));
      console.log('Login success with email:', user);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Invalid email or password");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <Card className="p-4 shadow" style={{ width: "400px" }}>
        <h2 className="text-center mb-4">Login</h2>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleEmailLogin}>
          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control 
              type="email" 
              name="email" 
              placeholder="Enter email" 
              value={formData.email} 
              onChange={handleChange}
              required 
            />
          </Form.Group>

          <Form.Group className="mb-4" controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control 
              type="password" 
              name="password" 
              placeholder="Enter password" 
              value={formData.password} 
              onChange={handleChange}
              required 
            />
          </Form.Group>

          <Button variant="success" type="submit" className="w-100 mb-3">
            Login with Email
          </Button>
        </Form>

        <div className="text-center mb-3">or</div>

        <div className="d-flex justify-content-center">
          <GoogleLogin onSuccess={onGoogleSuccess} onError={onGoogleFailure} />
        </div>

        <hr />
        <div className="text-center mt-3">
          Don't have an account? <Link to="/register">Create one for free</Link>
        </div>
      </Card>
    </Container>
  );
}

export default Login;