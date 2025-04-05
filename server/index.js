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



app.set('trust proxy', 1); // Trust Render's proxy (very important)

app.use(session({
  secret: "your_session_secret",
  resave: false,
  saveUninitialized: false,
  proxy: true, // needed when using secure cookies behind a proxy
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: "sessions",
    ttl: 14 * 24 * 60 * 60
  }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true,         // Required for SameSite=None
    sameSite: "None"
  }
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





app.get("/debug-session", (req, res) => {
  res.json({
    session: req.session,
    user: req.user,
    isAuthenticated: req.isAuthenticated()
  });
});





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











// const express = require("express");
// const cors = require("cors");
// const passport = require("passport");
// require("dotenv").config();
// require("./config/passport");
// const mongoose = require("mongoose");
// const session = require("express-session");
// const MongoStore = require("connect-mongo");

// // Import Routes
// const authRoutes = require("./routes/auth");
// const campaignRoutes = require("./routes/campaign");
// const referralRoutes = require("./routes/referral");
// const crmRoutes = require('./routes/crm');
// const aiRoutes = require('./routes/ai');
// const customerRoutes = require("./routes/customers");

// const app = express();
// const PORT = process.env.PORT || 5001;
// const isProduction = process.env.NODE_ENV === "production";

// // Trust proxy only in production (e.g. on Render)
// if (isProduction) {
//   app.set('trust proxy', 1);
// }

// // CORS setup
// app.use(cors({
//   origin: process.env.FRONTEND_URL, // http://localhost:3000 in dev or your Render frontend URL
//   credentials: true
// }));

// // Body parser
// app.use(express.json());

// // Session setup
// app.use(session({
//   secret: process.env.SESSION_SECRET || "your_session_secret",
//   resave: false,
//   saveUninitialized: false,
//   proxy: isProduction, // required for secure cookies behind proxy
//   store: MongoStore.create({
//     mongoUrl: process.env.MONGO_URI,
//     collectionName: "sessions",
//     ttl: 14 * 24 * 60 * 60
//   }),
//   cookie: {
//     maxAge: 24 * 60 * 60 * 1000,
//     httpOnly: true,
//     secure: isProduction, // only use secure cookies in production
//     sameSite: isProduction ? "None" : "Lax"
//   }
// }));

// // Passport setup
// app.use(passport.initialize());
// app.use(passport.session());

// // Routes
// app.use("/auth", authRoutes);
// app.use("/api/campaigns", campaignRoutes);
// app.use("/api/referral", referralRoutes);
// app.use('/api/crm', crmRoutes);
// app.use('/api/ai', aiRoutes);
// app.use("/api/customers", customerRoutes);

// // Debugging session info
// app.get("/debug-session", (req, res) => {
//   res.json({
//     session: req.session,
//     user: req.user,
//     isAuthenticated: req.isAuthenticated()
//   });
// });

// // Profile route
// app.get("/profile", (req, res) => {
//   if (req.isAuthenticated()) {
//     res.json(req.user);
//   } else {
//     res.status(401).json({ message: "Not authenticated" });
//   }
// });

// // MongoDB connection and server start
// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }).then(() => {
//   app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// }).catch(err => console.log("MongoDB connection error:", err));
