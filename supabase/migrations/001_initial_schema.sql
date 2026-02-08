-- ===========================================
-- UTP-UCS Database Schema - SAFE VERSION
-- Handles existing objects gracefully
-- ===========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- DROP EXISTING CONSTRAINTS AND TRIGGERS (safe cleanup)
-- ===========================================
ALTER TABLE IF EXISTS profiles DROP CONSTRAINT IF EXISTS fk_profile_department;
DROP TRIGGER IF EXISTS trigger_generate_ticket_number ON tickets;
DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS trigger_departments_updated_at ON departments;
DROP TRIGGER IF EXISTS trigger_tickets_updated_at ON tickets;
DROP TRIGGER IF EXISTS trigger_knowledge_base_updated_at ON knowledge_base;
DROP TRIGGER IF EXISTS trigger_calculate_sla ON tickets;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- ===========================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ===========================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'support_agent', 'department_admin', 'super_admin')),
    phone TEXT,
    student_id TEXT,
    department_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- DEPARTMENTS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    email TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key after departments table exists
ALTER TABLE profiles ADD CONSTRAINT fk_profile_department 
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;

-- ===========================================
-- SUBCATEGORIES TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS subcategories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(department_id, name)
);

-- ===========================================
-- TICKETS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'pending', 'resolved', 'closed', 'escalated')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    sla_due_at TIMESTAMPTZ,
    first_response_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- MESSAGES TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    message_type TEXT NOT NULL DEFAULT 'user' CHECK (message_type IN ('user', 'ai', 'agent', 'system')),
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- ATTACHMENTS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- STAFF ASSIGNMENTS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS staff_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(staff_id, department_id)
);

-- ===========================================
-- TICKET LOGS TABLE (Audit Trail)
-- ===========================================
CREATE TABLE IF NOT EXISTS ticket_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- NOTIFICATIONS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- RATINGS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE UNIQUE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- KNOWLEDGE BASE TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS knowledge_base (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    tags TEXT[],
    is_published BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- INDEXES
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_department_id ON tickets(department_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_ticket_id ON messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_ticket_logs_ticket_id ON ticket_logs(ticket_id);
CREATE INDEX IF NOT EXISTS idx_staff_assignments_staff_id ON staff_assignments(staff_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_department_id ON knowledge_base(department_id);

-- ===========================================
-- FUNCTIONS
-- ===========================================

-- Function to generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
    new_number TEXT;
    year_suffix TEXT;
    seq_number INTEGER;
BEGIN
    year_suffix := TO_CHAR(NOW(), 'YY');
    SELECT COUNT(*) + 1 INTO seq_number FROM tickets WHERE created_at >= DATE_TRUNC('year', NOW());
    new_number := 'UTP-' || year_suffix || '-' || LPAD(seq_number::TEXT, 5, '0');
    NEW.ticket_number := new_number;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for ticket number generation
CREATE TRIGGER trigger_generate_ticket_number
    BEFORE INSERT ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION generate_ticket_number();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trigger_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_knowledge_base_updated_at BEFORE UPDATE ON knowledge_base FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to calculate SLA due date
CREATE OR REPLACE FUNCTION calculate_sla_due_at()
RETURNS TRIGGER AS $$
BEGIN
    CASE NEW.priority
        WHEN 'urgent' THEN NEW.sla_due_at := NOW() + INTERVAL '4 hours';
        WHEN 'high' THEN NEW.sla_due_at := NOW() + INTERVAL '8 hours';
        WHEN 'medium' THEN NEW.sla_due_at := NOW() + INTERVAL '24 hours';
        WHEN 'low' THEN NEW.sla_due_at := NOW() + INTERVAL '48 hours';
    END CASE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_sla
    BEFORE INSERT ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION calculate_sla_due_at();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, role, phone, student_id)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(NEW.raw_user_meta_data->>'student_id', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ===========================================
-- ROW LEVEL SECURITY POLICIES
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Staff can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admin can manage profiles" ON profiles;
DROP POLICY IF EXISTS "Anyone can view active departments" ON departments;
DROP POLICY IF EXISTS "Admins can manage departments" ON departments;
DROP POLICY IF EXISTS "Anyone can view active subcategories" ON subcategories;
DROP POLICY IF EXISTS "Admins can manage subcategories" ON subcategories;
DROP POLICY IF EXISTS "Users can view own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can create tickets" ON tickets;
DROP POLICY IF EXISTS "Staff can view assigned/department tickets" ON tickets;
DROP POLICY IF EXISTS "Staff can update tickets" ON tickets;
DROP POLICY IF EXISTS "Users can view messages on own tickets" ON messages;
DROP POLICY IF EXISTS "Users can send messages on own tickets" ON messages;
DROP POLICY IF EXISTS "Staff can view all messages" ON messages;
DROP POLICY IF EXISTS "Staff can send messages" ON messages;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can create rating for own tickets" ON ratings;
DROP POLICY IF EXISTS "Users can view own ratings" ON ratings;
DROP POLICY IF EXISTS "Staff can view all ratings" ON ratings;
DROP POLICY IF EXISTS "Anyone can view published articles" ON knowledge_base;
DROP POLICY IF EXISTS "Staff can manage knowledge base" ON knowledge_base;
DROP POLICY IF EXISTS "Users can view attachments on own tickets" ON attachments;
DROP POLICY IF EXISTS "Users can upload attachments to own tickets" ON attachments;
DROP POLICY IF EXISTS "Staff can view all attachments" ON attachments;
DROP POLICY IF EXISTS "Staff can view ticket logs" ON ticket_logs;
DROP POLICY IF EXISTS "Staff can view assignments" ON staff_assignments;
DROP POLICY IF EXISTS "Admins can manage assignments" ON staff_assignments;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Staff can view all profiles" ON profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('support_agent', 'department_admin', 'super_admin'))
);
CREATE POLICY "Super admin can manage profiles" ON profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- Departments policies
CREATE POLICY "Anyone can view active departments" ON departments FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage departments" ON departments FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('department_admin', 'super_admin'))
);

-- Subcategories policies
CREATE POLICY "Anyone can view active subcategories" ON subcategories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage subcategories" ON subcategories FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('department_admin', 'super_admin'))
);

