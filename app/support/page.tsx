"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, 
  Search, 
  Send,
  User,
  Clock,
  RefreshCcw,
  CheckCircle2,
  Calendar,
  AlertCircle
} from "lucide-react";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminText } from "@/components/AdminText";
import { AdminButton } from "@/components/AdminButton";
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
      toast.error("Failed to fetch support tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Listen for new tickets in real-time
  useEffect(() => {
    const socket = getSocket();
    socket.on('newTicket', (ticket: Ticket) => {
      setTickets((prev) => [ticket, ...prev]);
    });

    return () => {
      socket.off('newTicket');
    };
  }, []);

  useEffect(() => {
    if (!selectedTicket) return;

    const fetchDetails = async () => {
      try {
        const data = await getTicketDetails(selectedTicket.id);
        setMessages(data.messages || []);
      } catch (err) {
        toast.error("Failed to load message history");
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

    return () => {
      socket.emit('leaveTicket', selectedTicket.id);
      socket.off('newSupportMessage');
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
      toast.success("Ticket claimed. You are now the assigned support agent.");
    } catch (err) {
      toast.error("Failed to claim ticket");
    }
  };

  const handleSendMessage = async () => {
    if (!selectedTicket || !messageInput.trim()) return;
    try {
      setSending(true);
      const msg = await sendSupportMessage(selectedTicket.id, messageInput);
      setMessageInput("");
      // Socket will handle adding it to the list
    } catch (err) {
      toast.error("Failed to send message");
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
      toast.success("Ticket marked as resolved");
    } catch (err) {
      toast.error("Failed to resolve ticket");
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6">
      <AdminHeader 
        title="Support & Communications" 
        description="Claim tickets and engage in real-time communication with users."
        action={
          <AdminButton variant="outline" size="sm" className="gap-2" onClick={fetchTickets}>
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </AdminButton>
        }
      />

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Tickets List */}
        <div className="w-1/3 flex flex-col gap-4">
          <AdminInput 
            placeholder="Search tickets..." 
            icon={<Search size={18} />}
          />
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-surface rounded-2xl animate-pulse" />
              ))
            ) : tickets.length === 0 ? (
              <div className="p-8 text-center opacity-40">
                <AdminText>No support tickets found.</AdminText>
              </div>
            ) : (
              tickets.map((ticket) => (
                <div 
                  key={ticket.id} 
                  onClick={() => setSelectedTicket(ticket)}
                  className={`bg-background border p-4 rounded-2xl hover:border-primary/50 transition-all cursor-pointer group shadow-sm ${
                    selectedTicket?.id === ticket.id ? "border-primary ring-1 ring-primary/20" : "border-border/50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <AdminText variant="bold" size="xs" className="text-secondary opacity-60 font-mono">#{ticket.id.slice(0, 8)}</AdminText>
                    <AdminBadge 
                      variant={
                        ticket.status === 'OPEN' ? 'error' : 
                        ticket.status === 'IN_PROGRESS' ? 'warning' : 'success'
                      }
                    >
                      {ticket.status}
                    </AdminBadge>
                  </div>
                  <AdminText variant="bold" size="sm" className="group-hover:text-primary transition-colors line-clamp-2">
                    {ticket.subject}
                  </AdminText>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-surface flex items-center justify-center text-[10px] font-bold">
                        {ticket.user.firstName[0]}{ticket.user.lastName[0]}
                      </div>
                      <AdminText size="xs" color="secondary">{ticket.user.firstName} {ticket.user.lastName}</AdminText>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={12} className="text-muted" />
                      <AdminText size="xs" color="secondary">{formatDistanceToNow(new Date(ticket.createdAt))} ago</AdminText>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white border border-border/50 rounded-[32px] flex flex-col overflow-hidden shadow-xl">
          {selectedTicket ? (
            <>
              {/* Chat Header */}
              <div className="p-6 border-b border-border/40 bg-white flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold shadow-inner">
                    {selectedTicket.user.firstName[0]}{selectedTicket.user.lastName[0]}
                  </div>
                  <div>
                    <AdminText variant="bold" size="md">{selectedTicket.user.firstName} {selectedTicket.user.lastName}</AdminText>
                    <div className="flex items-center gap-2">
                      <AdminText size="xs" color="secondary">{selectedTicket.user.email}</AdminText>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <AdminText size="xs" color="secondary">Ticket: {selectedTicket.subject}</AdminText>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedTicket.status === 'OPEN' ? (
                    <AdminButton variant="primary" size="sm" className="h-9 px-4 gap-2 shadow-lg shadow-primary/20" onClick={handleClaim}>
                      <MessageSquare size={16} />
                      Claim Ticket
                    </AdminButton>
                  ) : selectedTicket.status === 'IN_PROGRESS' ? (
                    <AdminButton variant="success" size="sm" className="h-9 px-4 gap-2" onClick={handleResolve}>
                      <CheckCircle2 size={16} />
                      Mark Resolved
                    </AdminButton>
                  ) : (
                    <AdminBadge variant="success">RESOLVED</AdminBadge>
                  )}
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-6 overflow-y-auto bg-surface/20 space-y-6 custom-scrollbar">
                {messages.map((msg, idx) => {
                  const isMine = msg.isFromSupport;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2`}>
                      <div className={`max-w-[80%] ${isMine ? "order-1" : "order-2"}`}>
                        <div className={`p-4 rounded-3xl shadow-sm ${
                          isMine 
                            ? "bg-primary text-white rounded-tr-none" 
                            : "bg-white border border-border/50 text-foreground rounded-tl-none"
                        }`}>
                          <AdminText size="sm" className={`leading-relaxed ${isMine ? "!text-white" : ""}`}>{msg.text}</AdminText>
                        </div>
                        <AdminText size="xs" color="secondary" className={`mt-1.5 opacity-60 ${isMine ? "text-right" : "text-left"}`}>
                          {format(new Date(msg.createdAt), "h:mm a")}
                        </AdminText>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Footer */}
              <div className="p-6 border-t border-border/40 bg-white">
                <div className="relative group">
                  <AdminInput 
                    placeholder={selectedTicket.status === 'RESOLVED' ? "This ticket is resolved." : selectedTicket.assignedAdminId ? "Type your response to the user..." : "Claim the ticket to respond."} 
                    className="pr-24 h-14 bg-surface/50 border-none focus:ring-2 ring-primary/20 rounded-2xl transition-all"
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
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <AdminButton 
                      size="sm" 
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || sending || selectedTicket.status === 'RESOLVED' || !selectedTicket.assignedAdminId}
                      className={`gap-2 h-10 px-6 rounded-xl shadow-lg transition-all ${
                        messageInput.trim() && selectedTicket.assignedAdminId ? "translate-x-0 opacity-100" : "translate-x-2 opacity-50"
                      }`}
                    >
                      {sending ? <RefreshCcw size={16} className="animate-spin" /> : <Send size={16} />}
                      Send
                    </AdminButton>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-40 text-center max-w-sm mx-auto">
               <div className="w-24 h-24 bg-surface rounded-[40px] flex items-center justify-center mb-6 shadow-inner ring-1 ring-border/20">
                  <MessageSquare size={48} className="text-secondary" />
               </div>
               <AdminText variant="bold" size="xl" className="mb-2">Queen's Support Gateway</AdminText>
               <AdminText size="sm" className="leading-relaxed">Please select an active ticket from the registry to engage with the user. All communications are monitored for platform integrity.</AdminText>
               
               <div className="mt-10 grid grid-cols-2 gap-3 w-full opacity-60">
                  <div className="p-4 bg-surface rounded-2xl border border-border/50 flex flex-col items-center gap-2">
                    <AlertCircle size={20} />
                    <AdminText size="xs" variant="bold">Critical Priority</AdminText>
                  </div>
                  <div className="p-4 bg-surface rounded-2xl border border-border/50 flex flex-col items-center gap-2">
                    <Calendar size={20} />
                    <AdminText size="xs" variant="bold">Resolution Time</AdminText>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}