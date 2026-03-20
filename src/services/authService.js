export const authService = {
  login: async (email, password) => {
    console.log('Logging in with:', email, password);
    // Mock successful login
    return { success: true, user: { email, id: 'user-123' } };
  },
  logout: async () => {
    console.log('Logging out');
  }
};
