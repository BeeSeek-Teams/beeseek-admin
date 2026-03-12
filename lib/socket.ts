import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3009';

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    const token = Cookies.get('accessToken');
    socket = io(SOCKET_URL, {
      auth: {
        token: `Bearer ${token}`,
      },
    });

    socket.on('connect', () => {
      // connected
    });

    socket.on('connect_error', () => {
      // connection failed — will auto-retry
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
