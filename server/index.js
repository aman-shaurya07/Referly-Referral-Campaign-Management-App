const express = require("express");
const cors = require("cors");
const passport = require("passport");
require("dotenv").config();
require("./config/passport");
const campaignRoutes = require("./routes/campaign");
const referralRoutes = require("./routes/referral");
const crmRoutes = require('./routes/crm');
const aiRoutes = require('./routes/ai');
const customerRoutes = require("./routes/customers");





const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());



const session = require("express-session");
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");




require("dotenv").config();
const mongoURI = process.env.MONGO_URI;

app.use(session({
  secret: "your_session_secret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: mongoURI,
    collectionName: "sessions",
    ttl: 14 * 24 * 60 * 60 // Optional: 14 days expiration
  }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    httpOnly: true,
    sameSite: "lax",
  },
}));





app.use(passport.initialize());
app.use(passport.session());

// Auth route
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/referral", referralRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/ai', aiRoutes);
app.use("/api/customers", customerRoutes);



app.get("/profile", (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

const PORT = process.env.PORT || 5001;
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => console.log(err));
