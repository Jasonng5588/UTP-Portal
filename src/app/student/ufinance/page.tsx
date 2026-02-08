"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
    Wallet,
    CreditCard,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Clock,
    Calendar,
    FileText,
    Download,
    AlertTriangle,
    CheckCircle,
    Building2,
    GraduationCap,
    ExternalLink,
    Receipt,
    History,
    Banknote,
} from "lucide-react";

// Complete finance data based on UTP Finance features
const accountSummary = {
    currentBalance: 2500.00,
    totalPaid: 45000.00,
    totalFees: 47500.00,
    nextPaymentDue: "Mar 15, 2025",
    nextPaymentAmount: 2500.00,
    scholarshipStatus: "PETRONAS Foundation Sponsorship - 100%",
};

const transactions = [
    { id: "1", date: "Feb 1, 2025", description: "Tuition Fee - January 2025 Semester", amount: -12000.00, type: "fee", status: "paid" },
    { id: "2", date: "Jan 28, 2025", description: "PETRONAS Scholarship Credit", amount: 12000.00, type: "credit", status: "completed" },
    { id: "3", date: "Jan 15, 2025", description: "Hostel Fee - Semester 2", amount: -2200.00, type: "fee", status: "paid" },
    { id: "4", date: "Jan 10, 2025", description: "Student Activity Fee", amount: -100.00, type: "fee", status: "paid" },
    { id: "5", date: "Dec 20, 2024", description: "Book Allowance", amount: 500.00, type: "credit", status: "completed" },
    { id: "6", date: "Dec 15, 2024", description: "Library Fine", amount: -15.00, type: "fine", status: "paid" },
];

const upcomingPayments = [
    { id: "p1", description: "Hostel Fee - March 2025", amount: 2200.00, dueDate: "Mar 1, 2025", category: "Accommodation" },
    { id: "p2", description: "Student Activity Fee", amount: 100.00, dueDate: "Mar 15, 2025", category: "Activities" },
    { id: "p3", description: "Lab Fee - Semester 2", amount: 200.00, dueDate: "Mar 15, 2025", category: "Academic" },
];

const paymentMethods = [
    { id: "m1", name: "Online Banking (FPX)", icon: "🏦", description: "Instant transfer via Malaysian banks" },
    { id: "m2", name: "Credit/Debit Card", icon: "💳", description: "Visa, Mastercard accepted" },
    { id: "m3", name: "PTPTN Loan", icon: "📋", description: "Pay using PTPTN education loan" },
    { id: "m4", name: "JPA Scholarship", icon: "🎓", description: "Government scholarship deduction" },
];

const scholarships = [
    { id: "s1", name: "PETRONAS Foundation Sponsorship", status: "active", coverage: "100%", validUntil: "Graduation", description: "Full sponsorship covering tuition and allowances" },
];

const ptptnInfo = {
    status: "Not Applicable",
    loanAmount: 0,
    disbursed: 0,
    balance: 0,
};

const financialDocuments = [
    { id: "d1", name: "Fee Statement - January 2025", date: "Jan 30, 2025", type: "statement" },
    { id: "d2", name: "Payment Receipt - Jan 2025", date: "Jan 28, 2025", type: "receipt" },
    { id: "d3", name: "Scholarship Letter 2024/2025", date: "Sep 1, 2024", type: "letter" },
    { id: "d4", name: "Fee Statement - September 2024", date: "Sep 30, 2024", type: "statement" },
];

