"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Search,
    Filter,
    Clock,
    ArrowRight,
    MessageSquare,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Inbox,
    FileText,
} from "lucide-react";
import type { Ticket, Department } from "@/types";

export default function MyReportsPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [departmentFilter, setDepartmentFilter] = useState<string>("all");

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Get departments
                const { data: deptData } = await supabase
                    .from("departments")
                    .select("*")
                    .eq("is_active", true)
                    .order("name");

                if (deptData) setDepartments(deptData as Department[]);

                // Get tickets
                const { data: ticketsData } = await supabase
                    .from("tickets")
                    .select(`
            *,
            department:departments(id, name),
            subcategory:subcategories(id, name),
            messages(id)
          `)
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false });

                if (ticketsData) setTickets(ticketsData as unknown as Ticket[]);
            }

            setIsLoading(false);
        };

        fetchData();
    }, []);

    const filteredTickets = tickets.filter((ticket: any) => {
        const matchesSearch =
            ticket.title.toLowerCase().includes(search.toLowerCase()) ||
            ticket.ticket_number.toLowerCase().includes(search.toLowerCase()) ||
            ticket.description.toLowerCase().includes(search.toLowerCase());

        const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
        const matchesDepartment = departmentFilter === "all" || ticket.department?.id === departmentFilter;

        return matchesSearch && matchesStatus && matchesDepartment;
    });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "open":
                return <Inbox className="h-4 w-4" />;
            case "in_progress":
                return <Clock className="h-4 w-4" />;
            case "pending":
                return <AlertTriangle className="h-4 w-4" />;
            case "resolved":
                return <CheckCircle2 className="h-4 w-4" />;
            case "closed":
                return <XCircle className="h-4 w-4" />;
            case "escalated":
                return <AlertTriangle className="h-4 w-4" />;
            default:
                return <Inbox className="h-4 w-4" />;
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

    const getPriorityColor = (priority: string) => {
        const colors: Record<string, string> = {
            low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
            medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
            high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
            urgent: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        };
        return colors[priority] || colors.medium;
    };

    const formatDate = (date: string) => {
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
            year: "numeric",
        });
    };

    const isSLABreached = (ticket: any) => {
        if (!ticket.sla_due_at) return false;
        return new Date(ticket.sla_due_at) < new Date() &&
            !["resolved", "closed"].includes(ticket.status);
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-36" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">My Reports</h1>
                    <p className="text-muted-foreground">
                        Track and manage all your support tickets
                    </p>
                </div>
                <Link href="/student/new-report">
                    <Button className="gap-2">
                        <FileText className="h-4 w-4" />
                        New Report
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search tickets..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[140px]">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Departments</SelectItem>
                                    {departments.map((dept) => (
                                        <SelectItem key={dept.id} value={dept.id}>
                                            {dept.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tickets List */}
            {filteredTickets.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <Inbox className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium text-foreground mb-2">
                            {tickets.length === 0 ? "No tickets yet" : "No matching tickets"}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4">
                            {tickets.length === 0
                                ? "Create your first support ticket to get started"
                                : "Try adjusting your filters"
                            }
                        </p>
                        {tickets.length === 0 && (
                            <Link href="/student/new-report">
                                <Button>Create Ticket</Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {filteredTickets.map((ticket: any) => (
                        <Link key={ticket.id} href={`/student/ticket/${ticket.id}`}>
                            <Card className="card-hover cursor-pointer overflow-hidden">
                                {isSLABreached(ticket) && (
                                    <div className="bg-red-500 text-white text-xs py-1 px-3 font-medium flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" />
                                        SLA Breached
                                    </div>
                                )}
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            {/* Header */}
                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                                    {ticket.ticket_number}
                                                </span>
                                                <Badge className={`${getStatusColor(ticket.status)} gap-1`}>
                                                    {getStatusIcon(ticket.status)}
                                                    {ticket.status.replace("_", " ")}
                                                </Badge>
                                                <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                                                    {ticket.priority}
                                                </Badge>
                                            </div>

                                            {/* Title */}
                                            <h3 className="font-semibold text-foreground text-lg mb-1 truncate">
                                                {ticket.title}
                                            </h3>

                                            {/* Description Preview */}
                                            <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                                                {ticket.description}
                                            </p>

                                            {/* Meta */}
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    🏢 {ticket.department?.name}
                                                </span>
                                                {ticket.subcategory?.name && (
                                                    <span className="flex items-center gap-1">
                                                        📁 {ticket.subcategory.name}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDate(ticket.created_at)}
                                                </span>
                                                {(ticket.messages?.length || 0) > 0 && (
                                                    <span className="flex items-center gap-1">
                                                        <MessageSquare className="h-3 w-3" />
                                                        {ticket.messages.length} messages
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
