import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button } from "react-bootstrap";

function NavbarComponent({ token, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  return (
    <Navbar bg="primary" expand="lg" sticky="top" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold text-white">
          🏦 FastApp
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/" className="text-white">
              Home
            </Nav.Link>
            {token ? (
              <>
                <Nav.Link as={Link} to="/dashboard" className="text-white">
                  Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/loan" className="text-white">
                  Apply Loan
                </Nav.Link>
                <Nav.Link as={Link} to="/investment" className="text-white">
                  Invest
                </Nav.Link>
                <Nav.Link as={Link} to="/withdraw" className="text-white">
                  Withdraw
                </Nav.Link>
                <Nav.Link as={Link} to="/profile" className="text-white">
                  Profile
                </Nav.Link>
                <Button
                  variant="outline-light"
                  onClick={handleLogout}
                  className="ms-2"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="text-white">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/signup" className="text-white">
                  Sign Up
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarComponent;
