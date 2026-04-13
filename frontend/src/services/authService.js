const MOCK_DB = {
  users: []
};

export const mockSignup = (name, email, phone, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const newUser = {
        uid: Math.random().toString(36).substr(2, 9),
        name,
        email,
        phone,
        password, 
        isVerified: true,
        token: `mock-jwt-auth-${Date.now()}`
      };
      resolve(newUser);
    }, 1500);
  });
};

export const mockLogin = (identifier, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Bypassing strict in-memory checking so we don't lose validation when React is refreshed!
      resolve({
        uid: Math.random().toString(36).substr(2, 9),
        name: identifier.split('@')[0],
        email: identifier.includes('@') ? identifier : `${identifier}@simulated.local`,
        phone: identifier.includes('@') ? 'N/A' : identifier,
        isVerified: true,
        token: `mock-jwt-auth-${Date.now()}`
      });
    }, 1000);
  });
};
