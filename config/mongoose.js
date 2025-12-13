/**
 * MONGOOSE DATABASE CONNECTION
 * 
 * This file manages the connection to MongoDB via Mongoose
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 */
async function connectMongoDB() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crud_practice_db';
    
    await mongoose.connect(mongoURI, {
      // These options are no longer needed in Mongoose 6+, but included for compatibility
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });
    
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
}

/**
 * Disconnect from MongoDB database
 */
async function disconnectMongoDB() {
  try {
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.error('MongoDB disconnection error:', error.message);
    throw error;
  }
}

/**
 * Mongoose connection event listeners
 */
mongoose.connection.on('connected', () => {
  // console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

module.exports = {
  mongoose,
  connectMongoDB,
  disconnectMongoDB
};
