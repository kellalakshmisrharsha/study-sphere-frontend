import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  encrypted: {
    type: Boolean,
    default: false,
  },
});

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

export default Message;
