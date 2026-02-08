import { createClient } from "@/lib/supabase/server";
import type { Ticket } from "@/types";

interface AssignmentRule {
    departmentId: string;
    agentId: string;
    priority: number; // Lower = higher priority
    maxTickets: number;
}

// Auto-assign ticket based on department and agent workload
export async function autoAssignTicket(ticket: Ticket): Promise<string | null> {
    const supabase = await createClient();

    // Get all active agents assigned to the ticket's department
    const { data: assignments } = await supabase
        .from("staff_assignments")
        .select(`
      staff_id,
      is_primary,
      staff:profiles!inner(id, role)
    `)
        .eq("department_id", ticket.department_id)
        .eq("staff.role", "support_agent");

    if (!assignments || assignments.length === 0) {
        // No agents available, try department admins
        const { data: admins } = await supabase
            .from("profiles")
            .select("id")
            .eq("department_id", ticket.department_id)
            .eq("role", "department_admin")
            .limit(1);

        return admins?.[0]?.id || null;
    }

    // Get current ticket count for each agent
    const agentIds = assignments.map(a => a.staff_id);
    const { data: ticketCounts } = await supabase
        .from("tickets")
        .select("assigned_to")
        .in("assigned_to", agentIds)
        .in("status", ["open", "in_progress", "pending"]);

    // Count tickets per agent
    const countMap: Record<string, number> = {};
    ticketCounts?.forEach(t => {
        if (t.assigned_to) {
            countMap[t.assigned_to] = (countMap[t.assigned_to] || 0) + 1;
        }
    });

    // Sort agents: primary first, then by ticket count (ascending)
    const sortedAgents = assignments.sort((a, b) => {
        // Primary agents get priority
        if (a.is_primary !== b.is_primary) {
            return a.is_primary ? -1 : 1;
        }
        // Then by ticket count
        const countA = countMap[a.staff_id] || 0;
        const countB = countMap[b.staff_id] || 0;
        return countA - countB;
    });

    // Return agent with lowest workload
    return sortedAgents[0]?.staff_id || null;
}

// Round-robin assignment
let lastAssignedIndex = 0;
export async function roundRobinAssign(departmentId: string): Promise<string | null> {
    const supabase = await createClient();

    const { data: agents } = await supabase
        .from("staff_assignments")
        .select("staff_id")
        .eq("department_id", departmentId);

    if (!agents || agents.length === 0) return null;

    lastAssignedIndex = (lastAssignedIndex + 1) % agents.length;
    return agents[lastAssignedIndex].staff_id;
}

// Priority-based assignment (urgent tickets go to senior agents)
export async function priorityBasedAssign(ticket: Ticket): Promise<string | null> {
    const supabase = await createClient();

    if (ticket.priority === "urgent" || ticket.priority === "high") {
        // Assign to department admin for urgent tickets
        const { data: admins } = await supabase
            .from("profiles")
            .select("id")
            .eq("department_id", ticket.department_id)
            .eq("role", "department_admin")
            .limit(1);

        if (admins?.[0]) return admins[0].id;
    }

    // Fall back to regular auto-assignment
    return autoAssignTicket(ticket);
}
