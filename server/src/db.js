import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

export async function connectDatabase() {
  let uri = process.env.MONGODB_URI;

  if (!uri) {
    const memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri('hello');
    console.log('No MONGODB_URI set. Using an in-memory MongoDB.');
  }

  await mongoose.connect(uri);
  return mongoose.connection;
}
