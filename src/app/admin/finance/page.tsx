"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function FinanceAdminPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Financial Management</h1>
                    <p className="text-muted-foreground">Manage student accounts, fees, and transactions</p>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Financial Overview</CardTitle>
                    <CardDescription>Track payments and outstanding fees</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground py-8 text-center">Finance management module loaded successfully.</p>
                </CardContent>
            </Card>
        </div>
    );
}
