// State
const state = {
  activeCustomerId: null,
  conversations: [
    { id: 'cust_a', name: 'Customer A', status: 'online', avatar: '👨‍💼', lastMessage: 'I am interested in your team plan pricing.', time: '10:42 AM' },
    { id: 'cust_b', name: 'Customer B', status: 'away', avatar: '👩‍💻', lastMessage: 'How do I reset my password?', time: 'Yesterday' },
    { id: 'cust_c', name: 'Customer C', status: 'offline', avatar: '🧔', lastMessage: 'Thanks for the help!', time: 'Mon' },
  ],
  messages: {
    'cust_a': [
      { id: 1, role: 'ai', content: 'Hello! How can I help you today?', timestamp: new Date(Date.now() - 60000).toISOString() },
      { id: 2, role: 'user', content: 'I am interested in your team plan pricing.', timestamp: new Date().toISOString(), salesIntent: false }
    ],
    'cust_b': [
      { id: 1, role: 'ai', content: 'Hi there! What brings you here?', timestamp: new Date(Date.now() - 1000000).toISOString() }
    ],
    'cust_c': []
  },
  isTyping: false
};

// Config
const CONFIG = {
  webhookUrl: import.meta?.env?.VITE_N8N_INTENT_WEBHOOK || 'https://yapbingyen.app.n8n.cloud/webhook/intent',
  bookingUrl: import.meta?.env?.VITE_N8N_BOOKING_WEBHOOK || 'https://yapbingyen.app.n8n.cloud/webhook/send-appointment',
  mockMode: false
};

// DOM Elements
const els = {
  conversationList: document.getElementById('conversation-list'),
  mobileConversationList: document.getElementById('mobile-conversation-list'),
  messagesContainer: document.getElementById('messages-container'),
  messageInput: document.getElementById('message-input'),
  sendButton: document.getElementById('send-button'),
  chatName: document.getElementById('chat-name'),
  chatAvatar: document.getElementById('chat-avatar'),
  headerActions: document.getElementById('header-actions'),
  bookingModal: document.getElementById('booking-modal'),
  bookingModalContent: document.getElementById('booking-modal-content'),
  bookingEmailInput: document.getElementById('booking-email'),
  confirmBookingBtn: document.getElementById('confirm-booking-btn')
};

// Initialization
function init() {
  renderConversations();
  setupEventListeners();
  
  // Select first customer by default
  selectCustomer('cust_a');
}

// Rendering
function renderConversations() {
  const html = state.conversations.map(c => `
    <div onclick="window.selectCustomer('${c.id}')" 
         class="p-4 rounded-xl cursor-pointer transition-all duration-200 group ${state.activeCustomerId === c.id ? 'bg-white shadow-sm border border-orange/20' : 'hover:bg-white/50 border border-transparent'}">
      <div class="flex items-start gap-4">
        <div class="relative">
          <div class="w-12 h-12 rounded-full bg-cream border border-border flex items-center justify-center text-xl shadow-sm group-hover:scale-105 transition-transform">
            ${c.avatar}
          </div>
          <div class="absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-beige rounded-full ${getStatusColor(c.status)}"></div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-start mb-1">
            <h3 class="font-bold text-gray-900 ${state.activeCustomerId === c.id ? 'text-orange' : ''}">${c.name}</h3>
            <span class="text-xs text-gray-400 font-medium">${c.time}</span>
          </div>
          <p class="text-sm text-gray-500 truncate group-hover:text-gray-700 transition-colors">${c.lastMessage}</p>
        </div>
      </div>
    </div>
  `).join('');
  
  els.conversationList.innerHTML = html;
  if (els.mobileConversationList) {
    els.mobileConversationList.innerHTML = html;
  }
}

