import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: { type: String, required: true },
  type: { type: String, enum: ['text'], default: 'text' },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

export const Message = mongoose.model('Message', MessageSchema);
