import type { User } from '../types';
import { cn } from '../lib/utils';

interface SidebarProps {
  users: User[];
  currentUserId: string | null;
  onUserSelect: (userId: string) => void;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ users, currentUserId, onUserSelect, isMobile, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <div className={cn(
        'bg-white border-r border-gray-200 flex flex-col',
        isMobile 
          ? cn(
              'fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden',
              isOpen ? 'translate-x-0' : '-translate-x-full'
            )
          : 'w-64 lg:relative lg:translate-x-0'
      )}>
        <div className="p-4 border-b border-gray-200 bg-white/80 backdrop-blur">
          <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
          <p className="mt-1 text-xs text-gray-500">Select a customer to chat</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => {
                onUserSelect(user.id);
                if (isMobile && onClose) onClose();
              }}
              className={cn(
                'w-full text-left p-4 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100',
                currentUserId === user.id && 'bg-purple-50 border-l-4 border-l-purple-500'
              )}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center ring-1 ring-gray-300">
                  <span className="text-gray-600 font-semibold">
                    {user.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-500">Click to chat</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
