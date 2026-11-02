const mongoose = require('mongoose');

/**
 * Safely sanitizes the MongoDB URI to remove any duplicate slashes
 * that would cause "Invalid namespace specified: /pubseal.users"
 */
const sanitizeMongoUri = (rawUri) => {
  if (!rawUri) return 'mongodb://127.0.0.1:27017/pubseal';
  let uri = rawUri.trim();
  const protocolMatch = uri.match(/^(mongodb(?:\+srv)?:\/\/)(.*)$/);
  if (protocolMatch) {
    const protocol = protocolMatch[1];
    const rest = protocolMatch[2].replace(/\/+/g, '/');
    uri = protocol + rest;
  }
  return uri;
};

const connectDB = async () => {
  try {
    const rawUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pubseal';
    const cleanUri = sanitizeMongoUri(rawUri);

    const conn = await mongoose.connect(cleanUri, {
      dbName: 'pubseal',
    });
    console.log(`[PubSeal Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[PubSeal Database Error] ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

