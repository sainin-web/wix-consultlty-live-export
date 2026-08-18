// mongoose
const mongoose = require("mongoose")
require("dotenv").config()

const url = process.env.MONGO_DB_URL 
const connectDB = () => {
   if (!url) {
      console.error("MongoDB URL not found in environment variables");
      return;
   }
   return mongoose.connect(url, {
      maxPoolSize: 20,
      minPoolSize: 5,
      socketTimeoutMS: 30000,
      serverSelectionTimeoutMS: 5000,
   })
      .then(() => {
         console.log("MongoDB connected successfully with poolSize 20");
      })
      .catch(err => {
         console.error("MongoDB connection error:", err);
         process.exit(1);
      });
}

module.exports = { connectDB }

