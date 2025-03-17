import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient("hf_xxxxxxxxxxxxxxxxxxxxxxxx");

const chatCompletion = await client.chatCompletion({
  model: "deepseek-ai/DeepSeek-R1",
  messages: [
    {
      role: "user",
      content: "What is the capital of France?",
    },
  ],
  provider: "hyperbolic",
  max_tokens: 500,
});

console.log(chatCompletion.choices[0].message);
