export const authService = {
  login: async (email: string, password: string) => {
    console.log('Logging in with:', email, password);
    // Mock successful login
    return { success: true, user: { email, id: 'user-123' } };
  },
  logout: async () => {
    console.log('Logging out');
  }
};
