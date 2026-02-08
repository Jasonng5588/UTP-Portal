"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
    History,
    Lock,
    Loader2,
} from "lucide-react";
import type { Profile, Department } from "@/types";

export default function AdminTicketDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [ticket, setTicket] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [agents, setAgents] = useState<Profile[]>([]);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [isInternal, setIsInternal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchData();
    }, [params.id]);

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

        // Get agents
        const { data: agentData } = await supabase
            .from("profiles")
            .select("*")
            .in("role", ["support_agent", "department_admin", "super_admin"]);

        if (agentData) setAgents(agentData as Profile[]);

        // Get ticket with relations
        const { data: ticketData } = await supabase
            .from("tickets")
            .select(`
        *,
        department:departments(id, name),
        subcategory:subcategories(id, name),
        user:profiles!tickets_user_id_fkey(id, full_name, email, avatar_url, student_id, phone),
        assigned_agent:profiles!tickets_assigned_to_fkey(id, full_name, avatar_url)
      `)
            .eq("id", params.id)
            .single();

        if (ticketData) setTicket(ticketData);

        // Get messages
        const { data: messagesData } = await supabase
            .from("messages")
            .select(`
        *,
        sender:profiles(id, full_name, avatar_url, role)
      `)
            .eq("ticket_id", params.id)
            .order("created_at", { ascending: true });

        if (messagesData) setMessages(messagesData);

        // Get logs
        const { data: logsData } = await supabase
            .from("ticket_logs")
            .select(`
        *,
        changed_by:profiles(full_name)
      `)
            .eq("ticket_id", params.id)
            .order("created_at", { ascending: false });

        if (logsData) setLogs(logsData);

        setIsLoading(false);

        // Subscribe to realtime messages
        const channel = supabase
            .channel(`admin-ticket-${params.id}`)
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

                    if (newMsg) {
                        setMessages(prev => [...prev, newMsg]);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !profile) return;

        setIsSending(true);
        const supabase = createClient();

        const { error } = await supabase.from("messages").insert({
            ticket_id: params.id,
            sender_id: profile.id,
            message_type: "agent",
            content: newMessage.trim(),
            is_internal: isInternal,
        });

        if (error) {
            toast.error("Failed to send message");
        } else {
            setNewMessage("");

            // Update ticket status if open
            if (ticket.status === "open") {
                await supabase
                    .from("tickets")
                    .update({ status: "in_progress", assigned_to: profile.id })
                    .eq("id", params.id);
                fetchData();
            }
        }

        setIsSending(false);
    };

    const handleStatusChange = async (status: string) => {
        const supabase = createClient();

        const updateData: Record<string, any> = { status };

        if (status === "resolved") {
            updateData.resolved_at = new Date().toISOString();
        } else if (status === "closed") {
            updateData.closed_at = new Date().toISOString();
        }

        const { error } = await supabase
            .from("tickets")
            .update(updateData)
            .eq("id", params.id);

        if (error) {
            toast.error("Failed to update status");
        } else {
            toast.success("Status updated");
            fetchData();
        }
    };

    const handleAssign = async (agentId: string) => {
        const supabase = createClient();

        const { error } = await supabase
            .from("tickets")
            .update({
                assigned_to: agentId === "unassigned" ? null : agentId,
                status: agentId === "unassigned" ? "open" : "in_progress",
            })
            .eq("id", params.id);

        if (error) {
            toast.error("Failed to assign ticket");
        } else {
            toast.success("Ticket assigned");
            fetchData();
        }
    };

    const handlePriorityChange = async (priority: string) => {
        const supabase = createClient();

        const { error } = await supabase
            .from("tickets")
            .update({ priority })
            .eq("id", params.id);

        if (error) {
            toast.error("Failed to update priority");
        } else {
            toast.success("Priority updated");
            fetchData();
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

    const getInitials = (name: string | null) => {
        if (!name) return "?";
        return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
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
                <Button variant="link" onClick={() => router.push("/admin/tickets")}>
                    Go back to Tickets
                </Button>
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
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => handleStatusChange("resolved")}
                        disabled={ticket.status === "resolved" || ticket.status === "closed"}
                        className="gap-1"
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        Resolve
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <Tabs defaultValue="conversation">
                        <TabsList>
                            <TabsTrigger value="conversation" className="gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Conversation
                            </TabsTrigger>
                            <TabsTrigger value="history" className="gap-2">
                                <History className="h-4 w-4" />
                                Activity Log
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="conversation">
                            <Card className="flex flex-col h-[500px]">
                                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {messages.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p>No messages yet</p>
                                        </div>
                                    ) : (
                                        messages.map((msg: any, idx) => {
                                            const isAgent = msg.sender?.role !== "user";
                                            const isInternal = msg.is_internal;

                                            return (
                                                <div key={msg.id}>
                                                    {idx === 0 || formatDate(messages[idx - 1].created_at) !== formatDate(msg.created_at) ? (
                                                        <div className="flex items-center gap-2 my-4">
                                                            <Separator className="flex-1" />
                                                            <span className="text-xs text-muted-foreground px-2">
                                                                {formatDate(msg.created_at)}
                                                            </span>
                                                            <Separator className="flex-1" />
                                                        </div>
                                                    ) : null}

                                                    {isInternal && (
                                                        <div className="flex items-center gap-1 mb-1 text-xs text-yellow-600 dark:text-yellow-400">
                                                            <Lock className="h-3 w-3" />
                                                            Internal Note
                                                        </div>
                                                    )}

                                                    <div className={`flex items-start gap-3 ${isAgent ? "flex-row-reverse" : ""}`}>
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={msg.sender?.avatar_url} />
                                                            <AvatarFallback className={`text-xs ${isAgent ? "bg-green-500" : "bg-primary"
                                                                } text-white`}>
                                                                {getInitials(msg.sender?.full_name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className={`max-w-[75%] ${isInternal
                                                                ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
                                                                : isAgent ? "chat-bubble-agent" : "chat-bubble-user"
                                                            } px-4 py-3 rounded-2xl`}>
                                                            <p className="text-xs font-medium mb-1 opacity-70">
                                                                {msg.sender?.full_name || "Unknown"}
                                                            </p>
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
                                <div className="border-t p-4 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant={isInternal ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setIsInternal(!isInternal)}
                                            className="gap-1"
                                        >
                                            <Lock className="h-3 w-3" />
                                            Internal Note
                                        </Button>
                                        <span className="text-xs text-muted-foreground">
                                            {isInternal ? "Only visible to staff" : "Visible to customer"}
                                        </span>
                                    </div>
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
                                            placeholder={isInternal ? "Add internal note..." : "Type your reply..."}
                                            disabled={isSending}
                                            className="flex-1"
                                        />
                                        <Button type="submit" disabled={!newMessage.trim() || isSending}>
                                            {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                        </Button>
                                    </form>
                                </div>
                            </Card>
                        </TabsContent>

                        <TabsContent value="history">
                            <Card>
                                <CardContent className="p-4">
                                    {logs.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p>No activity yet</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {logs.map((log: any) => (
                                                <div key={log.id} className="flex gap-3 text-sm">
                                                    <div className="w-2 h-2 rounded-full bg-muted-foreground mt-2" />
                                                    <div className="flex-1">
                                                        <p>
                                                            <span className="font-medium">{log.changed_by?.full_name || "System"}</span>
                                                            {" changed "}
                                                            <span className="font-medium">{log.field_name}</span>
                                                            {log.old_value && (
                                                                <>
                                                                    {" from "}
                                                                    <Badge variant="outline" className="text-xs">{log.old_value}</Badge>
                                                                </>
                                                            )}
                                                            {" to "}
                                                            <Badge variant="outline" className="text-xs">{log.new_value}</Badge>
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {formatDate(log.created_at)} at {formatTime(log.created_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Customer
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={ticket.user?.avatar_url} />
                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                        {getInitials(ticket.user?.full_name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{ticket.user?.full_name}</p>
                                    <p className="text-sm text-muted-foreground">{ticket.user?.email}</p>
                                </div>
                            </div>
                            {ticket.user?.student_id && (
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Student ID:</span>
                                    <span className="ml-2 font-mono">{ticket.user.student_id}</span>
                                </div>
                            )}
                            {ticket.user?.phone && (
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Phone:</span>
                                    <span className="ml-2">{ticket.user.phone}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Ticket Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Ticket Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <Select value={ticket.status} onValueChange={handleStatusChange}>
                                    <SelectTrigger className={getStatusColor(ticket.status)}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="open">Open</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="resolved">Resolved</SelectItem>
                                        <SelectItem value="closed">Closed</SelectItem>
                                        <SelectItem value="escalated">Escalated</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Priority</label>
                                <Select value={ticket.priority} onValueChange={handlePriorityChange}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Assigned To</label>
                                <Select
                                    value={ticket.assigned_to || "unassigned"}
                                    onValueChange={handleAssign}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Unassigned" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="unassigned">Unassigned</SelectItem>
                                        {agents.map((agent) => (
                                            <SelectItem key={agent.id} value={agent.id}>
                                                {agent.full_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Separator />

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
                                <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Created</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatDate(ticket.created_at)}
                                    </p>
                                </div>
                            </div>

                            {ticket.sla_due_at && (
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className={`h-5 w-5 shrink-0 mt-0.5 ${isSLABreached() ? "text-red-500" : "text-muted-foreground"
                                        }`} />
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

                    {/* Description */}
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
