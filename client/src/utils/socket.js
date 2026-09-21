import { io } from 'socket.io-client';

// Single shared Socket.IO connection. The httpOnly JWT cookie is sent
// automatically with the handshake (withCredentials), so the server can
// authenticate the socket using the same session as the REST API.
let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io('/', {
      withCredentials: true,
      autoConnect: true,
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
