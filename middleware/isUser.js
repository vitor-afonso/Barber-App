//jshint esversion:8

module.exports = (req, res, next) => {

  if (req.session.user.role !== "User") {
    return res.redirect("/profile/admin");
  }
  next();
};
