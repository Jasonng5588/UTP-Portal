"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
    Search,
    Filter,
    MoreHorizontal,
    Eye,
    UserPlus,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    ArrowUpDown,
    RefreshCw,
    Download,
    Loader2,
} from "lucide-react";
import type { Ticket, Department, Profile } from "@/types";

export default function TicketsPage() {
    const router = useRouter();
    const [tickets, setTickets] = useState<any[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [agents, setAgents] = useState<Profile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [priorityFilter, setPriorityFilter] = useState<string>("all");
    const [departmentFilter, setDepartmentFilter] = useState<string>("all");
    const [sortBy, setSortBy] = useState<string>("created_at");
    const [sortOrder, setSortOrder] = useState<string>("desc");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const supabase = createClient();

        // Get departments
        const { data: deptData } = await supabase
            .from("departments")
            .select("*")
            .eq("is_active", true)
            .order("name");

        if (deptData) setDepartments(deptData as Department[]);

        // Get agents
        const { data: agentData } = await supabase
            .from("profiles")
            .select("*")
            .in("role", ["support_agent", "department_admin", "super_admin"]);

        if (agentData) setAgents(agentData as Profile[]);

        // Get tickets
        const { data: ticketsData } = await supabase
            .from("tickets")
            .select(`
        *,
        department:departments(id, name),
        subcategory:subcategories(id, name),
        user:profiles!tickets_user_id_fkey(id, full_name, email, avatar_url),
        assigned_agent:profiles!tickets_assigned_to_fkey(id, full_name, avatar_url)
      `)
            .order("created_at", { ascending: false });

        if (ticketsData) setTickets(ticketsData);

        setIsLoading(false);
    };

    const filteredTickets = tickets.filter((ticket) => {
        const matchesSearch =
            ticket.title.toLowerCase().includes(search.toLowerCase()) ||
            ticket.ticket_number.toLowerCase().includes(search.toLowerCase()) ||
            ticket.user?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            ticket.user?.email?.toLowerCase().includes(search.toLowerCase());

        const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
        const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
        const matchesDepartment = departmentFilter === "all" || ticket.department?.id === departmentFilter;

        return matchesSearch && matchesStatus && matchesPriority && matchesDepartment;
    });

    // Sort tickets
    const sortedTickets = [...filteredTickets].sort((a, b) => {
        let aVal = a[sortBy];
        let bVal = b[sortBy];

        if (sortBy === "created_at" || sortBy === "updated_at") {
            aVal = new Date(aVal).getTime();
            bVal = new Date(bVal).getTime();
        }

        if (sortOrder === "asc") {
            return aVal > bVal ? 1 : -1;
        }
        return aVal < bVal ? 1 : -1;
    });

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedTickets(sortedTickets.map(t => t.id));
        } else {
            setSelectedTickets([]);
        }
    };

    const handleSelectTicket = (ticketId: string, checked: boolean) => {
        if (checked) {
            setSelectedTickets([...selectedTickets, ticketId]);
        } else {
            setSelectedTickets(selectedTickets.filter(id => id !== ticketId));
        }
    };

    const handleBulkAction = async (action: string) => {
        if (selectedTickets.length === 0) {
            toast.error("No tickets selected");
            return;
        }

        const supabase = createClient();

        let updateData: Record<string, any> = {};

        switch (action) {
            case "close":
                updateData = { status: "closed", closed_at: new Date().toISOString() };
                break;
            case "escalate":
                updateData = { status: "escalated" };
                break;
            case "resolve":
                updateData = { status: "resolved", resolved_at: new Date().toISOString() };
                break;
        }

        const { error } = await supabase
            .from("tickets")
            .update(updateData)
            .in("id", selectedTickets);

        if (error) {
            toast.error("Failed to update tickets");
        } else {
            toast.success(`${selectedTickets.length} tickets updated`);
            setSelectedTickets([]);
            fetchData();
        }
    };

    const handleAssign = async (ticketId: string, agentId: string) => {
        const supabase = createClient();

        const { error } = await supabase
            .from("tickets")
            .update({ assigned_to: agentId, status: "in_progress" })
            .eq("id", ticketId);

        if (error) {
            toast.error("Failed to assign ticket");
        } else {
            toast.success("Ticket assigned");
            fetchData();
        }
    };

    const handleStatusChange = async (ticketId: string, status: string) => {
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
            .eq("id", ticketId);

        if (error) {
            toast.error("Failed to update status");
        } else {
            toast.success("Status updated");
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

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return d.toLocaleDateString("en-MY", {
            day: "numeric",
            month: "short",
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
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-16" />
                <Skeleton className="h-96" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Tickets Console</h1>
                    <p className="text-muted-foreground">
                        Manage and respond to support tickets
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchData} className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                    <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search tickets, users..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                    <SelectItem value="escalated">Escalated</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Priority</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
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

            {/* Bulk Actions */}
            {selectedTickets.length > 0 && (
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <span className="font-medium">
                                {selectedTickets.length} ticket{selectedTickets.length > 1 ? "s" : ""} selected
                            </span>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleBulkAction("resolve")} className="gap-1">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Resolve
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleBulkAction("close")} className="gap-1">
                                    <XCircle className="h-4 w-4" />
                                    Close
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleBulkAction("escalate")} className="gap-1">
                                    <AlertTriangle className="h-4 w-4" />
                                    Escalate
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setSelectedTickets([])}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Tickets Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <Checkbox
                                            checked={selectedTickets.length === sortedTickets.length && sortedTickets.length > 0}
                                            onCheckedChange={handleSelectAll}
                                        />
                                    </TableHead>
                                    <TableHead>Ticket</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Assigned To</TableHead>
                                    <TableHead>
                                        <button
                                            onClick={() => {
                                                if (sortBy === "created_at") {
                                                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                                                } else {
                                                    setSortBy("created_at");
                                                    setSortOrder("desc");
                                                }
                                            }}
                                            className="flex items-center gap-1 hover:text-foreground"
                                        >
                                            Created
                                            <ArrowUpDown className="h-3 w-3" />
                                        </button>
                                    </TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedTickets.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                            No tickets found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sortedTickets.map((ticket) => (
                                        <TableRow
                                            key={ticket.id}
                                            className={`cursor-pointer hover:bg-accent/50 ${isSLABreached(ticket) ? "bg-red-50 dark:bg-red-900/10" : ""
                                                }`}
                                        >
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedTickets.includes(ticket.id)}
                                                    onCheckedChange={(checked) => handleSelectTicket(ticket.id, checked as boolean)}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </TableCell>
                                            <TableCell onClick={() => router.push(`/admin/tickets/${ticket.id}`)}>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-xs text-muted-foreground">
                                                            {ticket.ticket_number}
                                                        </span>
                                                        {isSLABreached(ticket) && (
                                                            <AlertTriangle className="h-4 w-4 text-red-500" />
                                                        )}
                                                    </div>
                                                    <p className="font-medium truncate max-w-[200px]">{ticket.title}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell onClick={() => router.push(`/admin/tickets/${ticket.id}`)}>
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-7 w-7">
                                                        <AvatarImage src={ticket.user?.avatar_url} />
                                                        <AvatarFallback className="text-xs">
                                                            {ticket.user?.full_name?.[0] || "U"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium truncate">{ticket.user?.full_name}</p>
                                                        <p className="text-xs text-muted-foreground truncate">{ticket.user?.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell onClick={() => router.push(`/admin/tickets/${ticket.id}`)}>
                                                <span className="text-sm">{ticket.department?.name}</span>
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={ticket.status}
                                                    onValueChange={(value) => handleStatusChange(ticket.id, value)}
                                                >
                                                    <SelectTrigger className={`h-7 w-[110px] text-xs ${getStatusColor(ticket.status)}`}>
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
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getPriorityColor(ticket.priority)}>
                                                    {ticket.priority}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={ticket.assigned_to || "unassigned"}
                                                    onValueChange={(value) => handleAssign(ticket.id, value)}
                                                >
                                                    <SelectTrigger className="h-7 w-[130px] text-xs">
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
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {formatDate(ticket.created_at)}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => router.push(`/admin/tickets/${ticket.id}`)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <UserPlus className="mr-2 h-4 w-4" />
                                                            Assign Agent
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => handleStatusChange(ticket.id, "escalated")}
                                                            className="text-destructive"
                                                        >
                                                            <AlertTriangle className="mr-2 h-4 w-4" />
                                                            Escalate
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
