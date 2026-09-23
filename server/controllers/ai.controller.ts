import { Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { sendError, sendSuccess } from '../utils/response.js';

let aiClient: GoogleGenAI | null = null;
function getAI() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

export async function chatAssistant(req: AuthenticatedRequest, res: Response) {
  try {
    const { message, history } = req.body;
    if (!message) {
      return sendError(res, 'Message text is required', null, 400);
    }

    const role = req.user?.role || 'STUDENT';
    const userName = req.user?.name || 'Resident';

    const systemInstruction = `You are "HostelAI", the intelligent 24x7 assistant embedded into the Hostel Management System.
The current user is "${userName}" with role "${role}".

Hostel Facts & Operational Rules:
- Gate Timings: Hostel main gates close strictly at 10:00 PM. Night biometric roll-call is marked by the warden between 9:45 PM and 10:15 PM.
- Leave Protocol: Students must apply for leave via the Leave Request portal at least 24 hours in advance. Emergency contact must be provided. Warden approval is required.
- Mess Schedule: Breakfast (7:30 AM - 9:30 AM), Lunch (12:30 PM - 2:30 PM), Snacks (5:00 PM - 6:00 PM), Dinner (7:45 PM - 9:45 PM).
- Complaints: Maintenance issues (Electrical, Plumbing, Cleaning, Internet) should be logged under the Complaints tab; typical turnaround is 24-48 hours.
- Room Allocations: Managed solely by Hostel Admin and Wardens. Room change requests require a documented transfer application.
- Visitors: Allowed only between 9:00 AM and 6:30 PM in the visitor lounge with valid government ID.

Guidelines:
- Tone: Highly professional, polite, concise, and helpful.
- Direct users to the exact section in the app when appropriate (e.g. "You can check your payment history under the Fees tab in the sidebar").
- Keep formatting clean with bullet points and bold highlights when useful.`;

    const ai = getAI();
    if (!ai) {
      // Graceful fallback when API key is not configured
      const fallbackReply = `Hello ${userName}! As your Hostel Assistant, I'm here to help with questions regarding hostel timings (gates close at 10:00 PM), leave requests (apply via the Leave tab), mess timings, or lodging maintenance complaints. Please let me know what you need assistance with!`;
      return sendSuccess(res, 'Reply generated', { reply: fallbackReply });
    }

    // Build chat contents from history
    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const turn of history.slice(-8)) {
        contents.push({
          role: turn.role === 'user' ? 'user' : 'model',
          parts: [{ text: turn.text }]
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction
      }
    });

    const reply = response.text || 'I am currently processing hostel policies. How else can I assist you today?';
    return sendSuccess(res, 'Chat response generated', { reply });
  } catch (err: any) {
    console.error('Gemini chat assistant error:', err);
    return sendSuccess(res, 'Chat response fallback', {
      reply: 'Hostel services are fully active. For room allocations, leave applications, or mess complaints, please browse the relevant navigation items on your sidebar.'
    });
  }
}
