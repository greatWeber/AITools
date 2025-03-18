/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { generateImage } from "./api/image";
import Editor from "./components/Editor";
import {
  CHAT_TAGS,
  TAG_PLACEHOLDERS,
  NEWS_TIP,
  DRAW_TIP,
  BG_IMAGE_TIP,
} from "./constants";
import refreshIcon from "./assets/refresh.svg";
import copyIcon from "./assets/copy.svg";
import "./ChatContainer.css";

export default function ChatContainer() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [pastedImage, setPastedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTag, setActiveTag] = useState(CHAT_TAGS.SEARCH.id);
  const [conversationId, setConversationId] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const isInputDisabled =
    activeTag === CHAT_TAGS.NEWS.id ||
    activeTag === CHAT_TAGS.MM.id ||
    activeTag === CHAT_TAGS.CODE.id;

  const onAIOptimize = async (message, selectedText, language) => {
    setActiveTag(CHAT_TAGS.CODE.id);
    addMessage(selectedText, "user");
    await sendMessage(message);
  };
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
    if (tagId === CHAT_TAGS.CODE.id) {
      setShowEditor(true);
    } else {
      setShowEditor(false);
    }
  };

  useEffect(() => {
    const savedMessages = sessionStorage.getItem(`${activeTag}Messages`);
    if (savedMessages && activeTag !== CHAT_TAGS.MM.id) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

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
  };

  const handleDrawMessage = async (userMessage) => {
    const { messageHandler } = await import("./api/MessageHandler");
    const imageUrl = await messageHandler.handleMessage(activeTag, userMessage);
    addMessage(`![Generated Image](${imageUrl})`, "bot");
  };

  const sendMessage = async (customMessage) => {
    if (!customMessage && !inputMessage.trim() && !pastedImage) return;

    let messageArray = [];
    if (pastedImage) {
      messageArray.push({
        type: "file",
        file_url: {
          url: pastedImage,
        },
      });
    }
    if (inputMessage.trim()) {
      messageArray.push({
        type: "text",
        text: inputMessage.trim(),
      });
    }

    const userMessage = customMessage || messageArray;
    if (inputMessage || pastedImage) {
      addMessage(JSON.stringify(messageArray), "user");
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
      setPastedImage(null);
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
    <>
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
            >
              {msg.sender === "bot" && <div className="bot-avatar"></div>}
              <div className="message-content">
                {msg.sender === "user" ? (
                  <div>
                    {(() => {
                      try {
                        const parsedMessage = JSON.parse(msg.text);
                        return parsedMessage.map((item, i) => (
                          <div key={i}>
                            {item.type === "text" && <p>{item.text}</p>}
                            {item.type === "file" && (
                              <img
                                src={item.file_url.url}
                                alt="用户上传图片"
                                style={{
                                  maxWidth: "200px",
                                  maxHeight: "200px",
                                }}
                              />
                            )}
                          </div>
                        ));
                      } catch {
                        return <p>{msg.text}</p>;
                      }
                    })()}
                  </div>
                ) : (
                  <ReactMarkdown
                    components={{
                      code: ({
                        node,
                        inline,
                        className,
                        children,
                        ...props
                      }) => {
                        const match = /language-([\w-]+)/.exec(className || "");
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                )}
                {msg.sender === "bot" && (
                  <div className="message-actions">
                    <img
                      src={refreshIcon}
                      alt="refresh"
                      className="action-button"
                      onClick={() => sendMessage(messages[index - 1]?.text)}
                    />
                    <img
                      src={copyIcon}
                      alt="copy"
                      className="action-button"
                      onClick={(e) => handleCopyMessage(e, msg.text)}
                    />
                  </div>
                )}
              </div>
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
          {pastedImage && (
            <div className="image-preview">
              <img
                src={pastedImage}
                alt="预览"
                style={{ maxWidth: "200px", maxHeight: "80px" }}
              />
              <button onClick={() => setPastedImage(null)}>删除</button>
            </div>
          )}
          <div className="input-box">
            <input
              type="text"
              value={inputMessage}
              disabled={isInputDisabled}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              onPaste={(e) => {
                const items = e.clipboardData.items;
                for (let i = 0; i < items.length; i++) {
                  if (items[i].type.indexOf("image") !== -1) {
                    const blob = items[i].getAsFile();
                    const reader = new FileReader();
                    reader.onload = (e) => setPastedImage(e.target.result);
                    reader.readAsDataURL(blob);
                    e.preventDefault();
                    break;
                  }
                }
              }}
              placeholder={TAG_PLACEHOLDERS[activeTag] || ""}
            />
            <button
              onClick={() => sendMessage()}
              disabled={isInputDisabled || isLoading}
            >
              发送
            </button>
          </div>
        </div>
      </div>
      <Editor
        visible={showEditor}
        onClose={() => setShowEditor(false)}
        onAIOptimize={onAIOptimize}
      />
    </>
  );
}
