import React, { useState, useEffect, useRef } from 'react';

function MockInterview({ API_URL }) {
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const endOfMessagesRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    // Initial bot greet
    sendMessageToBackend([], "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessageToBackend = async (currentHistory, messageText) => {
    setIsTyping(true);
    try {
      const geminiHistory = currentHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const response = await fetch(`${API_URL}/api/interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: messageText,
          chatHistory: geminiHistory,
          historyLength: currentHistory.length
        })
      });
      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, { text: data.text || data.reply, sender: 'bot' }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { text: "Error: Could not reach the Aegis neural network.", sender: 'bot' }]);
    }
    setIsTyping(false);
  };

  const handleSend = () => {
    if (!inputVal.trim()) return;
    const newMsg = { text: inputVal, sender: 'user' };
    
    // Explicitly grab previous messages to serve as 'chatHistory'
    const snapshotHistory = [...messages]; 
    
    // Update local React UI Immediately
    setMessages([...messages, newMsg]);
    setInputVal('');
    
    // Send only previous messages + new singular text to avoid sending duplicate user payloads to Gemini
    sendMessageToBackend(snapshotHistory, newMsg.text);
  };

  return (
    <div className="layout-col page-fade-in opportunities-page">
      <div className="header-box">
        <h1>Protocol Mock Interview</h1>
        <p>Strict Tech Lead Conversational AI Filter</p>
      </div>

      <div className="glass chat-container">
        <div className="chat-history">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-wrapper ${msg.sender}`}>
              <div className={`message-bubble ${msg.sender}`}>
                {msg.text.split('\n').map((line, i) => (
                    <React.Fragment key={i}>{line}<br/></React.Fragment>
                ))}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="message-wrapper bot">
              <div className="message-bubble bot typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={endOfMessagesRef} />
        </div>
        
        <div className="chat-input-area">
          <input 
            type="text" 
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Write your technical explanation here..."
            disabled={isTyping}
          />
          <button onClick={handleSend} disabled={isTyping || !inputVal.trim()} className="action-btn">
             Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default MockInterview;
