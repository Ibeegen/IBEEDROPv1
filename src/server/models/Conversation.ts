import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isGroup: { type: Boolean, default: false },
  name: { type: String },
  lastMessage: { type: String },
  lastMessageAt: { type: Date, default: Date.now },
  unreadCounts: {
    type: Map,
    of: Number,
    default: {}
  }
}, { timestamps: true });

export const Conversation = mongoose.model('Conversation', ConversationSchema);
