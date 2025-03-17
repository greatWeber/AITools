import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { generateImage } from "./api/image";
import {
  CHAT_TAGS,
  TAG_PLACEHOLDERS,
  NEWS_TIP,
  DRAW_TIP,
  BG_IMAGE_TIP,
} from "./constants";
import refreshIcon from "./assets/refresh.svg";
import "./ChatContainer.css";

export default function ChatContainer() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTag, setActiveTag] = useState(CHAT_TAGS.SEARCH.id);
  const [conversationId, setConversationId] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState("");
  const messagesEndRef = useRef(null);

  const tags = Object.values(CHAT_TAGS);

  const handleCopyMessage = (e, text) => {
    e.preventDefault();
    navigator.clipboard.writeText(text).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    });
  };

  const addMessage = (text, sender) => {
    setMessages((prev) => {
      const newMessages = [...prev, { text, sender }];
      if (activeTag !== "mm") {
        sessionStorage.setItem(
          `${activeTag}Messages`,
          JSON.stringify(newMessages)
        );
      }
      return newMessages;
    });
  };

  const handleTagChange = (tagId) => {
    setActiveTag(tagId);
    if (tagId === CHAT_TAGS.MM.id) {
      setMessages([]);
    } else {
      const savedMessages = sessionStorage.getItem(`${tagId}Messages`);
      setMessages(savedMessages ? JSON.parse(savedMessages) : []);
    }
    setConversationId(null);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (activeTag === CHAT_TAGS.NEWS.id) {
      const newsMessage = NEWS_TIP;
      addMessage("AI新闻推送", "user");
      sendMessage(newsMessage);
    } else if (activeTag === CHAT_TAGS.MM.id) {
      const mmMessage = DRAW_TIP;
      addMessage("Girl", "user");
      sendMessage(mmMessage);
    }
  }, [activeTag]);

  const clearHistory = () => {
    setMessages([]);
    sessionStorage.removeItem(`${activeTag}Messages`);
  };

  // eslint-disable-next-line no-unused-vars
  const [botMessage, setBotMessage] = useState("");

  const handleBotMessage = (content) => {
    if (activeTag === "search" || activeTag === "news") {
      setBotMessage((prevBotMessage) => {
        const updatedBotMessage = prevBotMessage + content;
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          if (
            newMessages.length > 0 &&
            newMessages[newMessages.length - 1].sender === "bot"
          ) {
            newMessages[newMessages.length - 1] = {
              text: updatedBotMessage,
              sender: "bot",
            };
          } else {
            newMessages.push({
              text: updatedBotMessage,
              sender: "bot",
            });
          }
          if (activeTag !== "mm") {
            sessionStorage.setItem(
              `${activeTag}Messages`,
              JSON.stringify(newMessages)
            );
          }
          return newMessages;
        });
        return updatedBotMessage;
      });
    }
  };

  const handleDrawMessage = async (userMessage) => {
    const { messageHandler } = await import("./api/MessageHandler");
    const imageUrl = await messageHandler.handleMessage(activeTag, userMessage);
    addMessage(`![Generated Image](${imageUrl})`, "bot");
  };

  const sendMessage = async (customMessage) => {
    if (!customMessage && !inputMessage.trim()) return;

    const userMessage = customMessage || inputMessage;
    if (inputMessage) {
      addMessage(userMessage, "user");
    }

    setInputMessage("");
    setIsLoading(true);
    setBotMessage("");

    try {
      const { messageHandler } = await import("./api/MessageHandler");
      console.log("activeTag", activeTag);
      if (activeTag === "draw" || activeTag === "mm") {
        await handleDrawMessage(userMessage);
      } else {
        const newConversationId = await messageHandler.handleMessage(
          activeTag,
          userMessage,
          handleBotMessage,
          conversationId
        );

        if (newConversationId) {
          setConversationId(newConversationId);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      addMessage("对话暂时不可用，请稍后再试", "bot");
    } finally {
      setIsLoading(false);
    }
  };

  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  useEffect(() => {
    console.log("useEffect triggered");
    const fetchBackgroundImage = async () => {
      const randomIndex = Math.floor(Math.random() * BG_IMAGE_TIP.length);
      const randomTip = BG_IMAGE_TIP[randomIndex];
      const imageUrl = await generateImage(randomTip);
      if (imageUrl) {
        setBackgroundImage(imageUrl);
        document.body.style.backgroundImage = `url(${imageUrl})`;
      }
    };

    const debouncedFetchBackgroundImage = debounce(fetchBackgroundImage, 300);
    debouncedFetchBackgroundImage();

    return () => {
      clearTimeout(debouncedFetchBackgroundImage.timeout);
    };
  }, []);

  return (
    <div
      className="chat-container"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {showToast && <div className="toast">复制成功</div>}
      <div className="messages-container">
        {messages.map((msg, index) => (
          <div
            key={`message-${index}`}
            className={`message ${msg.sender}-message`}
            onContextMenu={(e) => handleCopyMessage(e, msg.text)}
          >
            {msg.sender === "bot" && (
              <img
                src={refreshIcon}
                alt="refresh"
                className="refresh-button"
                onClick={() => sendMessage(messages[index - 1]?.text)}
              />
            )}
            <ReactMarkdown
              rehypePlugins={[rehypeRaw]}
              components={{
                think: ({ children }) => (
                  <div className="think-block">{children}</div>
                ),
              }}
            >
              {msg.text}
            </ReactMarkdown>
          </div>
        ))}
        {isLoading && (
          <div className="message bot-message loading">
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="tags-container">
        {tags.map((tag) => (
          <button
            key={tag.id}
            className={`tag-button ${activeTag === tag.id ? "active" : ""}`}
            onClick={() => handleTagChange(tag.id)}
          >
            {tag.name}
          </button>
        ))}
        {messages.length > 0 && (
          <button className="clear-history-button" onClick={clearHistory}>
            清除历史
          </button>
        )}
      </div>
      <div className="input-area">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          placeholder={TAG_PLACEHOLDERS[activeTag] || ""}
        />
        <button
          onClick={() => sendMessage()}
          disabled={
            activeTag !== CHAT_TAGS.SEARCH.id && activeTag !== CHAT_TAGS.DRAW.id
          }
        >
          发送
        </button>
      </div>
    </div>
  );
}
