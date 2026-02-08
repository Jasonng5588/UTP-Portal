// User Roles
export type UserRole = 'user' | 'support_agent' | 'department_admin' | 'super_admin'

// Ticket Status
export type TicketStatus = 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed' | 'escalated'

// Ticket Priority
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'

// Message Types
export type MessageType = 'user' | 'ai' | 'agent' | 'system'

// User Profile
export interface Profile {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    role: UserRole
    phone: string | null
    student_id: string | null
    department_id: string | null
    created_at: string
    updated_at: string
}

// Department
export interface Department {
    id: string
    name: string
    description: string | null
    email: string | null
    is_active: boolean
    created_at: string
    updated_at: string
}

// Subcategory
export interface Subcategory {
    id: string
    department_id: string
    name: string
    description: string | null
    is_active: boolean
    created_at: string
}

// Ticket
export interface Ticket {
    id: string
    ticket_number: string
    user_id: string
    department_id: string
    subcategory_id: string | null
    assigned_to: string | null
    title: string
    description: string
    status: TicketStatus
    priority: TicketPriority
    sla_due_at: string | null
    first_response_at: string | null
    resolved_at: string | null
    closed_at: string | null
    created_at: string
    updated_at: string
    // Relations
    user?: Profile
    department?: Department
    subcategory?: Subcategory
    assigned_agent?: Profile
    messages?: Message[]
    attachments?: Attachment[]
}

// Message
export interface Message {
    id: string
    ticket_id: string
    sender_id: string | null
    message_type: MessageType
    content: string
    is_internal: boolean
    created_at: string
    // Relations
    sender?: Profile
}

// Attachment
export interface Attachment {
    id: string
    ticket_id: string
    message_id: string | null
    file_name: string
    file_url: string
    file_type: string
    file_size: number
    uploaded_by: string
    created_at: string
}

// Staff Assignment
export interface StaffAssignment {
    id: string
    staff_id: string
    department_id: string
    is_primary: boolean
    created_at: string
    // Relations
    staff?: Profile
    department?: Department
}

// Ticket Log (Audit Trail)
export interface TicketLog {
    id: string
    ticket_id: string
    actor_id: string
    action: string
    details: Record<string, unknown>
    created_at: string
    // Relations
    actor?: Profile
}

// Notification
export interface Notification {
    id: string
    user_id: string
    title: string
    content: string
    type: string
    is_read: boolean
    link: string | null
    created_at: string
}

// Rating
export interface Rating {
    id: string
    ticket_id: string
    user_id: string
    rating: number
    feedback: string | null
    created_at: string
}

// Knowledge Base Article
export interface KnowledgeBase {
    id: string
    department_id: string | null
    author_id: string | null
    title: string
    content: string
    category: string | null
    tags: string[] | null
    is_published: boolean
    view_count: number
    created_at: string
    updated_at: string
    // Relations
    department?: Department
}

// Dashboard Stats
export interface DashboardStats {
    totalTickets: number
    openTickets: number
    resolvedToday: number
    avgResponseTime: number
    slaBreaches: number
}

// Chat Message for AI Chatbot
export interface ChatMessage {
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp?: Date
}
