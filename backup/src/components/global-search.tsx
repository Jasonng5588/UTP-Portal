"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Search, Ticket, User, Building2, FileText } from "lucide-react";

interface SearchResult {
    type: "ticket" | "user" | "department" | "article";
    id: string;
    title: string;
    subtitle: string;
    status?: string;
}

export function GlobalSearch() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Keyboard shortcut
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const search = useCallback(async (searchQuery: string) => {
        if (!searchQuery || searchQuery.length < 2) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        const supabase = createClient();

        try {
            const searchResults: SearchResult[] = [];

            // Search tickets
            const { data: tickets } = await supabase
                .from("tickets")
                .select("id, ticket_number, title, status")
                .or(`title.ilike.%${searchQuery}%,ticket_number.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
                .limit(5);

            if (tickets) {
                searchResults.push(
                    ...tickets.map((t) => ({
                        type: "ticket" as const,
                        id: t.id,
                        title: `#${t.ticket_number} - ${t.title}`,
                        subtitle: "Ticket",
                        status: t.status,
                    }))
                );
            }

            // Search profiles
            const { data: profiles } = await supabase
                .from("profiles")
                .select("id, full_name, email, role")
                .or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
                .limit(5);

            if (profiles) {
                searchResults.push(
                    ...profiles.map((p) => ({
                        type: "user" as const,
                        id: p.id,
                        title: p.full_name || p.email,
                        subtitle: p.role?.replace("_", " "),
                    }))
                );
            }

            // Search departments
            const { data: departments } = await supabase
                .from("departments")
                .select("id, name, description")
                .ilike("name", `%${searchQuery}%`)
                .limit(3);

            if (departments) {
                searchResults.push(
                    ...departments.map((d) => ({
                        type: "department" as const,
                        id: d.id,
                        title: d.name,
                        subtitle: "Department",
                    }))
                );
            }

            // Search knowledge base
            const { data: articles } = await supabase
                .from("knowledge_base")
                .select("id, title, category")
                .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
                .eq("is_published", true)
                .limit(5);

            if (articles) {
                searchResults.push(
                    ...articles.map((a) => ({
                        type: "article" as const,
                        id: a.id,
                        title: a.title,
                        subtitle: a.category || "Article",
                    }))
                );
            }

            setResults(searchResults);
        } catch (error) {
            console.error("Search error:", error);
        }

        setIsLoading(false);
    }, []);

    useEffect(() => {
        const debounce = setTimeout(() => {
            search(query);
        }, 300);

        return () => clearTimeout(debounce);
    }, [query, search]);

    const handleSelect = (result: SearchResult) => {
        setOpen(false);
        switch (result.type) {
            case "ticket":
                router.push(`/admin/tickets/${result.id}`);
                break;
            case "user":
                router.push(`/admin/staff?user=${result.id}`);
                break;
            case "department":
                router.push(`/admin/departments?dept=${result.id}`);
                break;
            case "article":
                router.push(`/admin/knowledge-base?article=${result.id}`);
                break;
        }
    };

    const getIcon = (type: SearchResult["type"]) => {
        switch (type) {
            case "ticket": return Ticket;
            case "user": return User;
            case "department": return Building2;
            case "article": return FileText;
        }
    };

    return (
        <>
            <Button
                variant="outline"
                className="relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
                onClick={() => setOpen(true)}
            >
                <Search className="mr-2 h-4 w-4" />
                <span className="hidden lg:inline-flex">Search...</span>
                <span className="inline-flex lg:hidden">Search...</span>
                <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </Button>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput
                    placeholder="Search tickets, users, departments..."
                    value={query}
                    onValueChange={setQuery}
                />
                <CommandList>
                    <CommandEmpty>
                        {isLoading ? "Searching..." : "No results found."}
                    </CommandEmpty>

                    {results.length > 0 && (
                        <CommandGroup heading="Results">
                            {results.map((result) => {
                                const Icon = getIcon(result.type);
                                return (
                                    <CommandItem
                                        key={`${result.type}-${result.id}`}
                                        onSelect={() => handleSelect(result)}
                                        className="flex items-center gap-3"
                                    >
                                        <Icon className="h-4 w-4 text-muted-foreground" />
                                        <div className="flex-1 truncate">
                                            <p className="text-sm font-medium truncate">{result.title}</p>
                                            <p className="text-xs text-muted-foreground">{result.subtitle}</p>
                                        </div>
                                        {result.status && (
                                            <Badge variant="outline" className="text-xs">
                                                {result.status}
                                            </Badge>
                                        )}
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    );
}
