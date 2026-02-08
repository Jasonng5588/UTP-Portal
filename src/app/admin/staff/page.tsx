"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
    Users,
    Plus,
    Edit,
    Search,
    Shield,
    Mail,
    Phone,
    Building2,
    Loader2,
} from "lucide-react";
import type { Profile, Department } from "@/types";

export default function StaffPage() {
    const [staff, setStaff] = useState<Profile[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Profile | null>(null);
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        role: "support_agent",
        department_id: "",
    });

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

        // Get staff
        const { data: staffData } = await supabase
            .from("profiles")
            .select("*")
            .in("role", ["support_agent", "department_admin", "super_admin"])
            .order("full_name");

        if (staffData) setStaff(staffData as Profile[]);

        setIsLoading(false);
    };

    const filteredStaff = staff.filter((s) => {
        const matchesSearch =
            s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            s.email?.toLowerCase().includes(search.toLowerCase());

        const matchesRole = roleFilter === "all" || s.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    const handleOpenDialog = (staffMember?: Profile) => {
        if (staffMember) {
            setEditingStaff(staffMember);
            setFormData({
                full_name: staffMember.full_name || "",
                email: staffMember.email || "",
                phone: staffMember.phone || "",
                role: staffMember.role,
                department_id: staffMember.department_id || "",
            });
        } else {
            setEditingStaff(null);
            setFormData({
                full_name: "",
                email: "",
                phone: "",
                role: "support_agent",
                department_id: "",
            });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.full_name.trim()) {
            toast.error("Name is required");
            return;
        }

        setIsSaving(true);
        const supabase = createClient();

        if (editingStaff) {
            const { error } = await supabase
                .from("profiles")
                .update({
                    full_name: formData.full_name,
                    phone: formData.phone,
                    role: formData.role,
                    department_id: formData.department_id || null,
                })
                .eq("id", editingStaff.id);

            if (error) {
                toast.error("Failed to update staff");
            } else {
                toast.success("Staff updated");
                setIsDialogOpen(false);
                fetchData();
            }
        }

        setIsSaving(false);
    };

    const getRoleBadge = (role: string) => {
        const badges: Record<string, { label: string; className: string }> = {
            super_admin: { label: "Super Admin", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
            department_admin: { label: "Dept Admin", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
            support_agent: { label: "Agent", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
        };
        const badge = badges[role] || badges.support_agent;
        return <Badge className={badge.className}>{badge.label}</Badge>;
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Staff Management</h1>
                    <p className="text-muted-foreground">
                        Manage support agents and administrators
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => handleOpenDialog()} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Staff
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingStaff ? "Edit Staff" : "Add Staff Member"}
                            </DialogTitle>
                            <DialogDescription>
                                {editingStaff
                                    ? "Update staff information and permissions"
                                    : "Add a new staff member to the support team"
                                }
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="full_name">Full Name</Label>
                                <Input
                                    id="full_name"
                                    placeholder="John Doe"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="john@utp.edu.my"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    disabled={!!editingStaff}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    placeholder="+60 12-345 6789"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Select
                                        value={formData.role}
                                        onValueChange={(value) => setFormData({ ...formData, role: value as any })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="support_agent">Support Agent</SelectItem>
                                            <SelectItem value="department_admin">Department Admin</SelectItem>
                                            <SelectItem value="super_admin">Super Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="department">Department</Label>
                                    <Select
                                        value={formData.department_id}
                                        onValueChange={(value) => setFormData({ ...formData, department_id: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept.id} value={dept.id}>
                                                    {dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingStaff ? "Update" : "Create"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search staff..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-[150px]">
                                <Shield className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="super_admin">Super Admin</SelectItem>
                                <SelectItem value="department_admin">Dept Admin</SelectItem>
                                <SelectItem value="support_agent">Agent</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Staff Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Staff Member</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStaff.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No staff members found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredStaff.map((member) => (
                                    <TableRow key={member.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={member.avatar_url || undefined} />
                                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                                        {getInitials(member.full_name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{member.full_name}</p>
                                                    <p className="text-sm text-muted-foreground">{member.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getRoleBadge(member.role)}</TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <p className="text-sm flex items-center gap-1.5">
                                                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                                    {member.email}
                                                </p>
                                                {member.phone && (
                                                    <p className="text-sm flex items-center gap-1.5">
                                                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                                        {member.phone}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {member.department_id ? (
                                                <Badge variant="outline" className="gap-1">
                                                    <Building2 className="h-3 w-3" />
                                                    {departments.find(d => d.id === member.department_id)?.name || "Unknown"}
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">Not assigned</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenDialog(member)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
