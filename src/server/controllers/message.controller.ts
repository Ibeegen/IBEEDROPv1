import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { Message } from '../models/Message.js';
import { User } from '../models/User.js';
import { Conversation } from '../models/Conversation.js';
import { emitToUser } from '../socket.js';

export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    
    let groupConv = await Conversation.findOne({ isGroup: true, name: 'Nhóm Chung' });
    if (!groupConv) {
      groupConv = new Conversation({
        members: [],
        isGroup: true,
        name: 'Nhóm Chung',
        lastMessage: 'Chào mừng bạn tham gia nhóm chung!',
        lastMessageAt: new Date()
      });
      await groupConv.save();
    }

    let query: any = { members: userId };
    if (userRole === 'admin') {
      query = { $or: [{ members: userId }, { isGroup: true }] };
    } else {
      query = { $or: [{ members: userId }, { isGroup: true }] };
    }
    
    const conversations = await Conversation.find(query)
      .populate('members', 'name role phone avatar')
      .sort({ lastMessageAt: -1 });

    const formattedConversations = conversations.map(conv => {
      if (conv.isGroup) {
        return {
          id: conv._id,
          isGroup: true,
          name: conv.name,
          lastMessage: conv.lastMessage,
          lastMessageAt: conv.lastMessageAt,
          unreadCount: (conv as any).unreadCounts?.get(userId.toString()) || 0
        };
      }

      const partner = (conv.members as any).find((m: any) => m._id.toString() !== userId.toString());
      return {
        id: conv._id,
        isGroup: false,
        partner: partner ? {
          id: partner._id,
          fullName: partner.name,
          role: partner.role,
          avatar: partner.avatar
        } : null,
        lastMessage: conv.lastMessage,
        lastMessageAt: conv.lastMessageAt,
        unreadCount: (conv as any).unreadCounts?.get(userId.toString()) || 0
      };
    });

    res.json(formattedConversations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching conversations', error });
  }
};

export const getOrCreateConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { partnerId } = req.body;
    const userId = req.user?.id;

    if (userId === partnerId) {
       return res.status(400).json({ message: 'Cannot chat with yourself' });
    }

    const targetUser = await User.findById(partnerId);
    if (!targetUser || targetUser.status !== 'active') {
      return res.status(404).json({ message: 'Không tìm thấy người nhận hoặc tài khoản đã bị khóa.' });
    }

    let conversation = await Conversation.findOne({
      members: { $all: [userId, partnerId] },
      isGroup: false
    }).populate('members', 'name role phone avatar');

    if (!conversation) {
      conversation = new Conversation({
        members: [userId, partnerId],
        isGroup: false
      });
      await conversation.save();
      await conversation.populate('members', 'name role phone avatar');
    }

    const partner = (conversation.members as any).find((m: any) => m._id.toString() !== userId.toString());

    res.json({
      id: conversation._id,
      isGroup: false,
      partner: {
        id: partner._id,
        fullName: partner.name,
        role: partner.role,
        avatar: partner.avatar
      },
      lastMessage: conversation.lastMessage,
      lastMessageAt: conversation.lastMessageAt,
      unreadCount: (conversation as any).unreadCounts?.get(userId.toString()) || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating conversation', error });
  }
};

export const getMessagesByConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    
    const isMember = conversation.isGroup || conversation.members.some(member => member.toString() === userId?.toString());
    if (!isMember) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const messages = await Message.find({ conversationId })
      .populate('senderId', 'name role')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId, receiverId, content } = req.body;
    const userId = req.user?.id;

    let targetConvId = conversationId;
    let conversation: any;

    if (targetConvId) {
      conversation = await Conversation.findById(targetConvId);
    } else if (receiverId) {
       conversation = await Conversation.findOne({
        members: { $all: [userId, receiverId] },
        isGroup: false
      });

      if (!conversation) {
        const targetUser = await User.findById(receiverId);
        if (!targetUser || targetUser.status !== 'active') {
          return res.status(404).json({ message: 'Không tìm thấy người nhận hoặc tài khoản đã bị khóa.' });
        }

        conversation = new Conversation({
          members: [userId, receiverId],
          isGroup: false
        });
        await conversation.save();
      }
      targetConvId = conversation._id;
    }

    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

    const canSend = conversation.isGroup || conversation.members.some((member: any) => member.toString() === userId?.toString());
    if (!canSend) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const message = new Message({
      conversationId: targetConvId,
      senderId: userId,
      receiverId: conversation.isGroup ? null : (receiverId || conversation.members.find((member: any) => member.toString() !== userId?.toString())),
      content
    });

    await message.save();
    await message.populate('senderId', 'name role');

    const updateQuery: any = {
      $set: { 
        lastMessage: content,
        lastMessageAt: message.createdAt
      }
    };

    if (conversation.isGroup) {
      const allUsers = await User.find({ _id: { $ne: userId } });
      const incObj: any = {};
      allUsers.forEach(u => {
        incObj[`unreadCounts.${u._id}`] = 1;
      });
      updateQuery.$inc = incObj;
    } else {
      updateQuery.$inc = { [`unreadCounts.${receiverId}`]: 1 };
    }

    await Conversation.updateOne({ _id: targetConvId }, updateQuery);

    if (conversation.isGroup) {
      const io = (await import('../socket.js')).getIO();
      io.emit('new_message', message);
    } else {
      emitToUser(receiverId, 'new_message', message);
      emitToUser(receiverId, 'update_contacts', {
        conversationId: targetConvId,
        senderId: userId,
        content: message.content,
        createdAt: message.createdAt
      });
      emitToUser(userId as string, 'new_message', message);
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ message: 'Error sending message', error });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?.id;

    await Message.updateMany(
      { conversationId, receiverId: userId, isRead: false },
      { $set: { isRead: true } }
    );

    const unreadKey = `unreadCounts.${userId}`;
    await Conversation.updateOne(
      { _id: conversationId },
      { $set: { [unreadKey]: 0 } }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error marking messages as read', error });
  }
};

export const getContacts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const users = await User.find({ _id: { $ne: userId }, status: 'active' })
      .select('name role phone avatar');
    
    res.json(users.map(u => ({
      id: u._id,
      fullName: (u as any).name,
      role: u.role,
      phoneNumber: (u as any).phone,
      avatar: (u as any).avatar
    })));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contacts', error });
  }
};
