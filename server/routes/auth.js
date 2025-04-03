const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));


router.get('/google/callback', passport.authenticate('google', {
  successRedirect: `${process.env.FRONTEND_URL}/`,
  failureRedirect: `${process.env.FRONTEND_URL}`,
}));

router.get("/me", (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user); 
  } else {
    res.status(401).json({ message: "Not logged in" });
  }
});





router.get("/logout", (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).send("Logout error");

    req.session.destroy(() => {
      res.clearCookie("connect.sid", {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: false
      });

      res.status(200).json({ message: "Logged out successfully" });
    });
  });
});





module.exports = router;