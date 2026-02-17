import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Alert,
  Table,
  Modal,
  Form,
} from "react-bootstrap";
import { requestWithdrawal, getWithdrawals } from "../api";

function WithdrawalPage({ token }) {
  const [withdrawals, setWithdrawals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWithdrawals();
  }, []);

  const loadWithdrawals = async () => {
    try {
      const { data } = await getWithdrawals();
      setWithdrawals(data.items || []);
    } catch (err) {
      console.error("Failed to load withdrawals:", err);
    }
  };

  const handleRequestWithdrawal = async () => {
    if (!amount || amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await requestWithdrawal({ amount: Number(amount) });
      setSuccess(`Withdrawal request submitted! Processing on Friday.`);
      setAmount("");
      setShowModal(false);
      loadWithdrawals();
    } catch (err) {
      setError(err.response?.data?.error || "Withdrawal request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <h1 className="mb-4">Withdraw Funds</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row className="g-4 mb-4">
        <Col md={12}>
          <Card className="shadow-sm bg-light">
            <Card.Body>
              <Row>
                <Col md={4}>
                  <h6>Available Balance</h6>
                  <h2 className="text-success">KES 0.00</h2>
                </Col>
                <Col md={4}>
                  <h6>Processing Day</h6>
                  <h2 className="text-primary">Friday</h2>
                  <small className="text-muted">Weekly at 10:00 AM</small>
                </Col>
                <Col md={4}>
                  <h6>Transfer Method</h6>
                  <h2 className="text-info">M-Pesa</h2>
                  <small className="text-muted">Instant to your phone</small>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h5 className="mb-3">Request Withdrawal</h5>
              <Button
                variant="primary"
                size="lg"
                className="w-100"
                onClick={() => setShowModal(true)}
              >
                Request Withdrawal
              </Button>

              <Alert variant="info" className="mt-3 small">
                <strong>How it works:</strong>
                <ul className="mb-0 mt-2">
                  <li>Request any amount here</li>
                  <li>All requests processed every Friday</li>
                  <li>Funds transferred to your M-Pesa number</li>
                  <li>No fees for withdrawals</li>
                </ul>
              </Alert>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h5 className="mb-3">Withdrawal History</h5>
              {withdrawals.length === 0 ? (
                <p className="text-muted">No withdrawal requests yet.</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawals.map((w) => (
                        <tr key={w._id}>
                          <td>KES {w.amount}</td>
                          <td>
                            <span
                              className={`badge bg-${
                                w.status === "paid"
                                  ? "success"
                                  : w.status === "processing"
                                    ? "warning"
                                    : w.status === "queued"
                                      ? "info"
                                      : "danger"
                              }`}
                            >
                              {w.status}
                            </span>
                          </td>
                          <td>
                            {new Date(w.requestedAt).toLocaleDateString()}
                          </td>
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

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Request Withdrawal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Withdrawal Amount (KES)</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="100"
            />
            <small className="text-muted">Minimum: KES 100</small>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleRequestWithdrawal}
            disabled={loading}
          >
            {loading ? "Processing..." : "Request Withdrawal"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default WithdrawalPage;
