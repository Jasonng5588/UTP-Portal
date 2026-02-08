"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { libraryApi } from "@/lib/api";
import {
    BookOpen,
    Search,
    Clock,
    Calendar,
    Download,
    BookMarked,
    History,
    RefreshCw,
    Headphones,
    FileText,
    Star,
    AlertCircle,
    CheckCircle,
    Loader2,
} from "lucide-react";

type Book = {
    id: string;
    isbn: string | null;
    title: string;
    author: string;
    publisher: string | null;
    year_published: number | null;
    category: string | null;
    description: string | null;
    cover_image: string | null;
    total_copies: number;
    available_copies: number;
    location: string | null;
    is_ebook: boolean;
    ebook_url: string | null;
};

type BookLoan = {
    id: string;
    book_id: string;
    borrowed_at: string;
    due_date: string;
    returned_at: string | null;
    renewed_count: number;
    status: string;
    fine_amount: number;
    book: Book;
};

export default function ULibraryPage() {
    const [activeTab, setActiveTab] = useState("catalog");
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [books, setBooks] = useState<Book[]>([]);
    const [myLoans, setMyLoans] = useState<BookLoan[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [borrowDialogOpen, setBorrowDialogOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [borrowing, setBorrowing] = useState(false);

    const supabase = createClient();

    // Get current user
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
            }
        };
        getUser();
    }, []);

    // Load books
    useEffect(() => {
        loadBooks();
    }, [searchQuery, categoryFilter]);

    // Load loans when user is available
    useEffect(() => {
        if (userId) {
            loadMyLoans();
        }
    }, [userId]);

    const loadBooks = async () => {
        setLoading(true);
        try {
            const { data, error } = await libraryApi.getBooks(
                searchQuery || undefined,
                categoryFilter !== 'all' ? categoryFilter : undefined
            );
            if (error) throw error;
            setBooks(data || []);
        } catch (error) {
            console.error('Error loading books:', error);
            // Fallback to demo data if database not connected
            setBooks([
                { id: "1", isbn: "978-0-13-468599-1", title: "Clean Code", author: "Robert C. Martin", publisher: "Prentice Hall", year_published: 2008, category: "Computer Science", description: "A handbook of agile software craftsmanship", cover_image: null, total_copies: 5, available_copies: 3, location: "CS-A-101", is_ebook: false, ebook_url: null },
                { id: "2", isbn: "978-0-596-51774-8", title: "JavaScript: The Good Parts", author: "Douglas Crockford", publisher: "O'Reilly", year_published: 2008, category: "Computer Science", description: "Unearthing the Excellence in JavaScript", cover_image: null, total_copies: 3, available_copies: 2, location: "CS-A-102", is_ebook: true, ebook_url: "/ebooks/js-good-parts.pdf" },
                { id: "3", isbn: "978-0-13-235088-4", title: "The Pragmatic Programmer", author: "David Thomas", publisher: "Pearson", year_published: 2019, category: "Computer Science", description: "Your Journey to Mastery", cover_image: null, total_copies: 4, available_copies: 4, location: "CS-A-103", is_ebook: false, ebook_url: null },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const loadMyLoans = async () => {
        if (!userId) return;
        try {
            const { data, error } = await libraryApi.getMyLoans(userId);
            if (error) throw error;
            setMyLoans(data as BookLoan[] || []);
        } catch (error) {
            console.error('Error loading loans:', error);
            setMyLoans([]);
        }
    };

    const handleBorrow = async () => {
        if (!selectedBook || !userId) {
            toast.error("Please login to borrow books");
            return;
        }
        setBorrowing(true);
        try {
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 14); // 2 weeks loan

            const { error } = await libraryApi.borrowBook(selectedBook.id, userId, dueDate.toISOString());
            if (error) throw error;

            toast.success(`Successfully borrowed "${selectedBook.title}"`);
            setBorrowDialogOpen(false);
            setSelectedBook(null);
            loadBooks();
            loadMyLoans();
        } catch (error: any) {
            console.error('Borrow error:', error);
            toast.error(error.message || "Failed to borrow book");
        } finally {
            setBorrowing(false);
        }
    };

    const handleReturn = async (loanId: string, bookTitle: string) => {
        try {
            const { error } = await libraryApi.returnBook(loanId);
            if (error) throw error;
            toast.success(`Returned "${bookTitle}"`);
            loadMyLoans();
            loadBooks();
        } catch (error: any) {
            toast.error(error.message || "Failed to return book");
        }
    };

    const handleReserve = async (bookId: string, bookTitle: string) => {
        if (!userId) {
            toast.error("Please login to reserve books");
            return;
        }
        try {
            const { error } = await libraryApi.reserveBook(bookId, userId);
            if (error) throw error;
            toast.success(`Reserved "${bookTitle}"`);
        } catch (error: any) {
            toast.error(error.message || "Failed to reserve book");
        }
    };

    const categories = [...new Set(books.map(b => b.category).filter(Boolean))];

    const activeLoans = myLoans.filter(l => l.status === 'borrowed' || l.status === 'overdue');
    const loanHistory = myLoans.filter(l => l.status === 'returned');

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">ULibrary</h1>
                        <p className="text-muted-foreground">Information Resource Centre</p>
                    </div>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search books, authors, ISBN..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{books.length}</p>
                            <p className="text-xs text-muted-foreground">Books Available</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <BookMarked className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{activeLoans.length}</p>
                            <p className="text-xs text-muted-foreground">Active Loans</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{books.filter(b => b.is_ebook).length}</p>
                            <p className="text-xs text-muted-foreground">E-Books</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                            <History className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{loanHistory.length}</p>
                            <p className="text-xs text-muted-foreground">Books Read</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="catalog">Catalog</TabsTrigger>
                    <TabsTrigger value="myloans">My Loans</TabsTrigger>
                    <TabsTrigger value="ebooks">E-Books</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                {/* Catalog Tab */}
                <TabsContent value="catalog" className="space-y-4">
                    {/* Category Filter */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        <Button
                            variant={categoryFilter === "all" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCategoryFilter("all")}
                        >
                            All
                        </Button>
                        {categories.map((cat) => (
                            <Button
                                key={cat}
                                variant={categoryFilter === cat ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCategoryFilter(cat || "all")}
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>

                    {/* Books Grid */}
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {books.map((book) => (
                                <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-all">
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-16 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900 dark:to-emerald-800 rounded flex items-center justify-center flex-shrink-0">
                                                <BookOpen className="h-8 w-8 text-emerald-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-sm line-clamp-2">{book.title}</h3>
                                                <p className="text-sm text-muted-foreground">{book.author}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Badge variant="outline" className="text-xs">{book.category}</Badge>
                                                    {book.is_ebook && <Badge className="bg-purple-500 text-xs">E-Book</Badge>}
                                                </div>
                                                <div className="flex items-center gap-2 mt-2 text-sm">
                                                    {book.available_copies > 0 ? (
                                                        <span className="text-green-600 flex items-center gap-1">
                                                            <CheckCircle className="h-3 w-3" />
                                                            {book.available_copies}/{book.total_copies} available
                                                        </span>
                                                    ) : (
                                                        <span className="text-red-600 flex items-center gap-1">
                                                            <AlertCircle className="h-3 w-3" />
                                                            Not available
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-4">
                                            {book.available_copies > 0 ? (
                                                <Dialog open={borrowDialogOpen && selectedBook?.id === book.id} onOpenChange={(open) => {
                                                    setBorrowDialogOpen(open);
                                                    if (open) setSelectedBook(book);
                                                }}>
                                                    <DialogTrigger asChild>
                                                        <Button size="sm" className="flex-1">Borrow</Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Confirm Borrow</DialogTitle>
                                                            <DialogDescription>
                                                                You are about to borrow "{book.title}" by {book.author}
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="space-y-4 pt-4">
                                                            <div className="p-4 rounded-lg bg-muted/50">
                                                                <p className="text-sm"><strong>Loan Period:</strong> 14 days</p>
                                                                <p className="text-sm"><strong>Due Date:</strong> {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                                                                <p className="text-sm"><strong>Location:</strong> {book.location}</p>
                                                            </div>
                                                            <Button className="w-full" onClick={handleBorrow} disabled={borrowing}>
                                                                {borrowing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                                                Confirm Borrow
                                                            </Button>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            ) : (
                                                <Button size="sm" variant="outline" className="flex-1" onClick={() => handleReserve(book.id, book.title)}>
                                                    Reserve
                                                </Button>
                                            )}
                                            {book.is_ebook && (
                                                <Button size="sm" variant="secondary">
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* My Loans Tab */}
                <TabsContent value="myloans" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Current Loans</CardTitle>
                            <CardDescription>Books you currently have borrowed</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {activeLoans.length > 0 ? (
                                activeLoans.map((loan) => (
                                    <div key={loan.id} className="p-4 rounded-lg border flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded flex items-center justify-center">
                                                <BookOpen className="h-6 w-6 text-emerald-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{loan.book?.title}</h3>
                                                <p className="text-sm text-muted-foreground">{loan.book?.author}</p>
                                                <div className="flex items-center gap-3 mt-1 text-sm">
                                                    <span className="flex items-center gap-1 text-muted-foreground">
                                                        <Calendar className="h-3 w-3" />
                                                        Due: {new Date(loan.due_date).toLocaleDateString()}
                                                    </span>
                                                    {loan.status === 'overdue' && (
                                                        <Badge variant="destructive">Overdue</Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" className="gap-1">
                                                <RefreshCw className="h-4 w-4" />
                                                Renew
                                            </Button>
                                            <Button size="sm" onClick={() => handleReturn(loan.id, loan.book?.title || '')}>
                                                Return
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <BookMarked className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                    <p className="text-muted-foreground">No active loans</p>
                                    <Button className="mt-4" onClick={() => setActiveTab("catalog")}>Browse Catalog</Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* E-Books Tab */}
                <TabsContent value="ebooks" className="space-y-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {books.filter(b => b.is_ebook).map((book) => (
                            <Card key={book.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-20 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 rounded flex items-center justify-center">
                                            <FileText className="h-8 w-8 text-purple-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-sm">{book.title}</h3>
                                            <p className="text-sm text-muted-foreground">{book.author}</p>
                                            <Badge className="mt-2 bg-purple-500">E-Book</Badge>
                                        </div>
                                    </div>
                                    <Button size="sm" className="w-full mt-4 gap-2">
                                        <Download className="h-4 w-4" />
                                        Read Online
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                        {books.filter(b => b.is_ebook).length === 0 && (
                            <div className="col-span-full text-center py-8">
                                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                <p className="text-muted-foreground">No e-books available</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Loan History</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {loanHistory.length > 0 ? (
                                loanHistory.map((loan) => (
                                    <div key={loan.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                            <div>
                                                <p className="font-medium">{loan.book?.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Returned: {loan.returned_at ? new Date(loan.returned_at).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="secondary">Returned</Badge>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <History className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                    <p className="text-muted-foreground">No loan history yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
