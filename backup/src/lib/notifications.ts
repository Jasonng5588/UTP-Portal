import { createClient } from "@/lib/supabase/server";

type NotificationType = "ticket_created" | "ticket_assigned" | "ticket_updated" | "message_received" | "sla_warning" | "sla_breached";

interface NotificationData {
    userId: string;
    type: NotificationType;
    title: string;
    content: string;
    link?: string;
}

export async function createNotification(data: NotificationData) {
    const supabase = await createClient();

    const { error } = await supabase.from("notifications").insert({
        user_id: data.userId,
        title: data.title,
        content: data.content,
        type: data.type,
        link: data.link || null,
        is_read: false,
    });

    if (error) {
        console.error("Failed to create notification:", error);
    }

    return !error;
}

export async function notifyTicketCreated(ticketId: string, ticketNumber: string, userId: string) {
    return createNotification({
        userId,
        type: "ticket_created",
        title: "Ticket Created",
        content: `Your support ticket #${ticketNumber} has been created and is being reviewed.`,
        link: `/student/reports/${ticketId}`,
    });
}

export async function notifyTicketAssigned(ticketId: string, ticketNumber: string, agentId: string) {
    return createNotification({
        userId: agentId,
        type: "ticket_assigned",
        title: "New Ticket Assigned",
        content: `You have been assigned to ticket #${ticketNumber}.`,
        link: `/admin/tickets/${ticketId}`,
    });
}

export async function notifyNewMessage(ticketId: string, ticketNumber: string, userId: string, isAgent: boolean) {
    return createNotification({
        userId,
        type: "message_received",
        title: "New Message",
        content: `You have a new message on ticket #${ticketNumber}.`,
        link: isAgent ? `/admin/tickets/${ticketId}` : `/student/reports/${ticketId}`,
    });
}

export async function notifySlaWarning(ticketId: string, ticketNumber: string, agentId: string) {
    return createNotification({
        userId: agentId,
        type: "sla_warning",
        title: "SLA Warning",
        content: `Ticket #${ticketNumber} is approaching its SLA deadline. Please respond soon.`,
        link: `/admin/tickets/${ticketId}`,
    });
}

export async function notifySlaBreached(ticketId: string, ticketNumber: string, agentId: string) {
    return createNotification({
        userId: agentId,
        type: "sla_breached",
        title: "SLA Breached",
        content: `Ticket #${ticketNumber} has exceeded its SLA deadline and requires immediate attention.`,
        link: `/admin/tickets/${ticketId}`,
    });
}
