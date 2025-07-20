import "../css/Chatbot.css";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import PromptCarousel from "../components/PromptCarousel";
import { Send } from "lucide-react";


function Chatbot() {
  return (
    <div className="chatbot-ui">
      <div className="chatbot-box">
        <div className="introText">
          <h1>DisasterBot</h1>
          <h2>AI-Enabled Information on Disaster Risk and Response</h2>
          <h3>Ask me anything—or click an example to get started</h3>
          <div className="carousel-container">
            <PromptCarousel />
          </div>
        </div>
        <div className="chat-container">
          <div className="messages"></div>
        </div>
      </div>
      <div className="input-form">
        <div className="text-and-button">
          <TextField
            variant="outlined"
            multiline
            fullWidth
            maxRows={2}
            placeholder="Ask anything..."
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "white",
                color: "black",
              },
              "& fieldset": {
                borderColor: "black",
              },
              "& .Mui-focused fieldset": {
                borderColor: "white",
                borderWidth: 2,
              },
            }}
          />
          <Button variant="contained">
            <Send />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
