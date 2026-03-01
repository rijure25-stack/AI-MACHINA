import React, { useState, useEffect, useRef } from 'react';
import { Bell, AlertTriangle, CalendarClock, Sparkles, Trash2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';

type Notification = {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'reminder' | 'insight';
  timestamp: string;
  read: boolean;
};

const initialNotifications: Notification[] = [
  {
    id: '1',
    title: 'pH Level Warning',
    message: 'pH level dropped below 6.8 in Digester 1. Consider adding buffer.',
    type: 'alert',
    timestamp: '10 mins ago',
    read: false,
  },
  {
    id: '2',
    title: 'Maintenance Due',
    message: 'Inspect mechanical shredder blades.',
    type: 'reminder',
    timestamp: '2 hours ago',
    read: false,
  },
  {
    id: '3',
    title: 'Optimal Performance',
    message: 'System health is stable. Current sensor data indicates optimal methanogenesis.',
    type: 'insight',
    timestamp: '5 hours ago',
    read: true,
  }
];

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const dismissNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'reminder': return <CalendarClock className="h-4 w-4 text-[#2979FF]" />;
      case 'insight': return <Sparkles className="h-4 w-4 text-emerald-500" />;
      default: return <Bell className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative rounded-full hover:bg-slate-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 origin-top-right rounded-xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-4 py-3">
              <h3 className="font-semibold text-slate-900">Notifications</h3>
              {notifications.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAll} className="h-8 text-xs text-slate-500 hover:text-red-600">
                  Clear All
                </Button>
              )}
            </div>
            
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bell className="h-8 w-8 text-slate-300 mb-2" />
                  <p className="text-sm text-slate-500">No new notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`relative flex gap-3 p-4 transition-colors hover:bg-slate-50 ${!notification.read ? 'bg-blue-50/30' : ''}`}
                    >
                      <div className="mt-1 shrink-0">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium ${!notification.read ? 'text-slate-900' : 'text-slate-700'}`}>
                            {notification.title}
                          </p>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">{notification.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 pt-2">
                          {!notification.read && (
                            <button 
                              onClick={() => markAsRead(notification.id)}
                              className="text-[10px] font-medium text-[#2979FF] hover:text-[#2979FF]/80 flex items-center gap-1"
                            >
                              <Check className="h-3 w-3" /> Mark as read
                            </button>
                          )}
                          <button 
                            onClick={() => dismissNotification(notification.id)}
                            className="text-[10px] font-medium text-slate-400 hover:text-red-500 flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" /> Dismiss
                          </button>
                        </div>
                      </div>
                      {!notification.read && (
                        <div className="absolute left-0 top-0 h-full w-1 bg-[#2979FF]" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
