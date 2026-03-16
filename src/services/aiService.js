// src/services/aiService.js

// No more full ngrok URL — just a local path
const AI_BASE_URL = "/api";

export const sendMessageToAI = async (message) => {
  const response = await fetch(`${AI_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      requesterId: "user001",
      role: "student",
      targetUserId: "user001",
      message: message,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI service error: ${response.status}`);
  }

  const data = await response.json();
  return data.reply || data.message || data.response || data.answer || data.text || JSON.stringify(data);
};