import mongoose from 'mongoose';

const greetingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  message: { type: String, required: true },
});

export const Greeting = mongoose.model('Greeting', greetingSchema);
