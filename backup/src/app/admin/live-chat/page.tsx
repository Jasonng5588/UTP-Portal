"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
    MessageSquare,
    Send,
    User,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Loader2,
} from "lucide-react";
import type { Ticket, Message, Profile } from "@/types";

export default function LiveChatPage() {
    const [activeChats, setActiveChats] = useState<any[]>([]);
    const [selectedChat, setSelectedChat] = useState<any>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [profile, setProfile] = useState<Profile | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedChat) {
            fetchMessages(selectedChat.id);

            // Subscribe to realtime messages
            const supabase = createClient();
            const channel = supabase
                .channel(`live-chat-${selectedChat.id}`)
                .on(
                    "postgres_changes",
                    {
                        event: "INSERT",
                        schema: "public",
                        table: "messages",
                        filter: `ticket_id=eq.${selectedChat.id}`,
                    },
                    async (payload) => {
                        const { data: newMsg } = await supabase
                            .from("messages")
                            .select(`*, sender:profiles(id, full_name, avatar_url, role)`)
                            .eq("id", payload.new.id)
                            .single();

                        if (newMsg && !newMsg.is_internal) {
                            setMessages(prev => [...prev, newMsg as unknown as Message]);
                        }
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [selectedChat?.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fetchData = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { data: profileData } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (profileData) setProfile(profileData as Profile);
        }

        // Get active chats (open or in_progress tickets with messages)
        const { data: chats } = await supabase
            .from("tickets")
            .select(`
        *,
        user:profiles!tickets_user_id_fkey(id, full_name, avatar_url),
        department:departments(name),
        messages(count)
      `)
            .in("status", ["open", "in_progress", "pending"])
            .order("updated_at", { ascending: false });

        if (chats) setActiveChats(chats);

        setIsLoading(false);
    };

    const fetchMessages = async (ticketId: string) => {
        const supabase = createClient();

        const { data } = await supabase
            .from("messages")
            .select(`
        *,
        sender:profiles(id, full_name, avatar_url, role)
      `)
            .eq("ticket_id", ticketId)
            .eq("is_internal", false)
            .order("created_at", { ascending: true });

        if (data) setMessages(data as unknown as Message[]);
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedChat || !profile) return;

        setIsSending(true);
        const supabase = createClient();

        const { error } = await supabase.from("messages").insert({
            ticket_id: selectedChat.id,
            sender_id: profile.id,
            message_type: "agent",
            content: newMessage.trim(),
            is_internal: false,
        });

        if (error) {
            toast.error("Failed to send message");
        } else {
            setNewMessage("");

            // Update ticket status to in_progress if open
            if (selectedChat.status === "open") {
                await supabase
                    .from("tickets")
                    .update({ status: "in_progress", assigned_to: profile.id })
                    .eq("id", selectedChat.id);
            }
        }

        setIsSending(false);
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            open: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
            in_progress: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
            pending: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
        };
        return colors[status] || colors.open;
    };

    const formatTime = (date: string) => {
        return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const getInitials = (name: string | null) => {
        if (!name) return "?";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    if (isLoading) {
        return (
            <div className="flex gap-6 h-[calc(100vh-8rem)]">
                <Skeleton className="w-80 h-full" />
                <Skeleton className="flex-1 h-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Live Chat</h1>
                <p className="text-muted-foreground">
                    Respond to active support conversations
                </p>
            </div>

            <div className="flex gap-6 h-[calc(100vh-12rem)]">
                {/* Chat List */}
                <Card className="w-80 flex flex-col shrink-0">
                    <CardHeader className="py-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Active Chats
                            <Badge className="ml-auto">{activeChats.length}</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-hidden">
                        <ScrollArea className="h-full">
                            {activeChats.length === 0 ? (
                                <div className="p-4 text-center text-muted-foreground">
                                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No active chats</p>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {activeChats.map((chat: any) => (
                                        <button
                                            key={chat.id}
                                            onClick={() => setSelectedChat(chat)}
                                            className={`w-full p-4 text-left hover:bg-accent/50 transition-colors ${selectedChat?.id === chat.id ? "bg-accent" : ""
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={chat.user?.avatar_url} />
                                                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                                        {getInitials(chat.user?.full_name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="font-medium truncate text-sm">
                                                            {chat.user?.full_name}
                                                        </span>
                                                        <Badge className={`${getStatusColor(chat.status)} text-xs`}>
                                                            {chat.status.replace("_", " ")}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        {chat.title}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                        <span>{chat.department?.name}</span>
                                                        <span>•</span>
                                                        <span>{chat.messages?.[0]?.count || 0} msgs</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Chat Panel */}
                {selectedChat ? (
                    <Card className="flex-1 flex flex-col">
                        <CardHeader className="py-4 border-b">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={selectedChat.user?.avatar_url} />
                                        <AvatarFallback className="bg-primary text-primary-foreground">
                                            {getInitials(selectedChat.user?.full_name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-lg">{selectedChat.user?.full_name}</CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedChat.ticket_number} • {selectedChat.department?.name}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge className={getStatusColor(selectedChat.status)}>
                                        {selectedChat.status.replace("_", " ")}
                                    </Badge>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={async () => {
                                            const supabase = createClient();
                                            await supabase
                                                .from("tickets")
                                                .update({ status: "resolved", resolved_at: new Date().toISOString() })
                                                .eq("id", selectedChat.id);
                                            toast.success("Ticket resolved");
                                            fetchData();
                                            setSelectedChat(null);
                                        }}
                                        className="gap-1"
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        Resolve
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg: any) => {
                                const isAgent = msg.message_type === "agent";
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex items-start gap-3 ${isAgent ? "flex-row-reverse" : ""}`}
                                    >
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={msg.sender?.avatar_url} />
                                            <AvatarFallback className={`text-xs ${isAgent ? "bg-green-500" : "bg-primary"
                                                } text-white`}>
                                                {getInitials(msg.sender?.full_name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className={`max-w-[70%] ${isAgent ? "chat-bubble-agent" : "chat-bubble-user"
                                            } px-4 py-3`}>
                                            <p className="text-xs font-medium mb-1 opacity-70">
                                                {msg.sender?.full_name}
                                            </p>
                                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                            <p className="text-xs mt-1 opacity-60">{formatTime(msg.created_at)}</p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </CardContent>

                        <div className="border-t p-4">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                                className="flex items-center gap-2"
                            >
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your reply..."
                                    disabled={isSending}
                                    className="flex-1"
                                />
                                <Button type="submit" disabled={!newMessage.trim() || isSending}>
                                    {isSending ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Send className="h-5 w-5" />
                                    )}
                                </Button>
                            </form>
                        </div>
                    </Card>
                ) : (
                    <Card className="flex-1 flex items-center justify-center">
                        <div className="text-center p-8">
                            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="font-medium text-foreground mb-2">Select a conversation</h3>
                            <p className="text-muted-foreground text-sm">
                                Choose a chat from the list to start responding
                            </p>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