export default function UFinancePage() {
    const [activeTab, setActiveTab] = useState("overview");
    const [selectedPayment, setSelectedPayment] = useState<typeof upcomingPayments[0] | null>(null);
    const [payDialogOpen, setPayDialogOpen] = useState(false);

    const makePayment = (paymentId: string, method: string) => {
        toast.success(`Payment initiated via ${method}. Redirecting to payment gateway...`);
        setPayDialogOpen(false);
    };

    const downloadDocument = (docId: string) => {
        toast.success("Downloading document...");
    };

    const requestStatement = () => {
        toast.success("Statement request submitted. It will be available in Documents within 24 hours.");
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                        <Wallet className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">UFinance</h1>
                        <p className="text-muted-foreground">Student Finance & Payments</p>
                    </div>
                </div>
            </div>

            {/* Account Summary */}
            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-green-100 text-sm mb-1">Current Balance</p>
                            <p className="text-4xl font-bold">RM {accountSummary.currentBalance.toLocaleString()}</p>
                            <p className="text-green-100 text-sm mt-2">{accountSummary.scholarshipStatus}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/20 rounded-lg p-3">
                                <p className="text-2xl font-bold">RM {(accountSummary.totalPaid / 1000).toFixed(0)}K</p>
                                <p className="text-green-100 text-sm">Total Paid</p>
                            </div>
                            <div className="bg-white/20 rounded-lg p-3">
                                <p className="text-2xl font-bold">RM {(accountSummary.totalFees / 1000).toFixed(0)}K</p>
                                <p className="text-green-100 text-sm">Total Fees</p>
                            </div>
                            <div className="bg-white/20 rounded-lg p-3 col-span-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold">Next Payment</p>
                                        <p className="text-green-100 text-sm">{accountSummary.nextPaymentDue}</p>
                                    </div>
                                    <p className="text-xl font-bold">RM {accountSummary.nextPaymentAmount.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Overdue Alert */}
            {accountSummary.currentBalance > 0 && (
                <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-950/20">
                    <CardContent className="p-4 flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <div className="flex-1">
                            <p className="font-medium text-yellow-700 dark:text-yellow-400">Outstanding Balance</p>
                            <p className="text-sm text-muted-foreground">You have an outstanding balance of RM {accountSummary.currentBalance.toLocaleString()}. Please make payment before the due date.</p>
                        </div>
                        <Button onClick={() => setActiveTab("payments")}>Pay Now</Button>
                    </CardContent>
                </Card>
            )}

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="payments">Payments</TabsTrigger>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                                    <TrendingUp className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{Math.round((accountSummary.totalPaid / accountSummary.totalFees) * 100)}%</p>
                                    <p className="text-sm text-muted-foreground">Fees Paid</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                    <Receipt className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{transactions.filter(t => t.type === "fee").length}</p>
                                    <p className="text-sm text-muted-foreground">Fee Transactions</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                    <GraduationCap className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{scholarships.length}</p>
                                    <p className="text-sm text-muted-foreground">Active Scholarships</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Progress value={(accountSummary.totalPaid / accountSummary.totalFees) * 100} className="h-4" />
                            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                                <span>Paid: RM {accountSummary.totalPaid.toLocaleString()}</span>
                                <span>Total: RM {accountSummary.totalFees.toLocaleString()}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {transactions.slice(0, 4).map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tx.amount > 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                                            }`}>
                                            {tx.amount > 0 ? <TrendingUp className="h-5 w-5 text-green-600" /> : <TrendingDown className="h-5 w-5 text-red-600" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{tx.description}</p>
                                            <p className="text-xs text-muted-foreground">{tx.date}</p>
                                        </div>
                                    </div>
                                    <p className={`font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {tx.amount > 0 ? '+' : ''}RM {Math.abs(tx.amount).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Payments Tab */}
                <TabsContent value="payments" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Payments</CardTitle>
                            <CardDescription>Fees due for payment</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {upcomingPayments.map((payment) => (
                                <div key={payment.id} className="p-4 rounded-lg border">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <Badge variant="outline">{payment.category}</Badge>
                                            <h3 className="font-semibold mt-1">{payment.description}</h3>
                                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                                <Calendar className="h-3 w-3" />
                                                Due: {payment.dueDate}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold">RM {payment.amount.toLocaleString()}</p>
                                            <Dialog open={payDialogOpen && selectedPayment?.id === payment.id} onOpenChange={(open) => {
                                                setPayDialogOpen(open);
                                                if (open) setSelectedPayment(payment);
                                            }}>
                                                <DialogTrigger asChild>
                                                    <Button size="sm" className="mt-2">Pay Now</Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Make Payment</DialogTitle>
                                                        <DialogDescription>{payment.description} - RM {payment.amount.toLocaleString()}</DialogDescription>
                                                    </DialogHeader>
                                                    <div className="space-y-3 pt-4">
                                                        <p className="text-sm font-medium">Select Payment Method</p>
                                                        {paymentMethods.map((method) => (
                                                            <Button
                                                                key={method.id}
                                                                variant="outline"
                                                                className="w-full justify-start gap-3 h-auto py-3"
                                                                onClick={() => makePayment(payment.id, method.name)}
                                                            >
                                                                <span className="text-xl">{method.icon}</span>
                                                                <div className="text-left">
                                                                    <p className="font-medium">{method.name}</p>
                                                                    <p className="text-xs text-muted-foreground">{method.description}</p>
                                                                </div>
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Transactions Tab */}
                <TabsContent value="transactions" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <History className="h-5 w-5" />
                                Transaction History
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {transactions.map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tx.amount > 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                                            }`}>
                                            {tx.amount > 0 ? <TrendingUp className="h-5 w-5 text-green-600" /> : <TrendingDown className="h-5 w-5 text-red-600" />}
                                        </div>
                                        <div>
                                            <p className="font-medium">{tx.description}</p>
                                            <p className="text-sm text-muted-foreground">{tx.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {tx.amount > 0 ? '+' : ''}RM {Math.abs(tx.amount).toLocaleString()}
                                        </p>
                                        <Badge variant="secondary" className="text-xs">{tx.status}</Badge>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Scholarships Tab */}
                <TabsContent value="scholarships" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Scholarships</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {scholarships.map((scholarship) => (
                                <div key={scholarship.id} className="p-4 rounded-lg border bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                                    <div className="flex items-start gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                                            <GraduationCap className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold">{scholarship.name}</h3>
                                                <Badge className="bg-green-500">{scholarship.status}</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">{scholarship.description}</p>
                                            <div className="flex items-center gap-4 mt-2 text-sm">
                                                <span><strong>Coverage:</strong> {scholarship.coverage}</span>
                                                <span><strong>Valid Until:</strong> {scholarship.validUntil}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>PTPTN Loan Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 rounded-lg bg-muted/50 text-center">
                                <Banknote className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                                <p className="font-medium">{ptptnInfo.status}</p>
                                <p className="text-sm text-muted-foreground mt-1">You are currently under full sponsorship and PTPTN is not applicable.</p>
                                <Button variant="outline" className="mt-4 gap-2">
                                    <ExternalLink className="h-4 w-4" />
                                    Visit PTPTN Portal
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Financial Documents</CardTitle>
                                    <CardDescription>Statements, receipts, and letters</CardDescription>
                                </div>
                                <Button variant="outline" onClick={requestStatement}>Request Statement</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {financialDocuments.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">{doc.name}</p>
                                            <p className="text-xs text-muted-foreground">{doc.date}</p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="outline" className="gap-1" onClick={() => downloadDocument(doc.id)}>
                                        <Download className="h-4 w-4" />
                                        Download
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
