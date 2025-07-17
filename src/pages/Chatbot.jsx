function Chatbot() {
    return <div class="chat-container">
        <div class="messages" id="messages"></div>
        <form class="input-form" id="input-form">
            <input type="text" id="input" placeholder="Type your question here" autocomplete="off" required />
            <button type="submit">Send</button>
        </form>
    </div>
}

export default Chatbot