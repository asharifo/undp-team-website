import "../css/Chatbot.css";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import PromptCarousel from "../components/PromptCarousel";

function Chatbot() {
  return (
    <div className="chatbot-ui">
      <div className="chatbot-box">
        <div className="introText">
          <h1>DisasterBot</h1>
          <h2>Artificial Intelligence for your Disaster-Related Questions</h2>
          <h3>Ask your own questions or try an example</h3>
          <PromptCarousel />
        </div>
        <div className="chat-container">
          <div className="messages"></div>
        </div>
      </div>
      <div className="input-form">
        <TextField
          variant="outlined"
          multiline="true"
          color="white"
        />
        <Button variant="contained">Send</Button>
      </div>
    </div>
  );
}

export default Chatbot;
