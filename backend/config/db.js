const mongoose = require('mongoose');

let isConnected = false;
let useMockStore = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/postwise_ai';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 1500,
    });
    isConnected = true;
    useMockStore = false;
    console.log(`[Database] MongoDB Connected successfully: ${mongoose.connection.host}`);
  } catch (error) {
    console.warn(`[Database Warning] Could not connect to MongoDB (${error.message}).`);
    console.warn(`[Database Mode] Operating in memory-mock fallback mode so all API endpoints function seamlessly.`);
    isConnected = false;
    useMockStore = true;
  }
};

const getDBStatus = () => {
  const ready = mongoose.connection.readyState === 1;
  return {
    isConnected: ready || isConnected,
    useMockStore: !ready,
  };
};

module.exports = { connectDB, getDBStatus };
