"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  ChatCircle, 
  MagnifyingGlass, 
  PaperPlaneRight,
  Clock,
  ArrowClockwise,
  CheckCircle,
  SpinnerGap
} from "@phosphor-icons/react";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminInput } from "@/components/AdminInput";
import { AdminBadge } from "@/components/AdminBadge";
import { getAllTickets, getTicketDetails, claimTicket, resolveTicket, sendSupportMessage, Ticket, TicketMessage } from "@/lib/support";
import { getSocket } from "@/lib/socket";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";

export default function SupportPage() {
  const admin = useAuthStore((state) => state.user);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await getAllTickets();
      setTickets(data);
    } catch (err) {
      toast.error("Couldn't load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    socket.on('newTicket', (ticket: Ticket) => {
      setTickets((prev) => [ticket, ...prev]);
    });
    return () => { socket.off('newTicket'); };
  }, []);

  useEffect(() => {
    if (!selectedTicket) return;

    const fetchDetails = async () => {
      try {
        const data = await getTicketDetails(selectedTicket.id);
        setMessages(data.messages || []);
      } catch (err) {
        toast.error("Couldn't load messages");
      }
    };

    fetchDetails();

    const socket = getSocket();
    socket.emit('joinTicket', selectedTicket.id);

    socket.on('newSupportMessage', (message: TicketMessage) => {
      setMessages((prev) => {
        if (prev.some(m => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    socket.on('ticketStatusChanged', (data) => {
      setSelectedTicket((prev) => {
        if (!prev) return prev;
        return { ...prev, status: data.status };
      });
    });

    return () => {
      socket.emit('leaveTicket', selectedTicket.id);
      socket.off('newSupportMessage');
      socket.off('ticketStatusChanged');
    };
  }, [selectedTicket?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleClaim = async () => {
    if (!selectedTicket) return;
    try {
      const updated = await claimTicket(selectedTicket.id);
      setSelectedTicket(updated);
      setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
      toast.success("Ticket claimed — you're now assigned.");
    } catch (err) {
      toast.error("Couldn't claim ticket");
    }
  };

  const handleSendMessage = async () => {
    if (!selectedTicket || !messageInput.trim()) return;
    try {
      setSending(true);
      await sendSupportMessage(selectedTicket.id, messageInput);
      setMessageInput("");
    } catch (err) {
      toast.error("Couldn't send message");
    } finally {
      setSending(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedTicket) return;
    try {
      const updated = await resolveTicket(selectedTicket.id);
      setSelectedTicket(updated);
      setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
      toast.success("Ticket resolved");
    } catch (err) {
      toast.error("Couldn't resolve ticket");
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-4 md:gap-6">
      <AdminHeader 
        title="Support" 
        description="Claim tickets and chat with users in real time."
      />

      <div className="flex-1 flex flex-col lg:flex-row gap-4 md:gap-6 overflow-hidden">
        {/* Tickets List */}
        <div className="w-full lg:w-1/3 flex flex-col gap-3 max-h-[40vh] lg:max-h-none">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <AdminInput 
                placeholder="Search tickets..." 
                icon={<MagnifyingGlass size={16} weight="bold" className="text-black/20" />}
              />
            </div>
            <button 
              onClick={fetchTickets}
              disabled={loading}
              className="p-2.5 bg-white border border-black/5 rounded-xl text-black/30 hover:bg-black/[0.02] transition-colors disabled:opacity-50 shrink-0"
            >
              <ArrowClockwise size={16} weight="bold" className={loading ? "animate-spin" : ""} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-28 bg-black/[0.02] rounded-2xl animate-pulse" />
              ))
            ) : tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <ChatCircle size={32} weight="duotone" className="text-black/10" />
                <p className="text-sm text-black/25">No tickets yet.</p>
              </div>
            ) : (
              tickets.map((ticket) => (
                <div 
                  key={ticket.id} 
                  onClick={() => setSelectedTicket(ticket)}
                  className={`bg-white border p-4 rounded-2xl hover:border-primary/30 transition-all cursor-pointer group ${
                    selectedTicket?.id === ticket.id ? "border-primary ring-1 ring-primary/20" : "border-black/5"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[10px] text-black/20 font-mono font-bold">#{ticket.id.slice(0, 8)}</p>
                    <AdminBadge 
                      variant={
                        ticket.status === 'OPEN' ? 'error' : 
                        ticket.status === 'IN_PROGRESS' ? 'warning' : 'success'
                      }
                    >
                      {ticket.status === 'IN_PROGRESS' ? 'In Progress' : ticket.status}
                    </AdminBadge>
                  </div>
                  <p className="text-sm font-bold group-hover:text-primary transition-colors line-clamp-2">
                    {ticket.subject}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-black/[0.03] flex items-center justify-center text-[9px] font-bold text-primary">
                        {ticket.user.firstName[0]}{ticket.user.lastName[0]}
                      </div>
                      <p className="text-xs text-black/30">{ticket.user.firstName} {ticket.user.lastName}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={11} weight="bold" className="text-black/15" />
                      <p className="text-[10px] text-black/20">{formatDistanceToNow(new Date(ticket.createdAt))} ago</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 min-h-[300px] bg-white border border-black/5 rounded-2xl flex flex-col overflow-hidden">
          {selectedTicket ? (
            <>
              {/* Chat Header */}
              <div className="px-5 py-4 border-b border-black/5 bg-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {selectedTicket.user.firstName[0]}{selectedTicket.user.lastName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{selectedTicket.user.firstName} {selectedTicket.user.lastName}</p>
                    <p className="text-[10px] text-black/25 truncate max-w-[200px]">{selectedTicket.subject}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedTicket.status === 'OPEN' ? (
                    <button onClick={handleClaim} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity">
                      <ChatCircle size={14} weight="bold" />
                      Claim
                    </button>
                  ) : selectedTicket.status === 'IN_PROGRESS' ? (
                    <button onClick={handleResolve} className="flex items-center gap-1.5 px-4 py-2 bg-success text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity">
                      <CheckCircle size={14} weight="bold" />
                      Resolve
                    </button>
                  ) : (
                    <AdminBadge variant="success">Resolved</AdminBadge>
                  )}
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 px-5 py-6 overflow-y-auto bg-[#FAFAFA] space-y-4 custom-scrollbar">
                {messages.map((msg) => {
                  const isMine = msg.isFromSupport;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div className="max-w-[75%]">
                        <div className={`px-4 py-3 rounded-2xl ${
                          isMine 
                            ? "bg-primary text-white rounded-tr-sm" 
                            : "bg-white border border-black/5 rounded-tl-sm"
                        }`}>
                          {msg.type === 'image' && msg.mediaUrl ? (
                            <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer">
                              <img src={msg.mediaUrl} alt="Shared image" className="max-w-[280px] rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity" />
                            </a>
                          ) : msg.type === 'audio' && msg.mediaUrl ? (
                            <div className="flex flex-col gap-1">
                              <audio controls src={msg.mediaUrl} className="max-w-[260px] h-10" preload="metadata" />
                              <p className={`text-[10px] ${isMine ? "text-white/60" : "text-black/25"}`}>Voice message</p>
                            </div>
                          ) : (
                            <p className={`text-sm leading-relaxed ${isMine ? "text-white" : "text-black/70"}`}>{msg.text}</p>
                          )}
                        </div>
                        <p className={`text-[10px] text-black/20 mt-1 ${isMine ? "text-right" : "text-left"}`}>
                          {format(new Date(msg.createdAt), "h:mm a")}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Footer */}
              <div className="px-5 py-4 border-t border-black/5 bg-white">
                <div className="relative">
                  <AdminInput 
                    placeholder={selectedTicket.status === 'RESOLVED' ? "Ticket resolved." : selectedTicket.assignedAdminId ? "Type a message..." : "Claim the ticket to reply."} 
                    className="pr-24 h-12 bg-black/[0.02] border-black/5 rounded-xl"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    disabled={selectedTicket.status === 'RESOLVED' || !selectedTicket.assignedAdminId || sending}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && selectedTicket.assignedAdminId) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                    <button 
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || sending || selectedTicket.status === 'RESOLVED' || !selectedTicket.assignedAdminId}
                      className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 transition-all disabled:opacity-30"
                    >
                      {sending ? <SpinnerGap size={14} weight="bold" className="animate-spin" /> : <PaperPlaneRight size={14} weight="bold" />}
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-xs mx-auto">
               <ChatCircle size={48} weight="duotone" className="text-black/10 mb-4" />
               <p className="text-lg font-black text-black/20 mb-1">No ticket selected</p>
               <p className="text-sm text-black/15 leading-relaxed">Pick a ticket from the list to start chatting with the user.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}