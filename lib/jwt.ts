import jwt from 'jsonwebtoken';

export const signToken = (id: string): string => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  // Use the same approach everywhere
  return jwt.sign({ id }, secret, { expiresIn: '7d' });
};

export const verifyToken = (token: string) => {
  try {
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }

    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};