-- Tickets policies
CREATE POLICY "Users can view own tickets" ON tickets FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create tickets" ON tickets FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Staff can view assigned/department tickets" ON tickets FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles p
        LEFT JOIN staff_assignments sa ON p.id = sa.staff_id
        WHERE p.id = auth.uid() 
        AND p.role IN ('support_agent', 'department_admin', 'super_admin')
        AND (tickets.assigned_to = auth.uid() OR sa.department_id = tickets.department_id OR p.role = 'super_admin')
    )
);
CREATE POLICY "Staff can update tickets" ON tickets FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('support_agent', 'department_admin', 'super_admin'))
);

-- Messages policies
CREATE POLICY "Users can view messages on own tickets" ON messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM tickets WHERE tickets.id = messages.ticket_id AND tickets.user_id = auth.uid())
    AND is_internal = false
);
CREATE POLICY "Users can send messages on own tickets" ON messages FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM tickets WHERE tickets.id = messages.ticket_id AND tickets.user_id = auth.uid())
);
CREATE POLICY "Staff can view all messages" ON messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('support_agent', 'department_admin', 'super_admin'))
);
CREATE POLICY "Staff can send messages" ON messages FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('support_agent', 'department_admin', 'super_admin'))
);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (true);

-- Ratings policies
CREATE POLICY "Users can create rating for own tickets" ON ratings FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM tickets WHERE tickets.id = ratings.ticket_id AND tickets.user_id = auth.uid())
);
CREATE POLICY "Users can view own ratings" ON ratings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Staff can view all ratings" ON ratings FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('support_agent', 'department_admin', 'super_admin'))
);

-- Knowledge base policies
CREATE POLICY "Anyone can view published articles" ON knowledge_base FOR SELECT USING (is_published = true);
CREATE POLICY "Staff can manage knowledge base" ON knowledge_base FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('support_agent', 'department_admin', 'super_admin'))
);

-- Attachments policies
CREATE POLICY "Users can view attachments on own tickets" ON attachments FOR SELECT USING (
    EXISTS (SELECT 1 FROM tickets WHERE tickets.id = attachments.ticket_id AND tickets.user_id = auth.uid())
);
CREATE POLICY "Users can upload attachments to own tickets" ON attachments FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM tickets WHERE tickets.id = attachments.ticket_id AND tickets.user_id = auth.uid())
);
CREATE POLICY "Staff can view all attachments" ON attachments FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('support_agent', 'department_admin', 'super_admin'))
);

