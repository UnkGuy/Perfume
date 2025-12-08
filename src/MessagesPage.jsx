import React from 'react';
import { User, Send, ShoppingBag } from 'lucide-react'; // Removed 'X' import as it's no longer used
import Header from './Header';

const MessagesPage = ({ setCurrentPage, cartItems }) => (
  <div className="messages-container">
    <Header setCurrentPage={setCurrentPage} cartItems={cartItems} />

    <div className="messages-layout-single" style={{marginTop: '20px', minHeight: '600px'}}>
      <div className="chat-area">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-user-info">
            <div className="chat-avatar">
              <User size={20} />
            </div>
            <div>
              <h3 className="chat-user-name">KL Scents PH Seller</h3>
              <div className="online-status">
                <div className="online-dot"></div>
                <span className="online-text">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="chat-messages">
          {/* 1. Seller Greeting */}
          <div className="message-wrapper">
            <div className="message-avatar">
              <User size={16} />
            </div>
            <div className="message-content">
              <div className="message-bubble received">
                <p className="message-text">Hello! Welcome to KL Scents PH. How can I help you today? 👋</p>
              </div>
              <span className="message-time received">10:30 AM</span>
            </div>
          </div>

          {/* 2. Example of a PREVIOUS Order (Sent by User) to show off the style */}
          <div className="message-wrapper sent">
            <div className="message-content">
              
              {/* STYLED ORDER BUBBLE */}
              <div className="order-bubble">
                <div className="order-header">
                  <ShoppingBag size={16} />
                  <span className="order-header-text">Order Inquiry</span>
                </div>
                <div className="order-content">
                  <p className="message-text" style={{marginBottom: '0.75rem'}}>Hi! I would like to inquire about this order:</p>
                  
                  <div className="order-item-row">
                    <span>2x Luxury Parfum 1</span>
                    <span>₱198</span>
                  </div>
                  <div className="order-item-row">
                    <span>1x Luxury Parfum 4</span>
                    <span>₱129</span>
                  </div>
                  
                  <div className="order-total-row">
                    <span className="order-total-label">Total Estimate</span>
                    <span className="order-total-value">₱327</span>
                  </div>
                </div>
              </div>

              <span className="message-time sent">10:32 AM</span>
            </div>
          </div>

          {/* 3. Seller Reply */}
          <div className="message-wrapper">
            <div className="message-avatar">
              <User size={16} />
            </div>
            <div className="message-content">
              <div className="message-bubble received">
                <p className="message-text">I see you're interested in those! Yes, we have stocks available. Shall I prepare the payment link for you? 🧴✨</p>
              </div>
              <span className="message-time received">10:33 AM</span>
            </div>
          </div>
        </div>

        {/* Chat Input Area */}
        <div className="chat-input-area" style={{padding: 0, flexDirection: 'column', gap: 0}}>
          
          {/* REMOVED: The Order Summary Attachment Box was here */}

          {/* Actual Input Row */}
          <div className="chat-input-wrapper" style={{borderTop: '1px solid #333', borderRadius: '0 0 1rem 1rem'}}>
            <input 
              type="text" 
              className="chat-input" 
              // Pre-filled text as requested
              defaultValue="Hi, I would like to order these items. Are they available?" 
            />
            <button className="btn-send">
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default MessagesPage;