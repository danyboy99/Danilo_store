// Authentication middleware
const isUserLoggedIn = (req, res, next) => {
  if (req.isAuthenticated() && req.user.constructor.modelName === "user") {
    return next();
  }
  req.flash("error", "Please sign in to access this page");
  res.redirect("/user/login");
};

const isAdminLoggedIn = (req, res, next) => {
  if (req.isAuthenticated() && req.user.constructor.modelName === "admin") {
    return next();
  }
  req.flash("error", "Please sign in as admin to access this page");
  res.redirect("/admin/");
};

module.exports = {
  isUserLoggedIn,
  isAdminLoggedIn,
};
