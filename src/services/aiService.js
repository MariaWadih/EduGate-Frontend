// src/services/aiService.js

const AI_BASE_URL = "/api";

export const sendMessageToAI = async (message) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${AI_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      message: message,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI service error: ${response.status}`);
  }

  const data = await response.json();
  return data.text;
};