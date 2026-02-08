"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    MessageSquarePlus,
    FileText,
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    TrendingUp,
    Sparkles,
} from "lucide-react";
import type { Ticket, Profile } from "@/types";

export default function StudentDashboard() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [stats, setStats] = useState({
        total: 0,
        open: 0,
        resolved: 0,
        pending: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Get profile
                const { data: profileData } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .single();

                if (profileData) setProfile(profileData as Profile);

                // Get tickets with stats
                const { data: ticketsData } = await supabase
                    .from("tickets")
                    .select(`
            *,
            department:departments(name),
            messages(id)
          `)
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false })
                    .limit(5);

                if (ticketsData) {
                    setTickets(ticketsData as unknown as Ticket[]);

                    // Calculate stats
                    const total = ticketsData.length;
                    const open = ticketsData.filter(t => t.status === "open" || t.status === "in_progress").length;
                    const resolved = ticketsData.filter(t => t.status === "resolved" || t.status === "closed").length;
                    const pending = ticketsData.filter(t => t.status === "pending").length;

                    setStats({ total, open, resolved, pending });
                }
            }

            setIsLoading(false);
        };

        fetchData();
    }, []);

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

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-MY", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-6 w-96" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <Skeleton className="h-96" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Welcome Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Welcome back, {profile?.full_name?.split(" ")[0] || "there"}! 👋
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Here&apos;s an overview of your support tickets
                    </p>
                </div>
                <Link href="/student/new-report">
                    <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-shadow">
                        <MessageSquarePlus className="h-5 w-5" />
                        New Report
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="card-hover border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Tickets</p>
                                <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="card-hover border-l-4 border-l-yellow-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Open</p>
                                <p className="text-3xl font-bold text-foreground">{stats.open}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="card-hover border-l-4 border-l-green-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                                <p className="text-3xl font-bold text-foreground">{stats.resolved}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="card-hover border-l-4 border-l-orange-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                                <p className="text-3xl font-bold text-foreground">{stats.pending}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="relative overflow-hidden card-hover group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#003DA5]/10 to-[#2563EB]/10 group-hover:from-[#003DA5]/20 group-hover:to-[#2563EB]/20 transition-all" />
                    <CardHeader className="relative">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-xl bg-[#003DA5] flex items-center justify-center">
                                <Sparkles className="h-6 w-6 text-white" />
                            </div>
                        </div>
                        <CardTitle>AI-Powered Support</CardTitle>
                        <CardDescription>
                            Chat with our AI assistant to quickly report issues. No long forms, just a conversation.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="relative">
                        <Link href="/student/new-report">
                            <Button className="gap-2">
                                Start Chat <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden card-hover group">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 group-hover:from-green-500/20 group-hover:to-emerald-500/20 transition-all" />
                    <CardHeader className="relative">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-white" />
                            </div>
                        </div>
                        <CardTitle>Track Progress</CardTitle>
                        <CardDescription>
                            Monitor the status of all your tickets in real-time with live updates.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="relative">
                        <Link href="/student/my-reports">
                            <Button variant="outline" className="gap-2">
                                View All Reports <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Tickets */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Recent Tickets</CardTitle>
                            <CardDescription>Your latest support requests</CardDescription>
                        </div>
                        <Link href="/student/my-reports">
                            <Button variant="ghost" size="sm">
                                View All
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {tickets.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="font-medium text-foreground mb-2">No tickets yet</h3>
                            <p className="text-muted-foreground text-sm mb-4">
                                Create your first support ticket to get started
                            </p>
                            <Link href="/student/new-report">
                                <Button>Create Ticket</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {tickets.map((ticket: any) => (
                                <Link key={ticket.id} href={`/student/ticket/${ticket.id}`}>
                                    <div className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-mono text-xs text-muted-foreground">
                                                    {ticket.ticket_number}
                                                </span>
                                                <Badge className={getStatusColor(ticket.status)}>
                                                    {ticket.status.replace("_", " ")}
                                                </Badge>
                                            </div>
                                            <h4 className="font-medium text-foreground truncate">
                                                {ticket.title}
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                {ticket.department?.name} • {formatDate(ticket.created_at)}
                                            </p>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
