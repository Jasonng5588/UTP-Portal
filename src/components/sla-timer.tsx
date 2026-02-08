"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SlaTimerProps {
    dueAt: string | null;
    status: string;
    className?: string;
}

export function SlaTimer({ dueAt, status, className }: SlaTimerProps) {
    const [timeLeft, setTimeLeft] = useState<string>("");
    const [isBreached, setIsBreached] = useState(false);
    const [isWarning, setIsWarning] = useState(false);

    useEffect(() => {
        if (!dueAt || status === "resolved" || status === "closed") return;

        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const due = new Date(dueAt).getTime();
            const diff = due - now;

            if (diff <= 0) {
                setIsBreached(true);
                const overdue = Math.abs(diff);
                const hours = Math.floor(overdue / (1000 * 60 * 60));
                const minutes = Math.floor((overdue % (1000 * 60 * 60)) / (1000 * 60));
                setTimeLeft(`${hours}h ${minutes}m overdue`);
            } else {
                setIsBreached(false);
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                setTimeLeft(`${hours}h ${minutes}m remaining`);

                // Warning if less than 2 hours
                setIsWarning(hours < 2);
            }
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [dueAt, status]);

    if (!dueAt || status === "resolved" || status === "closed") {
        return (
            <div className={cn("flex items-center gap-2 text-sm text-green-600 dark:text-green-400", className)}>
                <CheckCircle className="h-4 w-4" />
                <span>SLA Complete</span>
            </div>
        );
    }

    return (
        <div className={cn(
            "flex items-center gap-2 text-sm",
            isBreached ? "text-red-600 dark:text-red-400" :
                isWarning ? "text-yellow-600 dark:text-yellow-400" :
                    "text-muted-foreground",
            className
        )}>
            {isBreached ? (
                <AlertTriangle className="h-4 w-4" />
            ) : (
                <Clock className="h-4 w-4" />
            )}
            <span>{timeLeft}</span>
        </div>
    );
}

// SLA configuration by priority (in hours)
export const SLA_CONFIG = {
    urgent: 4,
    high: 8,
    medium: 24,
    low: 72,
};

// Calculate SLA due date based on priority
export function calculateSlaDueAt(priority: string): Date {
    const hours = SLA_CONFIG[priority as keyof typeof SLA_CONFIG] || 24;
    const dueAt = new Date();
    dueAt.setHours(dueAt.getHours() + hours);
    return dueAt;
}

// Check if SLA is breached
export function isSlaBreached(dueAt: string | null, status: string): boolean {
    if (!dueAt || status === "resolved" || status === "closed") return false;
    return new Date(dueAt).getTime() < Date.now();
}
