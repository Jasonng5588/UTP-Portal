"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
    ArrowLeft,
    Send,
    Paperclip,
    Clock,
    User,
    Bot,
    Building2,
    Tag,
    AlertTriangle,
    CheckCircle2,
    MessageSquare,
    Star,
    Loader2,
} from "lucide-react";
import type { Ticket, Message, Profile } from "@/types";

export default function TicketDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [ticket, setTicket] = useState<any>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [showRating, setShowRating] = useState(false);
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            // Get profile
            const { data: profileData } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (profileData) setProfile(profileData as Profile);

            // Get ticket with relations
            const { data: ticketData } = await supabase
                .from("tickets")
                .select(`
          *,
          department:departments(id, name),
          subcategory:subcategories(id, name),
          assigned_agent:profiles!tickets_assigned_to_fkey(id, full_name, avatar_url)
        `)
                .eq("id", params.id)
                .single();

            if (ticketData) {
                setTicket(ticketData);

                // Check if resolved and no rating yet
                if (ticketData.status === "resolved") {
                    const { data: ratingData } = await supabase
                        .from("ratings")
                        .select("*")
                        .eq("ticket_id", params.id)
                        .single();

                    if (!ratingData) setShowRating(true);
                }
            }

            // Get messages
            const { data: messagesData } = await supabase
                .from("messages")
                .select(`
          *,
          sender:profiles(id, full_name, avatar_url, role)
        `)
                .eq("ticket_id", params.id)
                .eq("is_internal", false)
                .order("created_at", { ascending: true });

            if (messagesData) setMessages(messagesData as unknown as Message[]);

            setIsLoading(false);
        };

        fetchData();

        // Subscribe to realtime messages
        const supabase = createClient();
        const channel = supabase
            .channel(`ticket-${params.id}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `ticket_id=eq.${params.id}`,
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
    }, [params.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !profile) return;

        setIsSending(true);
        const supabase = createClient();

        const { error } = await supabase.from("messages").insert({
            ticket_id: params.id,
            sender_id: profile.id,
            message_type: "user",
            content: newMessage.trim(),
            is_internal: false,
        });

        if (error) {
            toast.error("Failed to send message");
        } else {
            setNewMessage("");
        }

        setIsSending(false);
    };

    const handleRating = async () => {
        if (rating === 0) {
            toast.error("Please select a rating");
            return;
        }

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase.from("ratings").insert({
            ticket_id: params.id,
            user_id: user?.id,
            rating,
            feedback: feedback.trim() || null,
        });

        if (error) {
            toast.error("Failed to submit rating");
        } else {
            toast.success("Thank you for your feedback!");
            setShowRating(false);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            open: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
            in_progress: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
            pending: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
            resolved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
            closed: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
            escalated: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        };
        return colors[status] || colors.open;
    };

    const formatTime = (date: string) => {
        return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-MY", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const isSLABreached = () => {
        if (!ticket?.sla_due_at) return false;
        return new Date(ticket.sla_due_at) < new Date() &&
            !["resolved", "closed"].includes(ticket.status);
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-48" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Skeleton className="h-96" />
                    </div>
                    <Skeleton className="h-64" />
                </div>
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="text-center py-16">
                <h2 className="text-xl font-semibold">Ticket not found</h2>
                <Link href="/student/my-reports">
                    <Button variant="link">Go back to My Reports</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm text-muted-foreground">
                            {ticket.ticket_number}
                        </span>
                        <Badge className={getStatusColor(ticket.status)}>
                            {ticket.status.replace("_", " ")}
                        </Badge>
                        {isSLABreached() && (
                            <Badge variant="destructive" className="gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                SLA Breached
                            </Badge>
                        )}
                    </div>
                    <h1 className="text-xl font-bold text-foreground mt-1">
                        {ticket.title}
                    </h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chat Section */}
                <div className="lg:col-span-2">
                    <Card className="flex flex-col h-[600px]">
                        <CardHeader className="border-b">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <MessageSquare className="h-5 w-5" />
                                Conversation
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No messages yet. Start the conversation!</p>
                                </div>
                            ) : (
                                messages.map((msg: any, idx) => {
                                    const isUser = msg.sender?.role === "user";
                                    const isAgent = msg.message_type === "agent";
                                    const isAI = msg.message_type === "ai";

                                    return (
                                        <div key={msg.id}>
                                            {/* Date separator */}
                                            {idx === 0 || formatDate(messages[idx - 1].created_at) !== formatDate(msg.created_at) ? (
                                                <div className="flex items-center gap-2 my-4">
                                                    <Separator className="flex-1" />
                                                    <span className="text-xs text-muted-foreground px-2">
                                                        {formatDate(msg.created_at)}
                                                    </span>
                                                    <Separator className="flex-1" />
                                                </div>
                                            ) : null}

                                            <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={msg.sender?.avatar_url} />
                                                    <AvatarFallback className={`${isAI ? "bg-gradient-to-br from-blue-500 to-indigo-600" :
                                                            isAgent ? "bg-green-500" : "bg-primary"
                                                        } text-white text-xs`}>
                                                        {isAI ? <Bot className="h-4 w-4" /> :
                                                            isAgent ? msg.sender?.full_name?.[0] || "A" :
                                                                msg.sender?.full_name?.[0] || "U"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className={`max-w-[75%] ${isUser ? "chat-bubble-user" :
                                                        isAI ? "chat-bubble-ai" : "chat-bubble-agent"
                                                    } px-4 py-3`}>
                                                    {!isUser && (
                                                        <p className="text-xs font-medium mb-1 opacity-70">
                                                            {isAI ? "AI Assistant" : msg.sender?.full_name || "Support Agent"}
                                                        </p>
                                                    )}
                                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                                    <p className="text-xs mt-1 opacity-60">{formatTime(msg.created_at)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </CardContent>

                        {/* Message Input */}
                        {["open", "in_progress", "pending"].includes(ticket.status) && (
                            <div className="border-t p-4">
                                <form
                                    onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                                    className="flex items-center gap-2"
                                >
                                    <Button type="button" variant="ghost" size="icon">
                                        <Paperclip className="h-5 w-5" />
                                    </Button>
                                    <Input
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        disabled={isSending}
                                        className="flex-1"
                                    />
                                    <Button type="submit" size="icon" disabled={!newMessage.trim() || isSending}>
                                        {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                    </Button>
                                </form>
                            </div>
                        )}
                    </Card>

                    {/* Rating Card */}
                    {showRating && (
                        <Card className="mt-6 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                                    <CheckCircle2 className="h-5 w-5" />
                                    Your ticket has been resolved!
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    How would you rate your support experience?
                                </p>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setRating(star)}
                                            className="focus:outline-none"
                                        >
                                            <Star
                                                className={`h-8 w-8 transition-colors ${star <= rating
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "text-gray-300 dark:text-gray-600"
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <Textarea
                                    placeholder="Any additional feedback? (optional)"
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    className="resize-none"
                                    rows={3}
                                />
                                <Button onClick={handleRating} className="w-full">
                                    Submit Feedback
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Ticket Details Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Ticket Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Building2 className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Department</p>
                                    <p className="text-sm text-muted-foreground">{ticket.department?.name}</p>
                                </div>
                            </div>

                            {ticket.subcategory && (
                                <div className="flex items-start gap-3">
                                    <Tag className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Category</p>
                                        <p className="text-sm text-muted-foreground">{ticket.subcategory.name}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Priority</p>
                                    <Badge variant="outline" className="mt-1 capitalize">
                                        {ticket.priority}
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Created</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatDate(ticket.created_at)}
                                    </p>
                                </div>
                            </div>

                            {ticket.assigned_agent && (
                                <div className="flex items-start gap-3">
                                    <User className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Assigned Agent</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={ticket.assigned_agent.avatar_url} />
                                                <AvatarFallback className="text-xs">
                                                    {ticket.assigned_agent.full_name?.[0] || "A"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm text-muted-foreground">
                                                {ticket.assigned_agent.full_name}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {ticket.sla_due_at && (
                                <div className="flex items-start gap-3">
                                    <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">SLA Due</p>
                                        <p className={`text-sm ${isSLABreached() ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                                            {formatDate(ticket.sla_due_at)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {ticket.description}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
