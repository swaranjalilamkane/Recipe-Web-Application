import {Navbar, Nav, Button} from "react-bootstrap";
import {Routes, Route, Link} from "react-router-dom";
import '../styles/Home.css';

function PantryPalPage () {
  return (
    <div>
      <main className="hero">
        <section>
          <h2>Use What You Have</h2>
          <p>Enter your ingredients and discover healthy, delicious recipes you can make at home.</p>
          <Button as={Link} to="/search" variant="secondary">Start Searching</Button>
        </section>
      </main>
    </div>
  );
};

export default PantryPalPage;