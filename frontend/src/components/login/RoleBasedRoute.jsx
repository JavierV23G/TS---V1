import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const getStoredUser = () => {
  const userData = localStorage.getItem('auth_user');
  return userData ? JSON.parse(userData) : null;
};

const RoleBasedRoute = ({ allowedRoles }) => {
  const location = useLocation();
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  const role = user.role;
  const baseRole = role.split(' - ')[0];

  const specialRoles = ['Developer', 'Administrator'];
  const hasAccess = allowedRoles.includes(role) || specialRoles.includes(baseRole);

  if (hasAccess) {
    return <Outlet />;
  }

  return <Navigate to={`/${baseRole.toLowerCase()}/homePage`} replace />;
};

export default RoleBasedRoute;
