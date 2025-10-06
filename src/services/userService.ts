import { v4 as uuidv4 } from 'uuid';

// User interface
export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  balance: number;
}

// Initialize admin in localStorage if not exists
export const initializeAdmin = (): void => {
  const admins = localStorage.getItem('quizAdmins');
  
  if (!admins) {
    const adminData = {
      id: 'admin',
      username: 'admin',
      password: 'admin@123'
    };
    
    localStorage.setItem('quizAdmins', JSON.stringify([adminData]));
  }
};

// Initialize localStorage if not exists
export const initializeUsers = (): void => {
  const users = localStorage.getItem('quizUsers');
  
  if (!users) {
    localStorage.setItem('quizUsers', JSON.stringify([]));
  }
  
  // Also initialize admin
  initializeAdmin();
};

// Get all users
export const getUsers = (): User[] => {
  const users = localStorage.getItem('quizUsers');
  return users ? JSON.parse(users) : [];
};

// Get admin
export const getAdmin = () => {
  const admins = localStorage.getItem('quizAdmins');
  const adminArray = admins ? JSON.parse(admins) : [];
  return adminArray[0] || { id: 'admin', username: 'admin', password: 'admin@123' };
};

// Register a new user
export const registerUser = (userData: {
  username: string;
  email: string;
  password: string;
}): User => {
  const users = getUsers();
  
  const newUser: User = {
    id: uuidv4(),
    username: userData.username,
    email: userData.email,
    password: userData.password,
    balance: 0, // Initial balance
  };
  
  users.push(newUser);
  localStorage.setItem('quizUsers', JSON.stringify(users));
  
  return newUser;
};

// Get user by ID
export const getUserById = (id: string): User | undefined => {
  const users = getUsers();
  return users.find((user) => user.id === id);
};

// Update user balance
export const updateUserBalance = (userId: string, newBalance: number): void => {
  const users = getUsers();
  const userIndex = users.findIndex((user) => user.id === userId);
  
  if (userIndex !== -1) {
    users[userIndex].balance = newBalance;
    localStorage.setItem('quizUsers', JSON.stringify(users));
  }
};

// Delete user
export const deleteUser = (userId: string): void => {
  const users = getUsers();
  const updatedUsers = users.filter((user) => user.id !== userId);
  localStorage.setItem('quizUsers', JSON.stringify(updatedUsers));
};

// Initialize users and admin on first load
initializeUsers();