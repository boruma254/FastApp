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
  Badge,
  Modal,
} from "react-bootstrap";
import {
  applyLoan,
  getLoanList,
  repayLoan,
  disburseLoan,
  cancelLoan,
  getCurrentUser,
} from "../api";

function LoanPage({ token }) {
  const [form, setForm] = useState({
    amount: 10000,
    termWeeks: 4,
    purpose: "",
    nationalId: "",
    kraPin: "",
    dob: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [loans, setLoans] = useState([]);
  const [loansLoading, setLoansLoading] = useState(true);
  const [showRepayModal, setShowRepayModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [user, setUser] = useState(null);

  // Load loans and user info on mount
  useEffect(() => {
    loadLoans();
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const { data } = await getCurrentUser();
      setUser(data.user);
    } catch (err) {
      console.error("Failed to load user info", err);
    }
  };

  const loadLoans = async () => {
    try {
      setLoansLoading(true);
      const { data } = await getLoanList();
      setLoans(data.loans || []);
    } catch (err) {
      console.error("Failed to load loans", err);
    } finally {
      setLoansLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (!form.nationalId || !form.kraPin) {
        setError("National ID and KRA PIN are required");
        setLoading(false);
        return;
      }
      const { data } = await applyLoan(form);
      setSuccess(
        `Loan application submitted successfully! ID: ${data.loan._id}`,
      );
      setForm({
        amount: 10000,
        termWeeks: 4,
        purpose: "",
        nationalId: "",
        kraPin: "",
        dob: "",
      });
      await loadLoans();
    } catch (err) {
      setError(err.response?.data?.error || "Loan application failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDisburse = async (loanId) => {
    try {
      await disburseLoan(loanId);
      setSuccess("Loan disbursed! Amount queued for withdrawal on Friday.");
      await loadLoans();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to disburse loan");
    }
  };

  const handleRepay = async () => {
    if (!selectedLoan) return;
    try {
      await repayLoan(selectedLoan._id);
      setSuccess("Loan repaid successfully! Your limit has been updated.");
      setShowRepayModal(false);
      setSelectedLoan(null);
      await loadLoans();
      await loadUserInfo();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to repay loan");
    }
  };

  const handleCancel = async (loanId) => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this loan? This action cannot be undone.",
      )
    )
      return;
    try {
      await cancelLoan(loanId);
      setSuccess("Loan cancelled successfully.");
      await loadLoans();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to cancel loan");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "warning",
      approved: "info",
      disbursed: "success",
      paid: "secondary",
      rejected: "danger",
    };
    return colors[status] || "secondary";
  };

  // Calculate available limit
  const loanLimit = user?.loanLimit || 20000;
  const activeLoanArray = loans.filter(
    (l) => l.status === "pending" || l.status === "disbursed",
  );
  const activeLoanAmount = activeLoanArray.reduce(
    (sum, l) => sum + l.amount,
    0,
  );
  const availableLimit = loanLimit - activeLoanAmount;
  const hasActiveLoan = activeLoanArray.length > 0;

  return (
    <Container className="py-5">
      <h1 className="mb-4">Apply for a Loan</h1>
      <Row className="g-4">
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h5 className="mb-3">Loan Application Form</h5>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              {hasActiveLoan && (
                <Alert variant="warning">
                  You have an active loan. You must repay it before applying for
                  a new loan.
                </Alert>
              )}
              <Form onSubmit={handleSubmit} disabled={hasActiveLoan}>
                <Form.Group className="mb-3">
                  <Form.Label>Loan Amount (KES)</Form.Label>
                  <Form.Control
                    type="number"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: Number(e.target.value) })
                    }
                    min="1000"
                    max={availableLimit}
                    disabled={hasActiveLoan}
                    required
                  />
                  <small
                    className={
                      availableLimit <= 0 ? "text-danger" : "text-muted"
                    }
                  >
                    {availableLimit <= 0
                      ? `No borrowing capacity available (repay loans to increase)`
                      : `Available to borrow: KES ${availableLimit.toLocaleString()}`}
                  </small>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Loan Term (Weeks)</Form.Label>
                  <Form.Control
                    type="number"
                    value={form.termWeeks}
                    onChange={(e) =>
                      setForm({ ...form, termWeeks: Number(e.target.value) })
                    }
                    min="1"
                    disabled={hasActiveLoan}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Loan Purpose</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Business, Education"
                    value={form.purpose}
                    onChange={(e) =>
                      setForm({ ...form, purpose: e.target.value })
                    }
                    disabled={hasActiveLoan}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>National ID</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Your Kenyan National ID"
                    value={form.nationalId}
                    onChange={(e) =>
                      setForm({ ...form, nationalId: e.target.value })
                    }
                    disabled={hasActiveLoan}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>KRA PIN</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Your KRA PIN"
                    value={form.kraPin}
                    onChange={(e) =>
                      setForm({ ...form, kraPin: e.target.value })
                    }
                    disabled={hasActiveLoan}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Date of Birth</Form.Label>
                  <Form.Control
                    type="date"
                    value={form.dob}
                    onChange={(e) => setForm({ ...form, dob: e.target.value })}
                    disabled={hasActiveLoan}
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100"
                  disabled={loading || hasActiveLoan}
                >
                  {hasActiveLoan
                    ? "Repay existing loan first"
                    : loading
                      ? "Processing..."
                      : "Apply for Loan"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm mb-3">
            <Card.Body>
              <h5 className="card-title">Loan Terms & Conditions</h5>
              <ul className="small">
                <li>Initial loan limit: KES 20,000</li>
                <li>Limit increases by 10% for each on-time repayment</li>
                <li>Interest rates vary based on loan term</li>
                <li>Repay before term ends for early repayment rewards</li>
                <li>All loans protected by financial regulations</li>
              </ul>
            </Card.Body>
          </Card>

          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="card-title">Your Active Loans</h5>
              {loansLoading ? (
                <p className="text-muted">Loading...</p>
              ) : loans.length === 0 ? (
                <p className="text-muted">No loans yet</p>
              ) : (
                <div className="table-responsive">
                  <Table striped borderless size="sm">
                    <thead>
                      <tr>
                        <th>Amount</th>
                        <th>Term</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loans.map((loan) => (
                        <tr key={loan._id}>
                          <td>KES {loan.amount}</td>
                          <td>{loan.termWeeks}w</td>
                          <td>
                            <Badge bg={getStatusColor(loan.status)}>
                              {loan.status}
                            </Badge>
                          </td>
                          <td>
                            {loan.status === "pending" && (
                              <div className="d-flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline-primary"
                                  onClick={() => handleDisburse(loan._id)}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline-danger"
                                  onClick={() => handleCancel(loan._id)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            )}
                            {loan.status === "disbursed" && (
                              <Button
                                size="sm"
                                variant="outline-success"
                                onClick={() => {
                                  setSelectedLoan(loan);
                                  setShowRepayModal(true);
                                }}
                              >
                                Repay
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>

          <Modal show={showRepayModal} onHide={() => setShowRepayModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Repay Loan</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedLoan && (
                <div>
                  <p>
                    <strong>Amount:</strong> KES {selectedLoan.amount}
                  </p>
                  <p>
                    <strong>Term:</strong> {selectedLoan.termWeeks} weeks
                  </p>
                  <p>
                    Are you sure you want to repay this loan? The amount will be
                    queued for withdrawal on Friday.
                  </p>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowRepayModal(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleRepay}>
                Confirm Repayment
              </Button>
            </Modal.Footer>
          </Modal>
        </Col>
      </Row>
    </Container>
  );
}

export default LoanPage;
