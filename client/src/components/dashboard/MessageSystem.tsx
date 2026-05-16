import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Search, 
  MoreVertical, 
  Phone, 
  Video,
  User,
  Hash,
  Circle,
  FileText,
  Image as ImageIcon,
  Camera,
  Link as LinkIcon,
  Trash2,
  CornerDownRight,
  Info,
  BellOff,
  X,
  Plus,
  MessageSquare
} from 'lucide-react';

import axios from 'axios';
import { useAuthStore } from '../../store/useStore';

import api from '../../utils/api';

const MessageSystem = () => {
  const { user } = useAuthStore();
  const [members, setMembers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const [contactSearch, setContactSearch] = useState('');
  const [chatSearch, setChatSearch] = useState('');
  const [isSearchingChat, setIsSearchingChat] = useState(false);
  
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [activeMessageMenu, setActiveMessageMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, conversationsRes] = await Promise.all([
        api.get('/users'),
        api.get('/messages/conversations')
      ]);
      setMembers(usersRes.data.filter((u: any) => u.id !== user?.id));
      setGroups(conversationsRes.data.groups || []);
      
      // Select first available contact
      if (conversationsRes.data.groups?.length > 0) {
        setSelectedContact(conversationsRes.data.groups[0]);
      } else if (usersRes.data.length > 1) {
        const firstMember = usersRes.data.find((u: any) => u.id !== user?.id);
        setSelectedContact({ ...firstMember, type: 'dm' });
      }
    } catch (error) {
      console.error('Error fetching chat data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (conversationId: string) => {
    try {
      await api.post(`/messages/read/${conversationId}`);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  useEffect(() => {
    if (selectedContact) {
      fetchMessages();
      const conversationId = selectedContact.type === 'group' ? selectedContact.id : [user?.id, selectedContact.id].sort().join('-');
      markAsRead(conversationId);
    }
  }, [selectedContact]);

  const fetchMessages = async () => {
    try {
      const conversationId = selectedContact.type === 'group' ? selectedContact.id : [user?.id, selectedContact.id].sort().join('-');
      const response = await api.get(`/messages/${conversationId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName || selectedMemberIds.length === 0) return;
    try {
      const response = await api.post('/messages/groups', {
        name: newGroupName,
        memberIds: [...selectedMemberIds, user?.id]
      });
      setGroups([...groups, response.data]);
      setIsCreateGroupOpen(false);
      setNewGroupName('');
      setSelectedMemberIds([]);
      setSelectedContact(response.data);
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedContact) return;

    const conversationId = selectedContact.type === 'group' ? selectedContact.id : [user?.id, selectedContact.id].sort().join('-');
    
    try {
      const response = await api.post('/messages', {
        conversationId,
        text: inputText
      });
      setMessages([...messages, { ...response.data, isMe: true }]);
      setInputText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const filteredMembers = members.filter(m => m.name.toLowerCase().includes(contactSearch.toLowerCase()));
  const filteredGroups = groups.filter(g => g.name.toLowerCase().includes(contactSearch.toLowerCase()));
  const filteredMessages = messages.filter(m => m.text.toLowerCase().includes(chatSearch.toLowerCase()));

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSearchingChat, chatSearch]);

  const handleSimulateAttachment = (type: string) => {
    setIsAttachMenuOpen(false);
    const mockAttachMsg = {
      id: Date.now().toString(),
      senderId: 'me',
      text: `📎 Attached a ${type}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    setMessages([...messages, mockAttachMsg]);
  };

  const handleDeleteMessage = (id: string) => {
    setMessages(messages.filter(m => m.id !== id));
    setActiveMessageMenu(null);
  };

  if (isLoading || !selectedContact) {
    return (
      <div className="h-[calc(100vh-160px)] flex items-center justify-center bg-surface-light dark:bg-surface-dark rounded-3xl border border-border-light dark:border-border-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-light dark:border-primary-dark"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-160px)] flex bg-surface-light dark:bg-surface-dark rounded-3xl border border-border-light dark:border-border-dark overflow-hidden" onClick={() => { setIsHeaderMenuOpen(false); setIsAttachMenuOpen(false); setActiveMessageMenu(null); }}>
      {/* Sidebar */}
      <div className="w-80 border-r border-border-light dark:border-border-dark flex flex-col relative z-20 bg-surface-light dark:bg-surface-dark">
        <div className="p-6 border-b border-border-light dark:border-border-dark">
          <h2 className="text-xl font-sans font-bold mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark" />
            <input 
              type="text" 
              value={contactSearch}
              onChange={(e) => setContactSearch(e.target.value)}
              placeholder="Search conversations..." 
              className="w-full bg-surface-light-muted dark:bg-surface-dark-muted border border-border-light dark:border-border-dark rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          <div className="px-3 py-2 flex items-center justify-between group">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary-light dark:text-text-secondary-dark">Channels</span>
            {user?.role?.toLowerCase() === 'admin' && (
              <button 
                onClick={() => setIsCreateGroupOpen(true)}
                className="p-1 hover:bg-primary-light/10 text-primary-light rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                title="Create Group"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {filteredGroups.map(group => (
            <button
              key={group.id}
              onClick={() => setSelectedContact({ ...group, type: 'group' })}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${selectedContact.id === group.id ? 'bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark' : 'hover:bg-surface-light-muted dark:hover:bg-surface-dark-muted text-text-secondary-light dark:text-text-secondary-dark'}`}
            >
              <div className="flex items-center gap-3">
                <Hash className="w-4 h-4" />
                <span className="text-sm font-medium">{group.name}</span>
              </div>
            </button>
          ))}

          <div className="px-3 py-2 mt-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary-light dark:text-text-secondary-dark">Direct Messages</div>
          {filteredMembers.map(member => (
            <button
              key={member.id}
              onClick={() => setSelectedContact({ ...member, type: 'dm' })}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedContact.id === member.id ? 'bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark' : 'hover:bg-surface-light-muted dark:hover:bg-surface-dark-muted text-text-secondary-light dark:text-text-secondary-dark'}`}
            >
              <div className="relative shrink-0">
                <img src={member.avatar} className="w-10 h-10 rounded-full border border-border-light dark:border-border-dark bg-surface-light-muted dark:bg-surface-dark-muted" alt="" />
                <Circle className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-surface-light dark:border-surface-dark rounded-full fill-current ${member.status === 'Active' ? 'text-success' : 'text-text-secondary-light'}`} />
              </div>
              <div className="text-left overflow-hidden">
                <p className="text-sm font-medium truncate">{member.name}</p>
                <p className="text-[10px] truncate opacity-70">{member.role}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col relative z-10 bg-surface-light dark:bg-surface-dark">
        {/* Chat Header */}
        <div className="h-20 border-b border-border-light dark:border-border-dark px-8 flex items-center justify-between bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md relative z-30">
          <div className="flex items-center gap-4">
            {selectedContact.type === 'dm' ? (
              <img src={selectedContact.avatar} className="w-10 h-10 rounded-full bg-surface-light-muted dark:bg-surface-dark-muted" alt="" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-surface-light-muted dark:bg-surface-dark-muted flex items-center justify-center">
                <Hash className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="font-sans font-bold text-lg leading-tight">{selectedContact.name}</h3>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                {selectedContact.type === 'dm' ? selectedContact.status : 'Team Channel'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSearchingChat ? (
              <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} className="flex items-center relative mr-2">
                <Search className="absolute left-3 w-4 h-4 text-text-secondary-light" />
                <input 
                  type="text" 
                  autoFocus
                  value={chatSearch}
                  onChange={(e) => setChatSearch(e.target.value)}
                  placeholder="Search in chat..."
                  className="pl-9 pr-8 py-1.5 text-sm bg-surface-light-muted dark:bg-surface-dark-muted rounded-full border border-border-light dark:border-border-dark focus:outline-none"
                />
                <button onClick={() => { setIsSearchingChat(false); setChatSearch(''); }} className="absolute right-2 text-text-secondary-light hover:text-text-primary-light">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              <button onClick={() => setIsSearchingChat(true)} className="p-2 hover:bg-surface-light-muted dark:hover:bg-surface-dark-muted rounded-lg text-text-secondary-light transition-colors" title="Search">
                <Search className="w-5 h-5" />
              </button>
            )}
            <button className="p-2 hover:bg-surface-light-muted dark:hover:bg-surface-dark-muted rounded-lg text-text-secondary-light transition-colors" title="Voice Call">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-surface-light-muted dark:hover:bg-surface-dark-muted rounded-lg text-text-secondary-light transition-colors" title="Video Call">
              <Video className="w-5 h-5" />
            </button>
            
            <div className="relative">
              <button onClick={(e) => { e.stopPropagation(); setIsHeaderMenuOpen(!isHeaderMenuOpen); }} className="p-2 hover:bg-surface-light-muted dark:hover:bg-surface-dark-muted rounded-lg text-text-secondary-light transition-colors" title="More options">
                <MoreVertical className="w-5 h-5" />
              </button>
              <AnimatePresence>
                {isHeaderMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-2 w-48 card bg-surface-light dark:bg-surface-dark shadow-xl z-50 py-1 overflow-hidden"
                  >
                    <button onClick={() => { alert('Contact Info'); setIsHeaderMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-surface-light-muted flex items-center gap-3">
                      <Info className="w-4 h-4" /> Contact info
                    </button>
                    <button onClick={() => { alert('Muted'); setIsHeaderMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-surface-light-muted flex items-center gap-3">
                      <BellOff className="w-4 h-4" /> Mute notifications
                    </button>
                    <div className="h-[1px] bg-border-light dark:bg-border-dark my-1"></div>
                    <button onClick={() => { setMessages([]); setIsHeaderMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-danger/10 text-danger flex items-center gap-3 font-medium">
                      <Trash2 className="w-4 h-4" /> Clear chat
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar relative z-20">
          {filteredMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-text-secondary-light opacity-50 space-y-4">
              <MessageSquare className="w-12 h-12" />
              <p>No messages found.</p>
            </div>
          )}
          {filteredMessages.map((message) => {
            const isMe = message.senderId === user?.id;
            return (
              <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group/msg relative`}>
                <div className={`max-w-[70%] flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                  {!isMe && selectedContact.type === 'dm' && (
                     <img src={selectedContact.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=system'} className="w-8 h-8 rounded-full self-end bg-surface-light-muted" alt="" />
                  )}
                  <div className={`relative flex items-center ${isMe ? 'flex-row-reverse' : ''} gap-2`}>
                    
                    {/* Message Context Menu Button */}
                    <div className={`opacity-0 group-hover/msg:opacity-100 transition-opacity relative`}>
                      <button onClick={(e) => { e.stopPropagation(); setActiveMessageMenu(activeMessageMenu === message.id ? null : message.id); }} className="p-1 hover:bg-surface-light-muted rounded-full text-text-secondary-light">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      <AnimatePresence>
                        {activeMessageMenu === message.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`absolute ${isMe ? 'right-full mr-2' : 'left-full ml-2'} top-0 w-32 card bg-surface-light dark:bg-surface-dark shadow-xl z-50 py-1 overflow-hidden`}
                          >
                            <button onClick={(e) => { e.stopPropagation(); setInputText(`Replying to: "${message.text.substring(0, 20)}..." `); setActiveMessageMenu(null); }} className="w-full text-left px-3 py-2 text-xs hover:bg-surface-light-muted flex items-center gap-2">
                              <CornerDownRight className="w-3 h-3" /> Reply
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteMessage(message.id); }} className="w-full text-left px-3 py-2 text-xs hover:bg-danger/10 text-danger flex items-center gap-2">
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className={`space-y-1 ${isMe ? 'items-end flex flex-col' : 'items-start flex flex-col'}`}>
                      <div className={`px-5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${isMe ? 'bg-primary-light dark:bg-primary-dark text-white dark:text-background-dark rounded-tr-sm' : 'bg-surface-light-muted dark:bg-surface-dark-muted text-text-primary-light dark:text-text-primary-dark rounded-tl-sm border border-border-light dark:border-border-dark'}`}>
                        {message.text}
                      </div>
                      <span className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark px-1 font-medium">{message.time}</span>
                    </div>
                    
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div className="p-6 pt-0 relative z-30">
          <form onSubmit={handleSendMessage} className="bg-surface-light dark:bg-surface-dark border-2 border-border-light dark:border-border-dark rounded-2xl p-2 flex items-center gap-2 focus-within:border-primary-light/50 dark:focus-within:border-primary-dark/50 transition-colors shadow-sm">
            <div className="relative">
              <button type="button" onClick={(e) => { e.stopPropagation(); setIsAttachMenuOpen(!isAttachMenuOpen); }} className="p-2 hover:bg-surface-light-muted dark:hover:bg-surface-dark-muted rounded-xl text-text-secondary-light transition-colors">
                <Paperclip className="w-5 h-5" />
              </button>
              <AnimatePresence>
                {isAttachMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full left-0 mb-4 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-2xl rounded-2xl p-2 flex flex-col gap-2 z-50 w-48"
                  >
                    <button onClick={() => handleSimulateAttachment('Document')} type="button" className="flex items-center gap-3 px-3 py-2 hover:bg-surface-light-muted rounded-xl text-sm font-medium transition-colors group">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform"><FileText className="w-4 h-4" /></div> Document
                    </button>
                    <button onClick={() => handleSimulateAttachment('Image')} type="button" className="flex items-center gap-3 px-3 py-2 hover:bg-surface-light-muted rounded-xl text-sm font-medium transition-colors group">
                      <div className="w-8 h-8 rounded-full bg-pink-500/10 text-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform"><ImageIcon className="w-4 h-4" /></div> Photos & Video
                    </button>
                    <button onClick={() => handleSimulateAttachment('Camera')} type="button" className="flex items-center gap-3 px-3 py-2 hover:bg-surface-light-muted rounded-xl text-sm font-medium transition-colors group">
                      <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform"><Camera className="w-4 h-4" /></div> Camera
                    </button>
                    <button onClick={() => handleSimulateAttachment('Link')} type="button" className="flex items-center gap-3 px-3 py-2 hover:bg-surface-light-muted rounded-xl text-sm font-medium transition-colors group">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform"><LinkIcon className="w-4 h-4" /></div> Link
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message ${selectedContact.name}...`}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-2 outline-none font-medium text-text-primary-light dark:text-text-primary-dark"
            />
            
            <button type="button" className="p-2 hover:bg-surface-light-muted dark:hover:bg-surface-dark-muted rounded-xl text-text-secondary-light transition-colors">
              <Smile className="w-5 h-5" />
            </button>
            <button 
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 bg-primary-light dark:bg-primary-dark text-white dark:text-background-dark rounded-xl disabled:opacity-50 disabled:scale-100 hover:scale-105 transition-all shadow-md"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Create Group Modal */}
      <AnimatePresence>
        {isCreateGroupOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateGroupOpen(false)}
              className="absolute inset-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm"
            ></motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg card bg-surface-light dark:bg-surface-dark p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-sans font-bold">Create New Channel</h3>
                <button onClick={() => setIsCreateGroupOpen(false)} className="p-2 hover:bg-surface-light-muted rounded-lg transition-colors">
                  <X className="w-5 h-5 text-text-secondary-light" />
                </button>
              </div>
              <p className="text-text-secondary-light dark:text-text-secondary-dark mb-8">Collaborate with multiple members in a single channel.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-text-primary-light dark:text-text-primary-dark">Channel Name</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary-light" />
                    <input 
                      type="text" 
                      value={newGroupName}
                      onChange={e => setNewGroupName(e.target.value)}
                      className="input-field pl-10" 
                      placeholder="e.g. project-redesign" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-text-primary-light dark:text-text-primary-dark">Select Members</label>
                  <div className="max-h-48 overflow-y-auto space-y-2 p-2 bg-surface-light-muted dark:bg-surface-dark-muted rounded-xl custom-scrollbar">
                    {members.map(member => (
                      <button
                        key={member.id}
                        onClick={() => {
                          if (selectedMemberIds.includes(member.id)) {
                            setSelectedMemberIds(selectedMemberIds.filter(id => id !== member.id));
                          } else {
                            setSelectedMemberIds([...selectedMemberIds, member.id]);
                          }
                        }}
                        className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${selectedMemberIds.includes(member.id) ? 'bg-primary-light/20 dark:bg-primary-dark/20' : 'hover:bg-surface-light dark:hover:bg-surface-dark'}`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedMemberIds.includes(member.id) ? 'bg-primary-light dark:bg-primary-dark border-primary-light' : 'border-border-light dark:border-border-dark'}`}>
                          {selectedMemberIds.includes(member.id) && <Circle className="w-2 h-2 fill-white" />}
                        </div>
                        <img src={member.avatar} className="w-8 h-8 rounded-full" alt="" />
                        <span className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">{member.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <button 
                    onClick={() => setIsCreateGroupOpen(false)}
                    className="flex-1 py-3 border border-border-light dark:border-border-dark rounded-xl font-medium hover:bg-surface-light-muted dark:hover:bg-surface-dark-muted transition-colors text-text-primary-light dark:text-text-primary-dark"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCreateGroup}
                    disabled={!newGroupName || selectedMemberIds.length === 0}
                    className="flex-[2] py-3 bg-primary-light dark:bg-primary-dark text-white dark:text-background-dark rounded-xl font-bold hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:scale-100"
                  >
                    Create Channel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessageSystem;
