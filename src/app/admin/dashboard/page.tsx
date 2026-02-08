"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Ticket,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Users,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    BarChart3,
} from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
} from "recharts";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalTickets: 0,
        openTickets: 0,
        resolvedToday: 0,
        avgResponseTime: 0,
        slaBreaches: 0,
        pendingTickets: 0,
    });
    const [recentTickets, setRecentTickets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();

            // Get ticket stats
            const { data: allTickets } = await supabase
                .from("tickets")
                .select("*");

            if (allTickets) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const totalTickets = allTickets.length;
                const openTickets = allTickets.filter(t => t.status === "open" || t.status === "in_progress").length;
                const pendingTickets = allTickets.filter(t => t.status === "pending").length;
                const resolvedToday = allTickets.filter(t =>
                    t.resolved_at && new Date(t.resolved_at) >= today
                ).length;
                const slaBreaches = allTickets.filter(t =>
                    t.sla_due_at && new Date(t.sla_due_at) < new Date() &&
                    !["resolved", "closed"].includes(t.status)
                ).length;

                setStats({
                    totalTickets,
                    openTickets,
                    resolvedToday,
                    avgResponseTime: 2.5, // Mock for now
                    slaBreaches,
                    pendingTickets,
                });
            }

            // Get recent tickets
            const { data: tickets } = await supabase
                .from("tickets")
                .select(`
          *,
          department:departments(name),
          user:profiles!tickets_user_id_fkey(full_name)
        `)
                .order("created_at", { ascending: false })
                .limit(5);

            if (tickets) setRecentTickets(tickets);

            setIsLoading(false);
        };

        fetchData();
    }, []);

    // Mock chart data
    const ticketTrendData = [
        { name: "Mon", tickets: 12, resolved: 10 },
        { name: "Tue", tickets: 19, resolved: 15 },
        { name: "Wed", tickets: 15, resolved: 18 },
        { name: "Thu", tickets: 22, resolved: 20 },
        { name: "Fri", tickets: 18, resolved: 16 },
        { name: "Sat", tickets: 8, resolved: 12 },
        { name: "Sun", tickets: 5, resolved: 7 },
    ];

    const departmentData = [
        { name: "IT Services", value: 35, color: "#003DA5" },
        { name: "Academic", value: 25, color: "#2563EB" },
        { name: "Finance", value: 20, color: "#10B981" },
        { name: "Student Affairs", value: 15, color: "#F59E0B" },
        { name: "Others", value: 5, color: "#6B7280" },
    ];

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
        const d = new Date(date);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return d.toLocaleDateString("en-MY", { day: "numeric", month: "short" });
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-64" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-80" />
                    <Skeleton className="h-80" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back! Here&apos;s an overview of your support system.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="card-hover">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Tickets</p>
                                <p className="text-3xl font-bold text-foreground">{stats.totalTickets}</p>
                                <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
                                    <TrendingUp className="h-3 w-3" />
                                    +12% from last week
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Ticket className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="card-hover">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Open Tickets</p>
                                <p className="text-3xl font-bold text-foreground">{stats.openTickets}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stats.pendingTickets} pending response
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="card-hover">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Resolved Today</p>
                                <p className="text-3xl font-bold text-foreground">{stats.resolvedToday}</p>
                                <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
                                    <ArrowUpRight className="h-3 w-3" />
                                    Great progress!
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="card-hover">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">SLA Breaches</p>
                                <p className="text-3xl font-bold text-foreground">{stats.slaBreaches}</p>
                                <p className={`text-xs flex items-center gap-1 mt-1 ${stats.slaBreaches > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                                    }`}>
                                    {stats.slaBreaches > 0 ? (
                                        <>
                                            <ArrowDownRight className="h-3 w-3" />
                                            Needs attention
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="h-3 w-3" />
                                            All on track
                                        </>
                                    )}
                                </p>
                            </div>
                            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${stats.slaBreaches > 0
                                    ? "bg-red-100 dark:bg-red-900/30"
                                    : "bg-green-100 dark:bg-green-900/30"
                                }`}>
                                <AlertTriangle className={`h-6 w-6 ${stats.slaBreaches > 0
                                        ? "text-red-600 dark:text-red-400"
                                        : "text-green-600 dark:text-green-400"
                                    }`} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ticket Trend Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Weekly Ticket Trend
                        </CardTitle>
                        <CardDescription>New tickets vs resolved this week</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={ticketTrendData}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="name" className="text-xs" />
                                <YAxis className="text-xs" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px',
                                    }}
                                />
                                <Bar dataKey="tickets" fill="#003DA5" name="New Tickets" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="resolved" fill="#10B981" name="Resolved" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Department Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Tickets by Department
                        </CardTitle>
                        <CardDescription>Distribution across departments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-8">
                            <ResponsiveContainer width="50%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={departmentData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {departmentData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2">
                                {departmentData.map((dept, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: dept.color }}
                                        />
                                        <span className="text-sm">{dept.name}</span>
                                        <span className="text-sm text-muted-foreground ml-auto">{dept.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Tickets */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Tickets</CardTitle>
                    <CardDescription>Latest support requests</CardDescription>
                </CardHeader>
                <CardContent>
                    {recentTickets.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No tickets yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentTickets.map((ticket: any) => (
                                <div
                                    key={ticket.id}
                                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-mono text-xs text-muted-foreground">
                                                {ticket.ticket_number}
                                            </span>
                                            <Badge className={getStatusColor(ticket.status)}>
                                                {ticket.status.replace("_", " ")}
                                            </Badge>
                                        </div>
                                        <p className="font-medium truncate">{ticket.title}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {ticket.user?.full_name} • {ticket.department?.name}
                                        </p>
                                    </div>
                                    <span className="text-sm text-muted-foreground shrink-0 ml-4">
                                        {formatTime(ticket.created_at)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
