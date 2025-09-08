import mongoose from 'mongoose';

const connection: { isConnected?: number } = {};

async function connect() {
  // Check if we already have a connection to the database.
  if (connection.isConnected) {
    console.log('Already connected to the database.');
    return;
  }

  // Check if there are any existing connections that we can use.
  if (mongoose.connections.length > 0) {
    connection.isConnected = mongoose.connections[0].readyState;
    if (connection.isConnected === 1) {
      console.log('Use previous database connection.');
      return;
    }
    // If the connection is not ready, disconnect it. We will create a new one.
    await mongoose.disconnect();
  }

  // Create a new database connection.
  // The '!' tells TypeScript that MONGODB_URI is definitely set.
  const db = await mongoose.connect(process.env.MONGODB_URI!);
  console.log('New database connection established.');
  connection.isConnected = db.connections[0].readyState;
}

export default connect;