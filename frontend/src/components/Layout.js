import { Outlet, Link } from "react-router-dom";
import { Nav, Navbar, NavDropdown } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Layout.css";
import "bootstrap-icons/font/bootstrap-icons.css";

function LayoutApp({ user, handleLogout }) {

    return (
        <div className="app-wrapper">
            <Navbar bg="success" variant="dark" expand="lg">
                <Navbar.Brand as={Link} to="/" className="pantrypal-brand"><i className="bi bi-basket me-2" />PantryPal</Navbar.Brand>
                {/* <Navbar.Toggle aria-controls="main-navbar" /> */}
                {/* <Navbar.Collapse id="main-navbar"> */}
                <Nav className="link-header" as="ul">
                    <Nav.Item as="li"><Nav.Link as={Link} to="/">
                        <i className="bi bi-house-door-fill me-2"></i>
                        Home</Nav.Link></Nav.Item>
                    <Nav.Item as="li"><Nav.Link as={Link} to="/search">
                        <i className="bi bi-search me-2"></i>Find Recipes</Nav.Link></Nav.Item>
                    {user && (
                        <>
                            <Nav.Item as="li"><Nav.Link as={Link} to="/submit">
                                <i className="bi bi-upload me-2"></i>Submit Recipe</Nav.Link></Nav.Item>
                            <Nav.Item as="li"><Nav.Link as={Link} to="/favorites">
                                <i className="bi bi-heart-fill me-2"></i>Favorites</Nav.Link></Nav.Item>
                        </>
                    )}
                    {user && user.isAdmin && (
                        <Nav.Item as="li"><Nav.Link as={Link} to="/adminRecipeReview">
                            <i className="bi-eye"></i>Review Recipes</Nav.Link></Nav.Item>
                    )}
                </Nav>

                <Nav className="ms-auto">
                    <NavDropdown
                        title={
                            <>
                                <i className="bi bi-person-circle me-2"></i>
                                {user ? user?.name || user?.username : "Account"}
                            </>
                        }id="account-dropdown">
                        {!user ? (
                            <>
                                <NavDropdown.Item as={Link} to="/login"><i className="bi bi-box-arrow-in-right me-2" />Login</NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/register"><i className="bi bi-person-plus me-2" />Register</NavDropdown.Item>
                            </>
                        ) : (
                            <>
                                <NavDropdown.Item disabled>{user.email}</NavDropdown.Item>
                                <NavDropdown.Item onClick={handleLogout}><i className="bi bi-box-arrow-right me-2" />Logout</NavDropdown.Item>
                            </>
                        )}
                    </NavDropdown>
                </Nav>
                {/* </Navbar.Collapse> */}
            </Navbar>

            <main>
                <Outlet />
            </main>

            <footer className="footer">
                <p>&copy; 2025 PantryPal</p>
            </footer>

        </div>

    )
}

export default LayoutApp;