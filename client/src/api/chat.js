import { API_URL, API_KEY } from "../constants";

export const sendChatMessage = async (
  message,
  onChunkReceived,
  conversationId = null
) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: API_KEY,
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: message }],
        model: "qwen",
        stream: true,
        conversation_id: conversationId ?? "",
      }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let conversationIdFromResponse = null;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const text = decoder.decode(value);
      const lines = text.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") break;

          try {
            const parsedData = JSON.parse(data);
            if (!conversationIdFromResponse && parsedData.conversation_id) {
              conversationIdFromResponse = parsedData.conversation_id;
            }
            if (parsedData.choices && parsedData.choices[0].delta.content) {
              const content = parsedData.choices[0].delta.content;
              onChunkReceived(content);
            }
          } catch (e) {
            console.error("Error parsing chunk:", e);
          }
        }
      }
    }

    return conversationIdFromResponse;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
