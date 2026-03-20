export const authService = {
  login: async (identifier, password) => {
    console.log('Logging in with:', identifier, password);
    // Mock successful login with loyalty info
    return { 
      success: true, 
      user: { 
        id: 'user-123',
        name: 'Alex Doe',
        email: identifier.includes('@') ? identifier : `${identifier}@example.com`,
        loyaltyStatus: 'Gold Member',
        points: 4250
      } 
    };
  },
  logout: async () => {
    console.log('Logging out');
  }
};
