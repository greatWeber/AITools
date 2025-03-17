class MessageHandler {
  constructor() {
    this.handlers = {
      search: this.handleSearchMessage,
      draw: this.handleDrawMessage,
      mm: this.handleDrawMessage,
      news: this.handleSearchMessage,
    };
  }

  async handleMessage(type, message, onChunkReceived) {
    const handler = this.handlers[type];
    if (!handler) {
      throw new Error(`未知的消息类型: ${type}`);
    }
    return handler(message, onChunkReceived);
  }

  async handleSearchMessage(message, onChunkReceived) {
    const { sendChatMessage } = await import("./chat");
    return sendChatMessage(message, onChunkReceived);
  }

  async handleDrawMessage(message) {
    const { generateImage } = await import("./image");
    const imageUrl = await generateImage(message);
    return imageUrl;
  }
}

export const messageHandler = new MessageHandler();