function renderMessages() {
  const msgs = state.messages[state.activeCustomerId] || [];
  
  if (msgs.length === 0) {
    els.messagesContainer.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full text-gray-400 opacity-50">
        <p>No messages yet.</p>
      </div>`;
    return;
  }

  els.messagesContainer.innerHTML = msgs.map(msg => `
    <div class="flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in">
      <div class="max-w-[80%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}">
        <div class="px-6 py-3.5 rounded-2xl shadow-sm text-sm leading-relaxed ${
          msg.role === 'user' 
            ? 'bg-dark text-white rounded-br-sm' 
            : 'bg-white border border-border text-gray-800 rounded-bl-sm ' + (msg.salesIntent ? 'border-orange/50 ring-2 ring-orange/10' : '')
        }">
          ${msg.content}
          ${msg.salesIntent ? '<div class="mt-2 text-xs font-bold text-orange flex items-center gap-1">🔥 Hot Lead</div>' : ''}
        </div>
        ${msg.role === 'ai' && msg.salesIntent ? '<button onclick="window.openBookingModal()" class="mt-2 bg-orange text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-orange-hover transition-colors shadow-sm">Book Meeting</button>' : ''}
        <span class="text-[10px] text-gray-400 mt-1.5 px-1">
          ${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  `).join('');

  if (state.isTyping) {
    els.messagesContainer.innerHTML += `
      <div class="flex justify-start animate-fade-in">
        <div class="bg-white border border-border px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1">
          <div class="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot"></div>
          <div class="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot"></div>
          <div class="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot"></div>
        </div>
      </div>
    `;
  }

  scrollToBottom();
}

function renderHeader() {
  const customer = state.conversations.find(c => c.id === state.activeCustomerId);
  if (!customer) return;

  els.chatName.textContent = customer.name;
  els.chatAvatar.textContent = customer.avatar;
  
  els.headerActions.innerHTML = '';
}

// Logic
window.selectCustomer = (id) => {
  state.activeCustomerId = id;
  els.messageInput.disabled = false;
  els.sendButton.disabled = false;
  renderConversations();
  renderHeader();
  renderMessages();
  
  // Close mobile sidebar if open
  const mobileSidebar = document.getElementById('mobile-sidebar');
  if (mobileSidebar && !mobileSidebar.classList.contains('hidden')) {
    mobileSidebar.classList.add('hidden');
  }
};

window.openBookingModal = () => {
  els.bookingModal.classList.remove('hidden');
  // Small delay to allow display:block to apply before opacity transition
  setTimeout(() => {
    els.bookingModal.classList.remove('opacity-0');
    els.bookingModalContent.classList.remove('scale-95');
    els.bookingModalContent.classList.add('scale-100');
  }, 10);
  els.bookingEmailInput.focus();
};

window.closeBookingModal = () => {
  els.bookingModal.classList.add('opacity-0');
  els.bookingModalContent.classList.remove('scale-100');
  els.bookingModalContent.classList.add('scale-95');
  setTimeout(() => {
    els.bookingModal.classList.add('hidden');
  }, 300);
};

window.confirmBooking = async (e) => {
  e.preventDefault();
  const email = els.bookingEmailInput.value;
  if (!email) return;

  const btn = els.confirmBookingBtn;
  const originalContent = btn.innerHTML;
  btn.innerHTML = '<span>Sending...</span>';
  btn.disabled = true;
  btn.classList.add('opacity-75');

  try {
    // Call Booking Webhook with the user provided email
    await fetch(CONFIG.bookingUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        customer: state.conversations.find(c => c.id === state.activeCustomerId).name,
        email: email 
      })
    });
    
    btn.innerHTML = '<span>✓ Confirmed</span>';
    btn.classList.replace('bg-orange', 'bg-green-500');
    btn.classList.replace('hover:bg-orange-hover', 'hover:bg-green-600');
    
    setTimeout(() => {
      window.closeBookingModal();
      // Reset button state after modal closes
      setTimeout(() => {
        btn.innerHTML = originalContent;
        btn.classList.replace('bg-green-500', 'bg-orange');
        btn.classList.replace('hover:bg-green-600', 'hover:bg-orange-hover');
        btn.disabled = false;
        btn.classList.remove('opacity-75');
        els.bookingEmailInput.value = ''; // Clear input
        
        // Add confirmation message to chat
        addMessage('ai', `I've sent the meeting details to ${email}. Check your inbox!`);
      }, 300);
    }, 1500);

  } catch (err) {
    console.error(err);
    btn.innerHTML = '<span>Error</span>';
    btn.classList.replace('bg-orange', 'bg-red-500');
    
    setTimeout(() => {
        btn.innerHTML = originalContent;
        btn.classList.replace('bg-red-500', 'bg-orange');
        btn.disabled = false;
        btn.classList.remove('opacity-75');
    }, 2000);
  }
};

