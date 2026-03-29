const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const session = require("express-session");

dotenv.config({path: './config.env'});

const server = express();

server.use(session({
   secret: process.env.SECRET,
   resave: false,
   saveUninitialized: false
}));

// creates an object to store the routes for each of the specific features
const eventsRoutes = require("./routes/event-routes");
const rsvpRoutes = require("./routes/rsvp-routes");
const authRoutes = require("./routes/auth-routes");
const reviewRoutes = require("./routes/review-routes");

// middleware for post
server.use(express.urlencoded({ extended: true }));

// express.json() is a middleware
server.use(express.json());

// Set EJS as the view engine for rendering dynamic HTML pages
server.set("view engine", "ejs");

// Serve static files and store images and css from uploads (images, CSS, etc.) from the public folder 
server.use(express.static('public'));

server.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// root routes
server.use('/', eventsRoutes);
server.use('/', rsvpRoutes);
server.use('/', authRoutes);
server.use('/', reviewRoutes);

// async function to connect to DB
async function connectDB() {
  try {
    // connecting to Database with our config.env file and DB is constant in config.env
    await mongoose.connect(process.env.DB);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

function startServer() {
  const hostname = "localhost"; // Define server hostname
  const port = 8000;// Define port number
 
  // Start the server and listen on the specified hostname and port
  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
}

// call connectDB first and when connection is ready we start the web server
connectDB().then(startServer);