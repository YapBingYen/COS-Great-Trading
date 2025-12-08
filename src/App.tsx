import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { ChatArea } from './components/ChatArea';
import { ChatInput } from './components/ChatInput';
import { useChat } from './hooks/useChat';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const {
    users,
    currentUser,
    messages,
    isLoading,
    sendMessage,
    bookAppointment,
    switchUser,
  } = useChat();

  const handleSendMessage = (message: string) => {
    sendMessage(message);
  };

  const handleBookAppointment = () => {
    bookAppointment();
  };

  const showBookingButton = messages.length > 0 && 
    messages[messages.length - 1]?.intent === 'SALES' &&
    messages[messages.length - 1]?.sender === 'ai';

  return (
    <div className="flex h-screen bg-white">
      <div className="absolute inset-x-0 top-0 z-30">
        <Navbar />
      </div>
      <Sidebar
        users={users}
        currentUserId={currentUser?.id || null}
        onUserSelect={switchUser}
        isMobile={true}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <div className="hidden lg:flex">
        <Sidebar
          users={users}
          currentUserId={currentUser?.id || null}
          onUserSelect={switchUser}
        />
      </div>

      <div className="flex-1 flex flex-col pt-20">
        <div className="bg-white/80 backdrop-blur border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-800">
                {currentUser?.name || 'Select a conversation'}
              </h1>
              <p className="text-sm text-gray-500">
                {messages.length > 0 ? 'Active conversation' : 'No messages yet'}
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            AI Sales Agent Demo
          </div>
        </div>

        {currentUser ? (
          <>
            <ChatArea
              messages={messages}
              isLoading={isLoading}
              onBookAppointment={handleBookAppointment}
              showBookingButton={showBookingButton}
            />
            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={isLoading}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-600 mb-2">Welcome to AI Sales Agent</h2>
              <p className="text-gray-500">Select a conversation from the sidebar to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
