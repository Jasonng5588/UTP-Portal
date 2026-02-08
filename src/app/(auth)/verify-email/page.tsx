"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, ArrowLeft } from "lucide-react";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "your email";

    return (
        <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1 pb-6 text-center">
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <Mail className="w-8 h-8 text-[#003DA5] dark:text-blue-400" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
                <CardDescription className="text-base">
                    We&apos;ve sent a verification email to
                </CardDescription>
                <p className="font-medium text-foreground">{email}</p>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground space-y-2">
                    <p>Please check your inbox and click the verification link to activate your account.</p>
                    <p>If you don&apos;t see the email:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Check your spam or junk folder</li>
                        <li>Make sure you entered the correct email</li>
                        <li>Wait a few minutes and refresh</li>
                    </ul>
                </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
                <Link href="/login" className="w-full">
                    <Button variant="outline" className="w-full">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Login
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}

function VerifyEmailFallback() {
    return (
        <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1 pb-6 text-center">
                <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
                <Skeleton className="h-8 w-48 mx-auto" />
                <Skeleton className="h-4 w-64 mx-auto" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-24 w-full" />
            </CardContent>
            <CardFooter>
                <Skeleton className="h-10 w-full" />
            </CardFooter>
        </Card>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<VerifyEmailFallback />}>
            <VerifyEmailContent />
        </Suspense>
    );
}
