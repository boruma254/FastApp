import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Alert } from "react-bootstrap";
import {
  getCurrentUser,
  getLoanList,
  getInvestments,
  getWithdrawals,
} from "../api";

function Dashboard({ token }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [loans, setLoans] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // Get user info from API
      const userRes = await getCurrentUser();
      setUser(userRes.data.user);

      // Fetch loans
      const loansRes = await getLoanList();
      setLoans(loansRes.data.loans || []);

      // Fetch investments
      const investRes = await getInvestments();
      setInvestments(investRes.data.items || []);

      // Fetch withdrawals
      const withdrawRes = await getWithdrawals();
      setWithdrawals(withdrawRes.data.items || []);
    } catch (err) {
      console.error("Error loading dashboard", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <Container className="py-5">
        <Alert variant="info">Loading...</Alert>
      </Container>
    );

  if (error)
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );

  // Calculate stats
  const activeLoans = loans.filter(
    (l) => l.status === "pending" || l.status === "disbursed",
  ).length;
  const totalLoanAmount = loans
    .filter((l) => l.status === "disbursed" || l.status === "pending")
    .reduce((sum, l) => sum + l.amount, 0);
  const activeInvestments = investments.filter(
    (i) => i.status === "active",
  ).length;
  const totalInvestmentAmount = investments
    .filter((i) => i.status === "active")
    .reduce((sum, i) => sum + i.expectedReturn, 0);
  const queuedWithdrawals = withdrawals
    .filter((w) => w.status === "queued")
    .reduce((sum, w) => sum + w.amount, 0);

  const loanLimit = user?.loanLimit || 20000;
  const availableLimit = loanLimit - totalLoanAmount;
  const referralRewards = user?.referralRewards || 0;
  const onTimeRepayments = user?.onTimeRepayments || 0;

  if (loading)
    return (
      <Container className="py-5">
        <Alert variant="info">Loading...</Alert>
      </Container>
    );

  return (
    <Container className="py-5">
      <h1 className="mb-4">Dashboard</h1>
      <Row className="g-4">
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5>Total Loan Limit</h5>
              <h2 className="text-primary">KES {loanLimit.toLocaleString()}</h2>
              <small className="text-muted">
                Grows with on-time repayments
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5>Available to Borrow</h5>
              <h2
                className={availableLimit < 0 ? "text-danger" : "text-success"}
              >
                KES {Math.max(0, availableLimit).toLocaleString()}
              </h2>
              <small className="text-muted">
                {totalLoanAmount > 0
                  ? `(${activeLoans} active loan${activeLoans > 1 ? "s" : ""})`
                  : "No active loans"}
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5>Active Loans</h5>
              <h2 className="text-warning">{activeLoans}</h2>
              <small className="text-muted">
                Amount borrowed: KES {totalLoanAmount.toLocaleString()}
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5>Investments</h5>
              <h2 className="text-info">{activeInvestments}</h2>
              <small className="text-muted">
                Total returns: KES {totalInvestmentAmount.toLocaleString()}
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5>Queued Withdrawals</h5>
              <h2 className="text-success">
                KES {queuedWithdrawals.toLocaleString()}
              </h2>
              <small className="text-muted">Processing on Friday 10 AM</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5>Referral Rewards</h5>
              <h2 className="text-success">
                KES {referralRewards.toLocaleString()}
              </h2>
              <small className="text-muted">Earned from referrals</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5>On-Time Repayments</h5>
              <h2 className="text-success">{onTimeRepayments}</h2>
              <small className="text-muted">
                Each one increases your loan limit by 10%
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;
