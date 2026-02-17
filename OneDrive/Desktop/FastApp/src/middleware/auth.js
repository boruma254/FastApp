const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).send({ error: "No token" });
  const token = auth.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "secret");
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).send({ error: "Invalid token" });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).send({ error: "Invalid token" });
  }
};
