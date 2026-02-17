import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Alert,
  Table,
} from "react-bootstrap";
import { depositInvestment, getInvestments } from "../api";

function InvestmentPage({ token }) {
  const [form, setForm] = useState({
    amount: 5000,
    termDays: 30,
  });
  const [investments, setInvestments] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInvestments();
  }, []);

  const loadInvestments = async () => {
    try {
      const { data } = await getInvestments();
      setInvestments(data.items || []);
    } catch (err) {
      console.error("Failed to load investments:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const { data } = await depositInvestment(form);
      setSuccess(
        `Investment created successfully! Amount: KES ${data.investment.amount}`,
      );
      setForm({ amount: 5000, termDays: 30 });
      loadInvestments();
    } catch (err) {
      setError(err.response?.data?.error || "Investment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <h1 className="mb-4">Investment Program</h1>
      <Row className="g-4">
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h5 className="mb-3">Invest Your Money</h5>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Investment Amount (KES)</Form.Label>
                  <Form.Control
                    type="number"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: Number(e.target.value) })
                    }
                    min="1000"
                    required
                  />
                  <small className="text-muted">Minimum: KES 1,000</small>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Investment Term (Days)</Form.Label>
                  <Form.Control
                    type="number"
                    value={form.termDays}
                    onChange={(e) =>
                      setForm({ ...form, termDays: Number(e.target.value) })
                    }
                    min="7"
                    required
                  />
                  <small className="text-muted">Minimum: 7 days</small>
                </Form.Group>

                <Alert variant="info" className="small">
                  💰 Expected return: <strong>5% interest</strong> on your
                  investment
                </Alert>

                <Button
                  variant="success"
                  type="submit"
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Deposit & Invest"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h5 className="mb-3">Your Investments</h5>
              {investments.length === 0 ? (
                <p className="text-muted">
                  No investments yet. Start investing today!
                </p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Amount</th>
                        <th>Term</th>
                        <th>Status</th>
                        <th>Return</th>
                      </tr>
                    </thead>
                    <tbody>
                      {investments.map((inv) => (
                        <tr key={inv._id}>
                          <td>KES {inv.amount}</td>
                          <td>{inv.termDays}d</td>
                          <td>
                            <span
                              className={`badge bg-${inv.status === "active" ? "success" : "secondary"}`}
                            >
                              {inv.status}
                            </span>
                          </td>
                          <td>KES {Math.round(inv.expectedReturn)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default InvestmentPage;
