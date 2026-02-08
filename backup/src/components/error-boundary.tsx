"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Error caught by boundary:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[400px] flex items-center justify-center p-8">
                    <Card className="max-w-md w-full">
                        <CardHeader className="text-center">
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                                </div>
                            </div>
                            <CardTitle>Something went wrong</CardTitle>
                            <CardDescription>
                                We encountered an unexpected error. Please try again or contact support if the problem persists.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {process.env.NODE_ENV === "development" && this.state.error && (
                                <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-32">
                                    {this.state.error.message}
                                </pre>
                            )}
                        </CardContent>
                        <CardFooter className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => this.setState({ hasError: false, error: null })}
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Try Again
                            </Button>
                            <Link href="/" className="flex-1">
                                <Button className="w-full">
                                    <Home className="mr-2 h-4 w-4" />
                                    Go Home
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

// Functional error component for Next.js error.tsx pages
export function ErrorPage({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center p-8">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                    <CardTitle>Something went wrong!</CardTitle>
                    <CardDescription>
                        An error occurred while loading this page.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {process.env.NODE_ENV === "development" && (
                        <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-32">
                            {error.message}
                        </pre>
                    )}
                </CardContent>
                <CardFooter className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={reset}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try Again
                    </Button>
                    <Link href="/" className="flex-1">
                        <Button className="w-full">
                            <Home className="mr-2 h-4 w-4" />
                            Go Home
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
