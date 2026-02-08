"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
    Bell,
    CheckCheck,
    Ticket,
    MessageSquare,
    AlertTriangle,
    CheckCircle2,
    FileText,
    Inbox,
} from "lucide-react";
import type { Notification } from "@/types";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data } = await supabase
                    .from("notifications")
                    .select("*")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false });

                if (data) setNotifications(data as Notification[]);
            }

            setIsLoading(false);
        };

        fetchNotifications();
    }, []);

    const markAsRead = async (id: string) => {
        const supabase = createClient();
        await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("id", id);

        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        );
    };

    const markAllAsRead = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            await supabase
                .from("notifications")
                .update({ is_read: true })
                .eq("user_id", user.id)
                .eq("is_read", false);

            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            toast.success("All notifications marked as read");
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "ticket_created":
                return <Ticket className="h-5 w-5 text-blue-500" />;
            case "ticket_updated":
                return <FileText className="h-5 w-5 text-yellow-500" />;
            case "ticket_resolved":
                return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            case "new_message":
                return <MessageSquare className="h-5 w-5 text-purple-500" />;
            case "sla_warning":
                return <AlertTriangle className="h-5 w-5 text-orange-500" />;
            default:
                return <Bell className="h-5 w-5 text-gray-500" />;
        }
    };

    const formatTime = (date: string) => {
        const d = new Date(date);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return d.toLocaleDateString("en-MY", {
            day: "numeric",
            month: "short",
        });
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-48" />
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-20" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
                    <p className="text-muted-foreground">
                        {unreadCount > 0
                            ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                            : "You're all caught up!"
                        }
                    </p>
                </div>
                {unreadCount > 0 && (
                    <Button variant="outline" onClick={markAllAsRead} className="gap-2">
                        <CheckCheck className="h-4 w-4" />
                        Mark all as read
                    </Button>
                )}
            </div>

            {/* Notifications List */}
            {notifications.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <Inbox className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium text-foreground mb-2">No notifications yet</h3>
                        <p className="text-muted-foreground text-sm">
                            You&apos;ll see notifications here when there are updates on your tickets
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {notifications.map((notification) => (
                        <Card
                            key={notification.id}
                            className={`transition-colors cursor-pointer ${!notification.is_read
                                    ? "bg-primary/5 border-primary/20"
                                    : "hover:bg-accent/50"
                                }`}
                            onClick={() => {
                                if (!notification.is_read) markAsRead(notification.id);
                                if (notification.link) window.location.href = notification.link;
                            }}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    <div className="shrink-0 mt-0.5">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${!notification.is_read ? "bg-primary/10" : "bg-muted"
                                            }`}>
                                            {getIcon(notification.type)}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className={`font-medium ${!notification.is_read ? "text-foreground" : "text-muted-foreground"}`}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                                                    {notification.content}
                                                </p>
                                            </div>
                                            <span className="text-xs text-muted-foreground shrink-0">
                                                {formatTime(notification.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                    {!notification.is_read && (
                                        <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-2" />
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
