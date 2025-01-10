import { io } from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_API_URL);

export const initializeSocket = (userId: string) => {
  socket.emit('join_room', userId);
  return socket;
};

export default socket;