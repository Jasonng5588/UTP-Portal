"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Clock,
    Users,
    Star,
    Ticket,
    CheckCircle2,
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
    AreaChart,
    Area,
} from "recharts";

export default function AnalyticsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState("7d");
    const [stats, setStats] = useState({
        totalTickets: 0,
        avgResolutionTime: 0,
        avgRating: 0,
        resolutionRate: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();

            const { data: tickets } = await supabase
                .from("tickets")
                .select("*, ratings(rating)");

            if (tickets) {
                const resolved = tickets.filter(t => t.status === "resolved" || t.status === "closed");
                const ratings = tickets.flatMap(t => t.ratings || []);

                setStats({
                    totalTickets: tickets.length,
                    avgResolutionTime: 4.2, // Mock - would calculate from resolved_at - created_at
                    avgRating: ratings.length > 0
                        ? ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length
                        : 0,
                    resolutionRate: tickets.length > 0
                        ? Math.round((resolved.length / tickets.length) * 100)
                        : 0,
                });
            }

            setIsLoading(false);
        };

        fetchData();
    }, [dateRange]);

    // Mock chart data
    const ticketVolumeData = [
        { date: "Mon", created: 12, resolved: 10 },
        { date: "Tue", created: 19, resolved: 15 },
        { date: "Wed", created: 15, resolved: 18 },
        { date: "Thu", created: 22, resolved: 20 },
        { date: "Fri", created: 18, resolved: 16 },
        { date: "Sat", created: 8, resolved: 12 },
        { date: "Sun", created: 5, resolved: 7 },
    ];

    const responseTimeData = [
        { hour: "00:00", time: 3.2 },
        { hour: "04:00", time: 4.1 },
        { hour: "08:00", time: 2.5 },
        { hour: "12:00", time: 1.8 },
        { hour: "16:00", time: 2.2 },
        { hour: "20:00", time: 3.5 },
    ];

    const departmentData = [
        { name: "IT Services", tickets: 45, color: "#003DA5" },
        { name: "Academic", tickets: 32, color: "#2563EB" },
        { name: "Finance", tickets: 28, color: "#10B981" },
        { name: "Student Affairs", tickets: 21, color: "#F59E0B" },
        { name: "Facilities", tickets: 14, color: "#8B5CF6" },
    ];

    const priorityData = [
        { name: "Low", value: 25, color: "#6B7280" },
        { name: "Medium", value: 45, color: "#3B82F6" },
        { name: "High", value: 20, color: "#F97316" },
        { name: "Urgent", value: 10, color: "#EF4444" },
    ];

    const agentPerformance = [
        { name: "Ahmad", resolved: 45, rating: 4.8 },
        { name: "Sarah", resolved: 38, rating: 4.9 },
        { name: "John", resolved: 32, rating: 4.5 },
        { name: "Lisa", resolved: 28, rating: 4.7 },
        { name: "Mike", resolved: 25, rating: 4.3 },
    ];

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-64" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <Skeleton className="h-80" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
                    <p className="text-muted-foreground">
                        Monitor support performance and trends
                    </p>
                </div>
                <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="90d">Last 90 days</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="card-hover">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Tickets</p>
                                <p className="text-3xl font-bold text-foreground">{stats.totalTickets}</p>
                                <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
                                    <TrendingUp className="h-3 w-3" />
                                    +15% vs last period
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
                                <p className="text-sm font-medium text-muted-foreground">Avg Resolution Time</p>
                                <p className="text-3xl font-bold text-foreground">{stats.avgResolutionTime}h</p>
                                <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
                                    <TrendingDown className="h-3 w-3" />
                                    -0.5h vs last period
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="card-hover">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Resolution Rate</p>
                                <p className="text-3xl font-bold text-foreground">{stats.resolutionRate}%</p>
                                <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
                                    <TrendingUp className="h-3 w-3" />
                                    +5% vs last period
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <CheckCircle2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="card-hover">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                                <p className="text-3xl font-bold text-foreground">
                                    {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "N/A"}
                                </p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    out of 5 stars
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                                <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Ticket Volume
                        </CardTitle>
                        <CardDescription>Created vs resolved tickets</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={ticketVolumeData}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="date" className="text-xs" />
                                <YAxis className="text-xs" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px',
                                    }}
                                />
                                <Area type="monotone" dataKey="created" stackId="1" stroke="#003DA5" fill="#003DA5" fillOpacity={0.6} />
                                <Area type="monotone" dataKey="resolved" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Response Time by Hour
                        </CardTitle>
                        <CardDescription>Average first response time</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={responseTimeData}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="hour" className="text-xs" />
                                <YAxis className="text-xs" unit="h" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px',
                                    }}
                                />
                                <Line type="monotone" dataKey="time" stroke="#003DA5" strokeWidth={2} dot={{ fill: '#003DA5' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Tickets by Department</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={departmentData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis type="number" className="text-xs" />
                                <YAxis dataKey="name" type="category" className="text-xs" width={80} />
                                <Tooltip />
                                <Bar dataKey="tickets" radius={[0, 4, 4, 0]}>
                                    {departmentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Priority Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <ResponsiveContainer width="50%" height={180}>
                                <PieChart>
                                    <Pie
                                        data={priorityData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={70}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {priorityData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2">
                                {priorityData.map((item, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <span className="text-sm">{item.name}</span>
                                        <span className="text-sm text-muted-foreground ml-auto">{item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Top Agents
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {agentPerformance.map((agent, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-muted-foreground w-4">
                                            {idx + 1}.
                                        </span>
                                        <span className="font-medium">{agent.name}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="text-muted-foreground">{agent.resolved} resolved</span>
                                        <span className="flex items-center gap-1">
                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                            {agent.rating}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
