"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
    BookOpen,
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    FileText,
    Tag,
    Loader2,
} from "lucide-react";
import type { KnowledgeBase, Department } from "@/types";

export default function KnowledgeBasePage() {
    const [articles, setArticles] = useState<KnowledgeBase[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingArticle, setEditingArticle] = useState<KnowledgeBase | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        category: "",
        tags: "",
        department_id: "",
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const supabase = createClient();

        const { data: deptData } = await supabase
            .from("departments")
            .select("*")
            .eq("is_active", true)
            .order("name");

        if (deptData) setDepartments(deptData as Department[]);

        const { data: articlesData } = await supabase
            .from("knowledge_base")
            .select(`*, department:departments(name)`)
            .eq("is_published", true)
            .order("created_at", { ascending: false });

        if (articlesData) setArticles(articlesData as KnowledgeBase[]);

        setIsLoading(false);
    };

    const filteredArticles = articles.filter((article: any) => {
        const matchesSearch =
            article.title.toLowerCase().includes(search.toLowerCase()) ||
            article.content.toLowerCase().includes(search.toLowerCase());

        const matchesCategory = categoryFilter === "all" || article.category === categoryFilter;

        return matchesSearch && matchesCategory;
    });

    const categories = [...new Set(articles.map((a: any) => a.category).filter(Boolean))];

    const handleOpenDialog = (article?: KnowledgeBase) => {
        if (article) {
            setEditingArticle(article);
            setFormData({
                title: article.title,
                content: article.content,
                category: article.category || "",
                tags: article.tags ? article.tags.join(", ") : "",
                department_id: article.department_id || "",
            });
        } else {
            setEditingArticle(null);
            setFormData({
                title: "",
                content: "",
                category: "",
                tags: "",
                department_id: "",
            });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.title.trim() || !formData.content.trim()) {
            toast.error("Title and content are required");
            return;
        }

        setIsSaving(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const articleData = {
            title: formData.title,
            content: formData.content,
            category: formData.category || null,
            tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : [],
            department_id: formData.department_id || null,
            is_published: true,
        };

        if (editingArticle) {
            const { error } = await supabase
                .from("knowledge_base")
                .update(articleData)
                .eq("id", editingArticle.id);

            if (error) {
                toast.error("Failed to update article");
            } else {
                toast.success("Article updated");
                setIsDialogOpen(false);
                fetchData();
            }
        } else {
            const { error } = await supabase
                .from("knowledge_base")
                .insert({ ...articleData, author_id: user?.id });

            if (error) {
                toast.error("Failed to create article");
            } else {
                toast.success("Article created");
                setIsDialogOpen(false);
                fetchData();
            }
        }

        setIsSaving(false);
    };

    const handleDelete = async (id: string) => {
        const supabase = createClient();

        const { error } = await supabase
            .from("knowledge_base")
            .update({ is_published: false })
            .eq("id", id);

        if (error) {
            toast.error("Failed to delete article");
        } else {
            toast.success("Article deleted");
            fetchData();
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-16" />
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Knowledge Base</h1>
                    <p className="text-muted-foreground">
                        Manage help articles and documentation
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => handleOpenDialog()} className="gap-2">
                            <Plus className="h-4 w-4" />
                            New Article
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>
                                {editingArticle ? "Edit Article" : "New Article"}
                            </DialogTitle>
                            <DialogDescription>
                                {editingArticle
                                    ? "Update knowledge base article"
                                    : "Create a new help article for users"
                                }
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    placeholder="How to reset your password"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Input
                                        id="category"
                                        placeholder="Account"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    />
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
                            <div className="space-y-2">
                                <Label htmlFor="content">Content</Label>
                                <Textarea
                                    id="content"
                                    placeholder="Article content here... (Markdown supported)"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    rows={8}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tags">Tags (comma separated)</Label>
                                <Input
                                    id="tags"
                                    placeholder="password, account, security"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingArticle ? "Update" : "Create"}
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
                                placeholder="Search articles..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-[150px]">
                                <Tag className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map((cat: any) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Articles Grid */}
            {filteredArticles.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="font-medium text-foreground mb-2">No articles found</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                            Create your first knowledge base article
                        </p>
                        <Button onClick={() => handleOpenDialog()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Article
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredArticles.map((article: any) => (
                        <Card key={article.id} className="card-hover group">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        {article.category && (
                                            <Badge variant="outline" className="mb-2 text-xs">
                                                {article.category}
                                            </Badge>
                                        )}
                                        <CardTitle className="text-lg line-clamp-2">
                                            {article.title}
                                        </CardTitle>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => handleOpenDialog(article)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive"
                                            onClick={() => handleDelete(article.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    {article.content}
                                </p>

                                {article.tags && article.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {article.tags.slice(0, 3).map((tag: string, idx: number) => (
                                            <Badge key={idx} variant="secondary" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                        {article.tags.length > 3 && (
                                            <Badge variant="secondary" className="text-xs">
                                                +{article.tags.length - 3}
                                            </Badge>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                                    <span>{article.department?.name || "General"}</span>
                                    <span className="flex items-center gap-1">
                                        <Eye className="h-3 w-3" />
                                        {article.view_count || 0} views
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
