import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

export const initializeSocket = (userId: string) => {
  socket.emit('join_room', userId);
  return socket;
};

export default socket;