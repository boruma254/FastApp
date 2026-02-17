import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

function Home({ token }) {
  const navigate = useNavigate();

  return (
    <Container className="py-5">
      <Row className="mb-5">
        <Col md={8} className="mx-auto text-center">
          <h1 className="display-4 fw-bold mb-3">Welcome to FastApp</h1>
          <p className="lead mb-4">
            Your trusted partner for loans and investments in Kenya
          </p>
          {!token && (
            <div>
              <Button
                variant="primary"
                size="lg"
                className="me-2"
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
              <Button
                variant="success"
                size="lg"
                onClick={() => navigate("/signup")}
              >
                Get Started
              </Button>
            </div>
          )}
        </Col>
      </Row>

      <Row className="g-4 mb-5">
        <Col md={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <h5 className="card-title">Quick Loans</h5>
              <p className="card-text">
                Get loans from KES 20,000 and grow your limit with on-time
                repayments.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <h5 className="card-title">Safe Investments</h5>
              <p className="card-text">
                Invest your money and earn up to 5% returns on your investments.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <h5 className="card-title">Referral Rewards</h5>
              <p className="card-text">
                Earn KES 200 for each friend you refer to FastApp.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {token && (
        <Row className="g-4">
          <Col md={3}>
            <Card className="text-center shadow-sm">
              <Card.Body>
                <h6>Apply for Loan</h6>
                <Button variant="primary" size="sm" as={Link} to="/loan">
                  Apply Now
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center shadow-sm">
              <Card.Body>
                <h6>Invest Money</h6>
                <Button variant="success" size="sm" as={Link} to="/investment">
                  Invest
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center shadow-sm">
              <Card.Body>
                <h6>Request Withdrawal</h6>
                <Button variant="warning" size="sm" as={Link} to="/withdraw">
                  Withdraw
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center shadow-sm">
              <Card.Body>
                <h6>View Dashboard</h6>
                <Button variant="info" size="sm" as={Link} to="/dashboard">
                  Dashboard
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default Home;
