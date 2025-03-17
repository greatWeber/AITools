import express from "express";
import { InferenceClient } from "@huggingface/inference";
import cors from "cors";

const app = express();
const PORT = 3000;
const client = new InferenceClient("");

app.use(cors());
app.use(express.json());
app.use(express.static("."));

app.post("/chat", async (req, res) => {
  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await client.chatCompletionStream({
      model: "deepseek-ai/DeepSeek-R1",
      messages: [{ role: "user", content: req.body.message }],
      provider: "hyperbolic",
      max_tokens: 500,
      temperature: 0.7,
      top_p: 0.95,
      stream: true,
    });

    for await (const chunk of stream) {
      if (chunk.choices[0]?.delta?.content) {
        res.write(
          `data: ${JSON.stringify({ chunk: chunk.choices[0].delta.content })}

`
        );
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("API Error:", error);
    res.write(`data: ${JSON.stringify({ error: "AI服务暂时不可用" })}\n\n`);
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
