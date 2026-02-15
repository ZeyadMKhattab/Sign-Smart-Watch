// checkAuth middleware
const checkAuth = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
};

module.exports = {
  checkAuth,
};
