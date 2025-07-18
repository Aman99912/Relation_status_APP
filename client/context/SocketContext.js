import React, { createContext } from 'react';
import socket from '../utils/socket';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => (
  <SocketContext.Provider value={socket}>
    {children}
  </SocketContext.Provider>
);
