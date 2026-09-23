import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'hostel-super-secret-jwt-key-2026',
  jwtExpiresIn: '7d',
  geminiApiKey: process.env.GEMINI_API_KEY || ''
};
