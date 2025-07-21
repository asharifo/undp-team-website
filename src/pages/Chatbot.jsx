import "../css/Chatbot.css";
import { useState } from "react";
import PromptCarousel from "../components/PromptCarousel";
import InputForm from "../components/InputForm";
import ChatMessage from "../components/ChatMessage";

function Chatbot() {
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const generateBotResponse = (userMessage) => {
    return "DisasterBot's response will show here"
  }

  const handleSendMessage = async (messageText) => {
    if (!hasStartedChat) {
      setHasStartedChat(true);
    }
    const userMessage = {
      id: Date.now().toString(), //!!!
      text: messageText,
      isBot: false,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {  //placeholder for api call
      const botResponse = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(messageText),
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="chatbot-ui">
      <div className="chatbot-box">
        {!hasStartedChat ? (
          <div className="introText">
            <h1>DisasterBot</h1>
            <h2>AI-Enabled Information on Disaster Risk and Response</h2>
            <h3>Ask me anything—or click an example to get started</h3>
            <div className="carousel-container">
              <PromptCarousel onPromptSelect={handleSendMessage}/>
            </div>
          </div>
        ) : (
          <div className="messages">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message.text}
                isBot={message.isBot}
                timestamp={message.timestamp}/>
            ))}
          </div>
        )}
      </div>
      <div className="input-form">
        <InputForm onSendMessage={handleSendMessage} disabled={isTyping}/>
      </div>
    </div>
  );
}

export default Chatbot;
