import { IMAGE_API_URL, API_KEY } from "../constants";

export const generateImage = async (prompt) => {
  try {
    const response = await fetch(IMAGE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: API_KEY,
      },
      body: JSON.stringify({
        prompt: prompt,
        model: "dall-e-3",
        stream: false,
      }),
    });

    const data = await response.json();
    if (data.data && data.data[0].url) {
      return data.data[0].url;
    }
    throw new Error("No image URL in response");
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
