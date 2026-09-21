import { Server } from 'socket.io';
import { verifyJWT } from './tokenUtils.js';
import cookie from 'cookie';

let io = null;

// Tracks userId -> Set of active socket ids
const userSockets = new Map();

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || true,
      credentials: true,
    },
  });

  // Authenticate the socket connection using the same httpOnly JWT cookie
  io.use((socket, next) => {
    try {
      const rawCookie = socket.handshake.headers.cookie;
      if (!rawCookie) return next(new Error('authentication invalid'));

      const { token } = cookie.parse(rawCookie);
      if (!token) return next(new Error('authentication invalid'));

      const { userId, role } = verifyJWT(token);
      socket.user = { userId, role };
      next();
    } catch (error) {
      next(new Error('authentication invalid'));
    }
  });

  io.on('connection', (socket) => {
    const { userId } = socket.user;

    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    // Join a room keyed by userId so we can target a specific user
    socket.join(userId);

    socket.on('disconnect', () => {
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) userSockets.delete(userId);
      }
    });
  });

  return io;
};

export const getIO = () => io;

export const isUserConnected = (userId) => {
  const sockets = userSockets.get(userId.toString());
  return Boolean(sockets && sockets.size > 0);
};

// Emit an event to a specific user's room
export const emitToUser = (userId, event, payload) => {
  if (!io) return;
  io.to(userId.toString()).emit(event, payload);
};