-- Ticket logs policies
CREATE POLICY "Staff can view ticket logs" ON ticket_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('support_agent', 'department_admin', 'super_admin'))
);

-- Staff assignments policies
CREATE POLICY "Staff can view assignments" ON staff_assignments FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('support_agent', 'department_admin', 'super_admin'))
);
CREATE POLICY "Admins can manage assignments" ON staff_assignments FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('department_admin', 'super_admin'))
);

-- ===========================================
-- SEED DATA - REAL UTP DEPARTMENTS
-- ===========================================
DELETE FROM subcategories;
DELETE FROM departments;

INSERT INTO departments (name, description, email) VALUES
    ('Residential Village (RV)', 'Room maintenance, hostel facilities, accommodation issues in V1-V6', 'rv@utp.edu.my'),
    ('Information Technology Services (ITS)', 'Network, WiFi, email, software, computer lab issues', 'its@utp.edu.my'),
    ('Academic Registry', 'Course registration, grades, transcripts, examinations', 'academic@utp.edu.my'),
    ('Student Affairs', 'Student ID, clubs, counseling, international students, scholarships', 'studentaffairs@utp.edu.my'),
    ('Finance Department', 'Fees, payments, refunds, financial aid', 'finance@utp.edu.my'),
    ('Information Resource Centre (Library)', 'Books, research resources, study rooms', 'library@utp.edu.my'),
    ('Health Centre', 'Medical services, clinic, health issues', 'healthcentre@utp.edu.my'),
    ('Security', 'Campus safety, lost & found, parking, emergencies', 'security@utp.edu.my'),
    ('Transportation', 'Campus buses, shuttle services', 'transport@utp.edu.my'),
    ('Facilities Management', 'Campus buildings, classrooms, common areas maintenance', 'facilities@utp.edu.my')
ON CONFLICT (name) DO NOTHING;

-- Seed subcategories for IT Services
INSERT INTO subcategories (department_id, name, description) 
SELECT d.id, s.name, s.description
FROM departments d
CROSS JOIN (VALUES 
    ('Network Issues', 'WiFi, LAN, and internet connectivity problems'),
    ('Email & Microsoft 365', 'Email access, Office 365, and Teams issues'),
    ('Student Portal', 'UTP Student Portal access and functionality'),
    ('Software Installation', 'Software licensing and installation requests'),
    ('Hardware Issues', 'Computer, printer, and peripheral problems'),
    ('Password Reset', 'Account password and access issues')
) AS s(name, description)
WHERE d.name = 'IT Services'
ON CONFLICT DO NOTHING;

-- Seed subcategories for Academic Office  
INSERT INTO subcategories (department_id, name, description)
SELECT d.id, s.name, s.description
FROM departments d
CROSS JOIN (VALUES
    ('Course Registration', 'Course add/drop and registration issues'),
    ('Transcript Request', 'Official transcript and academic records'),
    ('Examination', 'Exam schedules, results, and appeals'),
    ('Graduation', 'Graduation requirements and ceremonies'),
    ('Academic Appeal', 'Grade appeals and academic petitions')
) AS s(name, description)
WHERE d.name = 'Academic Office'
ON CONFLICT DO NOTHING;

-- Seed subcategories for Student Affairs
INSERT INTO subcategories (department_id, name, description)
SELECT d.id, s.name, s.description
FROM departments d
CROSS JOIN (VALUES
    ('Student ID', 'Student ID card issues and replacement'),
    ('Scholarship', 'Scholarship applications and inquiries'),
    ('Student Activities', 'Clubs, societies, and events'),
    ('Counseling', 'Personal counseling and support services'),
    ('Career Services', 'Career guidance and job placement')
) AS s(name, description)
WHERE d.name = 'Student Affairs'
ON CONFLICT DO NOTHING;

-- Seed subcategories for Finance
INSERT INTO subcategories (department_id, name, description)
SELECT d.id, s.name, s.description
FROM departments d
CROSS JOIN (VALUES
    ('Fee Payment', 'Tuition fees and payment issues'),
    ('Refund Request', 'Fee refund applications'),
    ('Financial Aid', 'Student loans and financial assistance'),
    ('Invoice Request', 'Tax invoices and payment receipts')
) AS s(name, description)
WHERE d.name = 'Finance'
ON CONFLICT DO NOTHING;
