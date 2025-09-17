import React from 'react';
import { Outlet } from 'react-router-dom';
import { NotificationProvider } from '../../contexts/NotificationContext';

export const RootLayout: React.FC = () => {
  return (
    <NotificationProvider>
      <Outlet />
    </NotificationProvider>
  );
};