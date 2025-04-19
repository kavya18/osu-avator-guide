import React, { useState } from 'react';
import axios from 'axios';

const DialogflowChat = () => {
    const [input, setInput] = useState('');
    const [response, setResponse] = useState('');

    const handleSend = async () => {
        try {
            const res = await axios.post('api/dialogflow', {
                text: input
            });
            setResponse(res.data.reply);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };


    return (
        <div>
            <h2>Dialogflow Chat</h2>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
            />
            <button onClick={handleSend}>Send</button>
            <p>Response: {response}</p>
        </div>
    );
};

export default DialogflowChat;
