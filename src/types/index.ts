// ========== Core Profile Types ==========
export interface Profile {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string | null;
    role: 'student' | 'support_agent' | 'department_admin' | 'super_admin';
    department_id: string | null;
    student_id: string | null;
    phone: string | null;
    created_at: string;
    updated_at: string;
}

export interface Department {
    id: string;
    name: string;
    description: string | null;
    email: string | null;
    icon: string | null;
    color: string | null;
    is_active: boolean;
    created_at: string;
}

// ========== Notification Types ==========
export interface Notification {
    id: string;
    user_id: string;
    title: string;
    content: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'ticket';
    is_read: boolean;
    link: string | null;
    created_at: string;
}

// ========== Subcategory Types ==========
export interface Subcategory {
    id: string;
    department_id: string;
    name: string;
    description: string | null;
    icon: string | null;
    is_active: boolean;
    created_at: string;
}

// ========== ChatMessage Types ==========
export interface ChatMessage {
    id?: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

// ========== Ticket System Types ==========
export interface Ticket {
    id: string;
    user_id: string;
    department_id: string | null;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'in_progress' | 'pending_user' | 'resolved' | 'closed';
    assigned_to: string | null;
    created_at: string;
    updated_at: string;
    resolved_at: string | null;
}

export interface Message {
    id: string;
    ticket_id: string;
    sender_id: string;
    content: string;
    is_internal: boolean;
    created_at: string;
}

// ========== Knowledge Base Types ==========
export interface KnowledgeBase {
    id: string;
    title: string;
    content: string;
    category: string | null;
    department_id: string | null;
    tags: string[] | null;
    is_published: boolean;
    view_count: number;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

// ========== UCampus Types ==========
export interface Semester {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
}

export interface Course {
    id: string;
    code: string;
    name: string;
    credits: number;
    department_id: string | null;
    description: string | null;
}

export interface Enrollment {
    id: string;
    student_id: string;
    course_id: string;
    semester_id: string;
    status: string;
    created_at: string;
}

export interface AcademicRecord {
    id: string;
    enrollment_id: string;
    grade: string | null;
    grade_point: number | null;
    credits_earned: number | null;
}

export interface AcademicSummary {
    id: string;
    student_id: string;
    semester_id: string;
    gpa: number;
    cgpa: number;
    credits_attempted: number;
    credits_earned: number;
}

// ========== USchedule Types ==========
export interface Room {
    id: string;
    name: string;
    building: string;
    capacity: number | null;
    room_type: string;
}

export interface ClassSession {
    id: string;
    course_id: string;
    room_id: string | null;
    lecturer_id: string | null;
    day_of_week: number;
    start_time: string;
    end_time: string;
    session_type: string;
}

// ========== ULibrary Types ==========
export interface Book {
    id: string;
    isbn: string | null;
    title: string;
    author: string;
    publisher: string | null;
    year_published: number | null;
    category: string | null;
    description: string | null;
    cover_image: string | null;
    total_copies: number;
    available_copies: number;
    location: string | null;
    is_ebook: boolean;
    ebook_url: string | null;
}

export interface BookLoan {
    id: string;
    book_id: string;
    user_id: string;
    borrowed_at: string;
    due_date: string;
    returned_at: string | null;
    renewed_count: number;
    status: string;
    fine_amount: number;
}

export interface BookReservation {
    id: string;
    book_id: string;
    user_id: string;
    reserved_at: string;
    expires_at: string;
    status: string;
}

// ========== UCareer Types ==========
export interface JobListing {
    id: string;
    title: string;
    company: string;
    description: string | null;
    requirements: string[] | null;
    job_type: string;
    location: string | null;
    salary_range: string | null;
    deadline: string | null;
    is_remote: boolean;
    is_featured: boolean;
    posted_at: string;
}

export interface JobApplication {
    id: string;
    job_id: string;
    user_id: string;
    resume_url: string | null;
    cover_letter: string | null;
    status: string;
    applied_at: string;
    reviewed_at: string | null;
}

export interface CareerEvent {
    id: string;
    title: string;
    description: string | null;
    event_type: string;
    location: string | null;
    start_datetime: string;
    end_datetime: string | null;
    registration_link: string | null;
    is_virtual: boolean;
}

// ========== UFinance Types ==========
export interface StudentAccount {
    id: string;
    user_id: string;
    balance: number;
    total_paid: number;
    total_fees: number;
    last_payment_at: string | null;
}

export interface Transaction {
    id: string;
    user_id: string;
    amount: number;
    type: string;
    description: string | null;
    reference_number: string | null;
    status: string;
    created_at: string;
}

export interface Scholarship {
    id: string;
    user_id: string;
    name: string;
    provider: string;
    amount: number;
    start_date: string;
    end_date: string | null;
    status: string;
}

// ========== UHealth Types ==========
export interface Doctor {
    id: string;
    name: string;
    department: string;
    specialization: string | null;
    is_available: boolean;
}

export interface HealthAppointment {
    id: string;
    user_id: string;
    doctor_id: string | null;
    doctor_name: string;
    department: string;
    appointment_date: string;
    appointment_time: string;
    reason: string | null;
    status: string;
    notes: string | null;
    created_at: string;
}

export interface HealthRecord {
    id: string;
    user_id: string;
    record_type: string;
    title: string;
    description: string | null;
    doctor_name: string | null;
    visit_date: string;
    attachments: string[] | null;
}

export interface Prescription {
    id: string;
    user_id: string;
    medication_name: string;
    dosage: string;
    frequency: string;
    start_date: string;
    end_date: string | null;
    doctor_name: string;
    instructions: string | null;
    status: string;
}

// ========== UEvent Types ==========
export interface Event {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    organizer: string | null;
    location: string | null;
    start_datetime: string;
    end_datetime: string | null;
    cover_image: string | null;
    capacity: number | null;
    registered_count: number;
    is_featured: boolean;
    registration_deadline: string | null;
}

export interface EventRegistration {
    id: string;
    event_id: string;
    user_id: string;
    ticket_number: string | null;
    qr_code: string | null;
    status: string;
    registered_at: string;
    checked_in_at: string | null;
}

// ========== UBooking Types ==========
export interface Facility {
    id: string;
    name: string;
    category: string;
    description: string | null;
    location: string | null;
    capacity: number | null;
    amenities: string[] | null;
    image_url: string | null;
    max_hours_per_booking: number;
    advance_booking_days: number;
}

export interface FacilityBooking {
    id: string;
    facility_id: string;
    user_id: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    purpose: string | null;
    status: string;
    created_at: string;
}

// ========== UFacility Types ==========
export interface MaintenanceRequest {
    id: string;
    user_id: string;
    category: string;
    building: string;
    room_location: string | null;
    description: string;
    priority: string;
    status: string;
    assigned_to: string | null;
    resolution_notes: string | null;
    created_at: string;
    resolved_at: string | null;
}

// ========== ULab Types ==========
export interface Lab {
    id: string;
    code: string;
    name: string;
    building: string | null;
    floor: string | null;
    room_number: string | null; // DB doesn't have this, maybe map 'code' or 'name', keeping for safety
    capacity: number | null;
    category: string | null;
    equipment: string[] | null;
    is_active: boolean; // DB has is_active
    is_available: boolean; // Keeping for UI compat
}

export interface LabSession {
    id: string;
    lab_id: string;
    course_id: string | null;
    title: string;
    session_date: string;
    start_time: string;
    end_time: string;
    is_open_for_booking: boolean;
}

export interface LabBooking {
    id: string;
    lab_id: string;
    student_id: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    purpose: string | null;
    status: string;
    created_at: string;
    lab?: Lab; // Optional relation
}

export interface SafetyModule {
    id: string;
    name: string;
    description: string | null;
    content_url: string | null;
    is_required: boolean;
}

export interface SafetyCompletion {
    id: string;
    user_id: string;
    module_id: string;
    completed_at: string;
    expires_at: string | null;
}

// ========== UPrint Types ==========
export interface PrintBalance {
    id: string;
    user_id: string;
    balance: number;
    last_topup_at: string | null;
    last_topup_amount: number | null;
}

export interface PrintJob {
    id: string;
    user_id: string;
    file_name: string;
    pages: number;
    copies: number;
    is_color: boolean;
    paper_size: string;
    is_double_sided: boolean;
    station_id: string | null;
    cost: number;
    status: string;
    created_at: string;
    printed_at: string | null;
}

export interface PrintStation {
    id: string;
    name: string;
    location: string;
    status: string;
    queue_count: number;
    has_color: boolean;
}

// ========== UPast Types ==========
export interface PastPaper {
    id: string;
    course_code: string;
    course_name: string;
    year: number;
    semester: string;
    exam_type: string;
    file_url: string | null;
    department: string | null;
    uploaded_at: string;
    download_count: number;
}

export interface PaperDownload {
    id: string;
    paper_id: string;
    user_id: string;
    downloaded_at: string;
}

export interface PaperBookmark {
    id: string;
    paper_id: string;
    user_id: string;
    created_at: string;
}

// ========== UNexus Types ==========
export interface Post {
    id: string;
    author_id: string;
    content: string;
    image_url: string | null;
    like_count: number;
    comment_count: number;
    visibility: string;
    created_at: string;
    updated_at: string;
}

export interface PostLike {
    id: string;
    post_id: string;
    user_id: string;
    created_at: string;
}

export interface PostComment {
    id: string;
    post_id: string;
    user_id: string;
    content: string;
    created_at: string;
}

export interface Connection {
    id: string;
    requester_id: string;
    addressee_id: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface SocialGroup {
    id: string;
    name: string;
    description: string | null;
    cover_image: string | null;
    privacy: string;
    member_count: number;
    created_by: string;
    created_at: string;
}

export interface GroupMember {
    id: string;
    group_id: string;
    user_id: string;
    role: string;
    joined_at: string;
}

// ========== Extended Types with Relations ==========
export interface TicketWithRelations extends Ticket {
    department: Department | null;
    user: Profile | null;
    assigned_agent: Profile | null;
    messages?: Message[];
}

export interface BookLoanWithBook extends BookLoan {
    book: Book;
}

export interface JobApplicationWithJob extends JobApplication {
    job: JobListing;
}

export interface EventRegistrationWithEvent extends EventRegistration {
    event: Event;
}

export interface PostWithAuthor extends Post {
    author: Profile;
    liked_by_user?: boolean;
}

export interface FacilityBookingWithFacility extends FacilityBooking {
    facility: Facility;
}

export interface PaperBookmarkWithPaper extends PaperBookmark {
    paper: PastPaper;
}
