import React, { useState } from 'react';
import axios from 'axios';

const DialogflowChat = () => {
    const [input, setInput] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        setLoading(true);
        setResponse('');

        try {
            const result = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful assistant for Oklahoma State University campus-related questions.',
                        },
                        {
                            role: 'user',
                            content: input,
                        },
                    ],
                    max_tokens: 100,
                    temperature: 0.6,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            const reply = result.data.choices[0].message.content.trim();
            setResponse(reply);
        } catch (error) {
            console.error('GPT error:', error);
            setResponse('Sorry, something went wrong while contacting GPT.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '1rem', borderRadius: '8px' }}>
            <h2 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Ask Pete</h2>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about a building, amenity, etc..."
                style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    marginBottom: '0.5rem',
                    border: '1px'
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSend();
                }}
            />
            <button onClick={handleSend} disabled={loading} style={{ padding: '0.4rem 1rem' }}>
                {loading ? 'Sending...' : 'Send'}
            </button>
            {response && (
                <p style={{ marginTop: '1rem', color: '#111827' }}>
                    <strong>Response:</strong> {response}
                </p>
            )}
        </div>
    );
};

export default DialogflowChat;
