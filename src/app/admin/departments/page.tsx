"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
    Building2,
    Plus,
    Edit,
    Trash2,
    Users,
    Ticket,
    Loader2,
    ChevronRight,
} from "lucide-react";
import type { Department, Subcategory } from "@/types";

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingDept, setEditingDept] = useState<Department | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        email: "",
    });

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        const supabase = createClient();

        const { data } = await supabase
            .from("departments")
            .select(`
        *,
        subcategories(*),
        tickets:tickets(count)
      `)
            .order("name");

        if (data) setDepartments(data);
        setIsLoading(false);
    };

    const handleOpenDialog = (dept?: Department) => {
        if (dept) {
            setEditingDept(dept);
            setFormData({
                name: dept.name,
                description: dept.description || "",
                email: dept.email || "",
            });
        } else {
            setEditingDept(null);
            setFormData({ name: "", description: "", email: "" });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast.error("Department name is required");
            return;
        }

        setIsSaving(true);
        const supabase = createClient();

        if (editingDept) {
            const { error } = await supabase
                .from("departments")
                .update(formData)
                .eq("id", editingDept.id);

            if (error) {
                toast.error("Failed to update department");
            } else {
                toast.success("Department updated");
                setIsDialogOpen(false);
                fetchDepartments();
            }
        } else {
            const { error } = await supabase
                .from("departments")
                .insert(formData);

            if (error) {
                toast.error("Failed to create department");
            } else {
                toast.success("Department created");
                setIsDialogOpen(false);
                fetchDepartments();
            }
        }

        setIsSaving(false);
    };

    const handleDelete = async (id: string) => {
        const supabase = createClient();

        const { error } = await supabase
            .from("departments")
            .update({ is_active: false })
            .eq("id", id);

        if (error) {
            toast.error("Failed to delete department");
        } else {
            toast.success("Department deleted");
            fetchDepartments();
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-64" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-48" />
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
                    <h1 className="text-2xl font-bold text-foreground">Departments</h1>
                    <p className="text-muted-foreground">
                        Manage departments and categories
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => handleOpenDialog()} className="gap-2">
                            <Plus className="h-4 w-4" />
                            New Department
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingDept ? "Edit Department" : "New Department"}
                            </DialogTitle>
                            <DialogDescription>
                                {editingDept
                                    ? "Update department information"
                                    : "Create a new department for ticket routing"
                                }
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Department Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., IT Services"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="department@utp.edu.my"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Brief description of this department..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingDept ? "Update" : "Create"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Departments Grid */}
            {departments.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center">
                        <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="font-medium text-foreground mb-2">No departments yet</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                            Create your first department to start organizing tickets
                        </p>
                        <Button onClick={() => handleOpenDialog()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Department
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {departments.filter(d => d.is_active).map((dept: any) => (
                        <Card key={dept.id} className="card-hover group">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Building2 className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{dept.name}</CardTitle>
                                            {dept.email && (
                                                <p className="text-xs text-muted-foreground">{dept.email}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => handleOpenDialog(dept)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Department?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will deactivate the department. Existing tickets will be preserved.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(dept.id)}>
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {dept.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {dept.description}
                                    </p>
                                )}

                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1.5">
                                        <Ticket className="h-4 w-4 text-muted-foreground" />
                                        <span>{dept.tickets?.[0]?.count || 0} tickets</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span>{dept.subcategories?.length || 0} categories</span>
                                    </div>
                                </div>

                                {dept.subcategories && dept.subcategories.length > 0 && (
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-muted-foreground">Categories:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {dept.subcategories.slice(0, 3).map((sub: Subcategory) => (
                                                <Badge key={sub.id} variant="outline" className="text-xs">
                                                    {sub.name}
                                                </Badge>
                                            ))}
                                            {dept.subcategories.length > 3 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{dept.subcategories.length - 3} more
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