async function handleSendMessage() {
  const text = els.messageInput.value.trim();
  if (!text) return;

  // Add User Message
  addMessage('user', text);
  els.messageInput.value = '';
  
  // Set Typing State
  state.isTyping = true;
  renderMessages();

  try {
    // API Call
    let response;
    try {
      const res = await fetch(CONFIG.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      
      if (!res.ok) throw new Error(res.statusText);
      
      const data = await res.json();
      
      // Parse nested JSON if n8n returns stringified body
      if (typeof data === 'string') {
          try { response = JSON.parse(data); } catch { response = data; }
      } else if (data.output && typeof data.output === 'string') {
          try { response = JSON.parse(data.output); } catch { response = data; }
      } else {
          response = data;
      }

    } catch (err) {
      console.warn('API Error, falling back to mock:', err);
      await new Promise(r => setTimeout(r, 1500));
      response = getMockResponse(text);
    }

    // Normalize array responses from n8n
    if (Array.isArray(response)) {
      response = response[0] || {};
    }

    // Process Response
    const aiText = response?.reply || response?.output || response?.message || "I received your message.";
    const isSales = Boolean(response?.sales_intent) || String(response?.intent || '').toLowerCase() === 'sales';

    state.isTyping = false;
    addMessage('ai', aiText, isSales);

  } catch (error) {
    state.isTyping = false;
    addMessage('ai', "Sorry, I'm having trouble connecting right now. Please try again.");
    console.error(error);
  }
}

function addMessage(role, content, salesIntent = false) {
  if (!state.messages[state.activeCustomerId]) state.messages[state.activeCustomerId] = [];
  
  state.messages[state.activeCustomerId].push({
    id: Date.now(),
    role,
    content,
    timestamp: new Date().toISOString(),
    salesIntent
  });

  // Update last message in sidebar
  const cust = state.conversations.find(c => c.id === state.activeCustomerId);
  if (cust) {
    cust.lastMessage = content;
    cust.time = 'Just now';
  }

  renderMessages();
  renderConversations(); // To update last message
  renderHeader();
}

function getMockResponse(input) {
  const lower = input.toLowerCase();
  if (lower.includes('price') || lower.includes('cost') || lower.includes('plan')) {
    return { reply: "Our Team plan starts at $49/mo per user. Would you like to see a full breakdown?", sales_intent: true };
  }
  if (lower.includes('hello') || lower.includes('hi')) {
    return { reply: "Hello! How can I assist you with your sales process today?", sales_intent: false };
  }
  return { reply: "I understand. Could you tell me more about your requirements?", sales_intent: false };
}

// Helpers
function getStatusColor(status) {
  switch(status) {
    case 'online': return 'bg-green-500';
    case 'away': return 'bg-yellow-500';
    default: return 'bg-gray-400';
  }
}

function scrollToBottom() {
  els.messagesContainer.scrollTop = els.messagesContainer.scrollHeight;
}

function setupEventListeners() {
  els.sendButton.addEventListener('click', handleSendMessage);
  els.messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSendMessage();
  });
  
  // Close modal on click outside
  els.bookingModal.addEventListener('click', (e) => {
    if (e.target === els.bookingModal) {
      window.closeBookingModal();
    }
  });
}

// Expose to window for inline onclick handlers
window.init = init;

// Start
init();
