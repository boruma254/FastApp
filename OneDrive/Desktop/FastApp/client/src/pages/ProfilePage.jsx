import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Table,
} from "react-bootstrap";

function ProfilePage({ token }) {
  const [profile, setProfile] = useState({
    name: "User",
    email: "",
    phone: "",
    referralCode: "FASTAPP123",
    referralRewards: 0,
    loanLimit: 20000,
    onTimeRepayments: 0,
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Load user profile from localStorage or API
    const userData = localStorage.getItem("user");
    if (userData) {
      setProfile({ ...profile, ...JSON.parse(userData) });
    }
  }, [profile]);

  const copyReferralCode = () => {
    navigator.clipboard.writeText(profile.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Container className="py-5">
      <h1 className="mb-4">Your Profile</h1>

      <Row className="g-4">
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h5 className="mb-3">Personal Information</h5>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control type="text" value={profile.name} disabled />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" value={profile.email} disabled />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control type="tel" value={profile.phone} disabled />
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h5 className="mb-3">Account Statistics</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <div className="mb-3">
                    <small className="text-muted d-block">Loan Limit</small>
                    <h6>KES {profile.loanLimit.toLocaleString()}</h6>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <small className="text-muted d-block">
                      On-Time Repayments
                    </small>
                    <h6>{profile.onTimeRepayments}</h6>
                  </div>
                </Col>
              </Row>
              <hr />
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <small className="text-muted d-block">
                      Referral Rewards
                    </small>
                    <h6>KES {profile.referralRewards.toLocaleString()}</h6>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <small className="text-muted d-block">Account Status</small>
                    <h6>
                      <span className="badge bg-success">Active</span>
                    </h6>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mt-1">
        <Col md={12}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h5 className="mb-3">Referral Program</h5>
              <p className="mb-3">
                Share your referral code and earn <strong>KES 200</strong> for
                each friend who signs up!
              </p>
              <div className="mb-3">
                <Form.Label>Your Referral Code</Form.Label>
                <div className="input-group">
                  <Form.Control
                    type="text"
                    value={profile.referralCode}
                    disabled
                  />
                  <Button variant="outline-primary" onClick={copyReferralCode}>
                    {copied ? "✓ Copied" : "Copy"}
                  </Button>
                </div>
              </div>
              <Alert variant="info" className="small">
                <strong>How it works:</strong> Share your code or referral link
                with friends. When they sign up using your code, you get KES 200
                instantly!
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mt-1">
        <Col md={12}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h5 className="mb-3">KYC Information</h5>
              <p className="text-muted small mb-3">
                Your Know Your Customer (KYC) details are securely stored and
                used only for loan verification.
              </p>
              <Table striped bordered hover size="sm">
                <tbody>
                  <tr>
                    <td>
                      <strong>National ID</strong>
                    </td>
                    <td>***hidden for security***</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>KRA PIN</strong>
                    </td>
                    <td>***hidden for security***</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Date of Birth</strong>
                    </td>
                    <td>***hidden for security***</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ProfilePage;
