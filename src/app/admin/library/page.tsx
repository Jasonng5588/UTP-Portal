"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Book, Plus, Search, Calendar, User, CheckCircle, XCircle } from "lucide-react";

export default function LibraryAdminPage() {
    const [activeTab, setActiveTab] = useState("books");
    const [books, setBooks] = useState<any[]>([]);
    const [loans, setLoans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const supabase = createClient();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Books
            const { data: booksData } = await supabase
                .from('books')
                .select('*')
                .order('title');
            if (booksData) setBooks(booksData);

            // Fetch Active Loans
            const { data: loansData } = await supabase
                .from('book_loans')
                .select(`
                    *,
                    book:books(title, isbn),
                    student:profiles(full_name, student_id)
                `)
                .order('borrowed_at', { ascending: false });
            if (loansData) setLoans(loansData);

        } catch (error) {
            console.error('Error fetching library data:', error);
            toast.error("Failed to load library data");
        } finally {
            setLoading(false);
        }
    };

    const handleReturnBook = async (loanId: string) => {
        try {
            const { error } = await supabase
                .from('book_loans')
                .update({
                    status: 'returned',
                    returned_at: new Date().toISOString()
                })
                .eq('id', loanId);

            if (error) throw error;

            toast.success("Book returned successfully");
            fetchData();
        } catch (error: any) {
            toast.error("Failed to return book");
        }
    };

    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.isbn?.includes(searchQuery)
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Library Management</h1>
                    <p className="text-muted-foreground">Manage books, loans, and reservations</p>
                </div>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Book
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="books">Books Catalog</TabsTrigger>
                    <TabsTrigger value="loans">Active Loans</TabsTrigger>
                </TabsList>

                <TabsContent value="books" className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search books..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Author</TableHead>
                                    <TableHead>ISBN</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Copies</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredBooks.map((book) => (
                                    <TableRow key={book.id}>
                                        <TableCell className="font-medium">{book.title}</TableCell>
                                        <TableCell>{book.author}</TableCell>
                                        <TableCell>{book.isbn}</TableCell>
                                        <TableCell>{book.category}</TableCell>
                                        <TableCell>{book.available_copies} / {book.total_copies}</TableCell>
                                        <TableCell>
                                            <Badge variant={book.available_copies > 0 ? "outline" : "destructive"}>
                                                {book.available_copies > 0 ? "Available" : "Out of Stock"}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                <TabsContent value="loans" className="space-y-4">
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Book</TableHead>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Borrowed Date</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loans.map((loan) => (
                                    <TableRow key={loan.id}>
                                        <TableCell className="font-medium">{loan.book?.title}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{loan.student?.full_name}</span>
                                                <span className="text-xs text-muted-foreground">{loan.student?.student_id}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{new Date(loan.borrowed_at).toLocaleDateString()}</TableCell>
                                        <TableCell>{new Date(loan.due_date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={loan.status === 'returned' ? "secondary" :
                                                    loan.status === 'overdue' ? "destructive" : "default"}
                                            >
                                                {loan.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {loan.status === 'borrowed' && (
                                                <Button size="sm" variant="outline" onClick={() => handleReturnBook(loan.id)}>
                                                    Return
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
