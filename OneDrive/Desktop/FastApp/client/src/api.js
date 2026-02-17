import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const signup = (data) => api.post("/auth/signup", data);
export const login = (data) => api.post("/auth/login", data);
export const getCurrentUser = () => api.get("/auth/me");

// Loan endpoints
export const applyLoan = (data) => api.post("/loan/apply", data);
export const getLoanList = () => api.get("/loan");
export const repayLoan = (id) => api.post(`/loan/repay/${id}`);
export const disburseLoan = (id) => api.post(`/loan/disburse/${id}`);
export const cancelLoan = (id) => api.delete(`/loan/${id}`);
export const verifyPayment = (ref) => api.get(`/loan/verify/${ref}`);

// Investment endpoints
export const depositInvestment = (data) => api.post("/invest/deposit", data);
export const getInvestments = () => api.get("/invest/");
export const getInvestment = (id) => api.get(`/invest/${id}`);
export const withdrawInvestment = (id) => api.post(`/invest/withdraw/${id}`);

// Withdrawal endpoints
export const requestWithdrawal = (data) => api.post("/withdraw/request", data);
export const getWithdrawals = () => api.get("/withdraw/");

export default api;
