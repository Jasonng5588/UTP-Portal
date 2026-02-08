import { createClient } from "@/lib/supabase/server";

type AuditAction =
    | "ticket_created"
    | "ticket_updated"
    | "ticket_assigned"
    | "ticket_resolved"
    | "ticket_closed"
    | "ticket_escalated"
    | "message_sent"
    | "attachment_added"
    | "status_changed"
    | "priority_changed"
    | "sla_breached";

interface AuditLogData {
    ticketId: string;
    actorId: string;
    action: AuditAction;
    details?: Record<string, unknown>;
}

export async function createAuditLog(data: AuditLogData) {
    const supabase = await createClient();

    const { error } = await supabase.from("ticket_logs").insert({
        ticket_id: data.ticketId,
        actor_id: data.actorId,
        action: data.action,
        details: data.details || {},
    });

    if (error) {
        console.error("Failed to create audit log:", error);
    }

    return !error;
}

export async function logTicketCreated(ticketId: string, userId: string, ticketData: Record<string, unknown>) {
    return createAuditLog({
        ticketId,
        actorId: userId,
        action: "ticket_created",
        details: { initial_data: ticketData },
    });
}

export async function logStatusChange(ticketId: string, actorId: string, oldStatus: string, newStatus: string) {
    return createAuditLog({
        ticketId,
        actorId,
        action: "status_changed",
        details: { from: oldStatus, to: newStatus },
    });
}

export async function logPriorityChange(ticketId: string, actorId: string, oldPriority: string, newPriority: string) {
    return createAuditLog({
        ticketId,
        actorId,
        action: "priority_changed",
        details: { from: oldPriority, to: newPriority },
    });
}

export async function logTicketAssigned(ticketId: string, assignerId: string, assigneeId: string, assigneeName: string) {
    return createAuditLog({
        ticketId,
        actorId: assignerId,
        action: "ticket_assigned",
        details: { assigned_to: assigneeId, assigned_to_name: assigneeName },
    });
}

export async function logMessageSent(ticketId: string, senderId: string, messageType: string) {
    return createAuditLog({
        ticketId,
        actorId: senderId,
        action: "message_sent",
        details: { message_type: messageType },
    });
}

export async function logTicketResolved(ticketId: string, actorId: string, resolution?: string) {
    return createAuditLog({
        ticketId,
        actorId,
        action: "ticket_resolved",
        details: resolution ? { resolution } : {},
    });
}

export async function logTicketEscalated(ticketId: string, actorId: string, reason?: string) {
    return createAuditLog({
        ticketId,
        actorId,
        action: "ticket_escalated",
        details: reason ? { reason } : {},
    });
}

export async function logSlaBreach(ticketId: string, systemId: string = "system") {
    return createAuditLog({
        ticketId,
        actorId: systemId,
        action: "sla_breached",
        details: { breached_at: new Date().toISOString() },
    });
}
