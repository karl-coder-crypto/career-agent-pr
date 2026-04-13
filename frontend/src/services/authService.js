const MOCK_DB = {
  users: []
};

export const mockSignup = (name, email, phone, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const exists = MOCK_DB.users.find(u => u.email === email || u.phone === phone);
      if (exists) return reject(new Error("Email or Phone already authenticated within Cloud Matrix."));
      
      const newUser = {
        uid: Math.random().toString(36).substr(2, 9),
        name,
        email,
        phone,
        password, 
        isVerified: true
      };
      MOCK_DB.users.push(newUser);
      resolve(newUser);
    }, 1500);
  });
};

export const mockLogin = (identifier, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = MOCK_DB.users.find(u => (u.email === identifier || u.phone === identifier) && u.password === password);
      if (!user) return reject(new Error("Invalid parameters mapped to Identity Service."));
      resolve(user);
    }, 1000);
  });
};
