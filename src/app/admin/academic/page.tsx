import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AcademicAdminPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Academic Management</h1>
                    <p className="text-muted-foreground">Manage courses, enrollments, and grades</p>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Courses Overview</CardTitle>
                    <CardDescription>System course list</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground py-8 text-center">Academic management module loaded successfully.</p>
                </CardContent>
            </Card>
        </div>
    );
}
