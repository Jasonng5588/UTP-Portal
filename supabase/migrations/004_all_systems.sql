-- ===========================================
-- UTP SUPER PORTAL - EXTENDED SCHEMA
-- Phase 3: All Remaining UTP Systems
-- ===========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- ULIBRARY: LIBRARY MANAGEMENT
-- ===========================================

CREATE TABLE IF NOT EXISTS books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    isbn TEXT UNIQUE,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    publisher TEXT,
    year_published INTEGER,
    category TEXT,
    description TEXT,
    cover_image TEXT,
    total_copies INTEGER DEFAULT 1,
    available_copies INTEGER DEFAULT 1,
    location TEXT, -- Shelf location
    is_ebook BOOLEAN DEFAULT false,
    ebook_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS book_loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    borrowed_at TIMESTAMPTZ DEFAULT NOW(),
    due_date TIMESTAMPTZ NOT NULL,
    returned_at TIMESTAMPTZ,
    renewed_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'borrowed' CHECK (status IN ('borrowed', 'returned', 'overdue', 'lost')),
    fine_amount DECIMAL(10,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS book_reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reserved_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'ready', 'collected', 'expired', 'cancelled')),
    notified_at TIMESTAMPTZ
);

-- ===========================================
-- UCAREER: CAREER SERVICES
-- ===========================================

CREATE TABLE IF NOT EXISTS job_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT NOT NULL,
    company_logo TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    location TEXT,
    job_type TEXT DEFAULT 'full_time' CHECK (job_type IN ('full_time', 'part_time', 'internship', 'contract')),
    salary_min DECIMAL(12,2),
    salary_max DECIMAL(12,2),
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    deadline DATE,
    posted_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id)
);

CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES job_listings(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    resume_url TEXT,
    cover_letter TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'interview', 'offered', 'rejected', 'withdrawn')),
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(job_id, student_id)
);

CREATE TABLE IF NOT EXISTS career_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT DEFAULT 'workshop' CHECK (event_type IN ('career_fair', 'workshop', 'talk', 'networking', 'interview')),
    location TEXT,
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    capacity INTEGER,
    registered_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS career_event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES career_events(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    attended BOOLEAN DEFAULT false,
    UNIQUE(event_id, student_id)
);

-- ===========================================
-- UFINANCE: STUDENT FINANCES
-- ===========================================

CREATE TABLE IF NOT EXISTS student_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    balance DECIMAL(12,2) DEFAULT 0,
    total_fees DECIMAL(12,2) DEFAULT 0,
    total_paid DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('fee', 'payment', 'refund', 'scholarship', 'fine')),
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    reference_number TEXT,
    payment_method TEXT,
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scholarships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    provider TEXT,
    amount DECIMAL(12,2) NOT NULL,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'completed', 'terminated')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- UHEALTH: HEALTH SERVICES
-- ===========================================

CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    specialization TEXT,
    phone TEXT,
    email TEXT,
    photo_url TEXT,
    available_days TEXT[], -- ['Monday', 'Tuesday', ...]
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS health_appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    reason TEXT,
    notes TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS health_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    visit_date DATE NOT NULL,
    doctor_id UUID REFERENCES doctors(id),
    diagnosis TEXT,
    treatment TEXT,
    notes TEXT,
    followup_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    health_record_id UUID NOT NULL REFERENCES health_records(id) ON DELETE CASCADE,
    medication TEXT NOT NULL,
    dosage TEXT,
    frequency TEXT,
    duration TEXT,
    instructions TEXT,
    dispensed BOOLEAN DEFAULT false,
    dispensed_at TIMESTAMPTZ
);

-- ===========================================
-- UEVENT: CAMPUS EVENTS
-- ===========================================

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    organizer TEXT,
    location TEXT,
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ,
    cover_image TEXT,
    capacity INTEGER,
    registered_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    registration_deadline TIMESTAMPTZ,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    ticket_number TEXT UNIQUE,
    qr_code TEXT,
    status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    checked_in_at TIMESTAMPTZ,
    UNIQUE(event_id, student_id)
);

-- ===========================================
-- UBOOKING: FACILITY BOOKING
-- ===========================================

CREATE TABLE IF NOT EXISTS facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    location TEXT,
    capacity INTEGER,
    amenities TEXT[],
    image_url TEXT,
    booking_rules TEXT,
    max_hours_per_booking INTEGER DEFAULT 2,
    advance_booking_days INTEGER DEFAULT 7,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS facility_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    purpose TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(facility_id, booking_date, start_time)
);

-- ===========================================
-- UFACILITY: MAINTENANCE REQUESTS
-- ===========================================

CREATE TABLE IF NOT EXISTS maintenance_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    building TEXT NOT NULL,
    room_location TEXT,
    description TEXT NOT NULL,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    assigned_to TEXT,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- ===========================================
-- ULAB: LABORATORY SERVICES
-- ===========================================

CREATE TABLE IF NOT EXISTS labs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    building TEXT,
    floor TEXT,
    capacity INTEGER,
    category TEXT,
    equipment TEXT[],
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS lab_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lab_id UUID NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id),
    instructor_id UUID REFERENCES profiles(id),
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled'))
);

CREATE TABLE IF NOT EXISTS lab_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lab_id UUID NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    purpose TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS safety_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    content_url TEXT,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS safety_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES safety_modules(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    score INTEGER,
    UNIQUE(student_id, module_id)
);

-- ===========================================
-- UPRINT: PRINT SERVICES
-- ===========================================

CREATE TABLE IF NOT EXISTS print_balance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    balance DECIMAL(10,2) DEFAULT 0,
    last_topup_at TIMESTAMPTZ,
    last_topup_amount DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS print_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT,
    pages INTEGER NOT NULL,
    copies INTEGER DEFAULT 1,
    is_color BOOLEAN DEFAULT false,
    paper_size TEXT DEFAULT 'A4',
    is_double_sided BOOLEAN DEFAULT false,
    station_id TEXT,
    cost DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'printing', 'completed', 'failed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    printed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS print_stations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    status TEXT DEFAULT 'online' CHECK (status IN ('online', 'offline', 'maintenance')),
    queue_count INTEGER DEFAULT 0,
    has_color BOOLEAN DEFAULT false
);

-- ===========================================
-- UPAST: PAST YEAR PAPERS
-- ===========================================

CREATE TABLE IF NOT EXISTS past_papers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_code TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    year INTEGER NOT NULL,
    semester TEXT NOT NULL,
    exam_type TEXT DEFAULT 'final' CHECK (exam_type IN ('midterm', 'final', 'quiz', 'test')),
    file_url TEXT NOT NULL,
    download_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    uploaded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS paper_downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paper_id UUID NOT NULL REFERENCES past_papers(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS paper_bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paper_id UUID NOT NULL REFERENCES past_papers(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(paper_id, student_id)
);

-- ===========================================
-- UNEXUS: SOCIAL NETWORK
-- ===========================================

CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_urls TEXT[],
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS post_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS post_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    cover_image TEXT,
    members_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_book_loans_student ON book_loans(student_id);
CREATE INDEX IF NOT EXISTS idx_book_loans_book ON book_loans(book_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_student ON job_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_transactions_student ON transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_health_appointments_student ON health_appointments(student_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_student ON event_registrations(student_id);
CREATE INDEX IF NOT EXISTS idx_facility_bookings_student ON facility_bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_student ON maintenance_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_lab_bookings_student ON lab_bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_print_jobs_student ON print_jobs(student_id);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_connections_follower ON connections(follower_id);
CREATE INDEX IF NOT EXISTS idx_connections_following ON connections(following_id);

-- ===========================================
-- ROW LEVEL SECURITY
-- ===========================================

ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE print_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE print_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE print_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE past_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Anyone can view books" ON books FOR SELECT USING (true);
CREATE POLICY "Anyone can view active jobs" ON job_listings FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view career events" ON career_events FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view doctors" ON doctors FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view events" ON events FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view facilities" ON facilities FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view labs" ON labs FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view safety modules" ON safety_modules FOR SELECT USING (true);
CREATE POLICY "Anyone can view print stations" ON print_stations FOR SELECT USING (true);
CREATE POLICY "Anyone can view past papers" ON past_papers FOR SELECT USING (true);
CREATE POLICY "Anyone can view posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Anyone can view public groups" ON groups FOR SELECT USING (is_public = true);

-- Student own data policies
CREATE POLICY "Students view own loans" ON book_loans FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students manage own reservations" ON book_reservations FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Students view own applications" ON job_applications FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students create applications" ON job_applications FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students view own career registrations" ON career_event_registrations FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Students view own account" ON student_accounts FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students view own transactions" ON transactions FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students view own scholarships" ON scholarships FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students manage own appointments" ON health_appointments FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Students view own health records" ON health_records FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students view own prescriptions" ON prescriptions FOR SELECT USING (
    EXISTS (SELECT 1 FROM health_records hr WHERE hr.id = health_record_id AND hr.student_id = auth.uid())
);
CREATE POLICY "Students manage own event registrations" ON event_registrations FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Students manage own facility bookings" ON facility_bookings FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Students manage own maintenance requests" ON maintenance_requests FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Students manage own lab bookings" ON lab_bookings FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Students view own safety completions" ON safety_completions FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students insert safety completions" ON safety_completions FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students view own print balance" ON print_balance FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students manage own print jobs" ON print_jobs FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Students manage own downloads" ON paper_downloads FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Students manage own bookmarks" ON paper_bookmarks FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Users manage own posts" ON posts FOR ALL USING (auth.uid() = author_id);
CREATE POLICY "Users manage own likes" ON post_likes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own comments" ON post_comments FOR ALL USING (auth.uid() = author_id);
CREATE POLICY "Anyone can view comments" ON post_comments FOR SELECT USING (true);
CREATE POLICY "Users manage own connections" ON connections FOR ALL USING (auth.uid() = follower_id OR auth.uid() = following_id);
CREATE POLICY "Users manage own memberships" ON group_members FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view lab sessions" ON lab_sessions FOR SELECT USING (true);

-- ===========================================
-- SEED DATA
-- ===========================================

-- Sample Books
INSERT INTO books (isbn, title, author, publisher, year_published, category, total_copies, available_copies, location) VALUES
('978-0-13-468599-1', 'Clean Code', 'Robert C. Martin', 'Prentice Hall', 2008, 'Computer Science', 5, 3, 'CS-A-101'),
('978-0-596-51774-8', 'JavaScript: The Good Parts', 'Douglas Crockford', 'O''Reilly', 2008, 'Computer Science', 3, 2, 'CS-A-102'),
('978-0-13-235088-4', 'The Pragmatic Programmer', 'David Thomas', 'Pearson', 2019, 'Computer Science', 4, 4, 'CS-A-103'),
('978-0-262-03384-8', 'Introduction to Algorithms', 'Thomas H. Cormen', 'MIT Press', 2009, 'Computer Science', 6, 2, 'CS-B-101')
ON CONFLICT (isbn) DO NOTHING;

-- Sample Facilities
INSERT INTO facilities (name, category, description, location, capacity, amenities, max_hours_per_booking) VALUES
('Study Room A', 'Study Room', 'Quiet study room with whiteboard', 'Library Level 2', 6, ARRAY['Whiteboard', 'Power outlets', 'Wifi'], 3),
('Discussion Room 1', 'Discussion Room', 'Group discussion room', 'Library Level 3', 10, ARRAY['TV Screen', 'Whiteboard', 'Wifi'], 2),
('Badminton Court 1', 'Sports', 'Indoor badminton court', 'Sports Complex', 4, ARRAY['Lighting', 'Equipment rental'], 2),
('MPH', 'Hall', 'Multi-purpose hall for events', 'Chancellor Building', 500, ARRAY['Stage', 'Sound system', 'Projector'], 4)
ON CONFLICT DO NOTHING;

-- Sample Labs
INSERT INTO labs (code, name, building, floor, capacity, category, equipment) VALUES
('CL1', 'Computer Lab 1', 'Academic Block 1', 'Level 2', 40, 'Computer', ARRAY['Desktop PCs', 'Projector']),
('CL2', 'Computer Lab 2', 'Academic Block 1', 'Level 2', 40, 'Computer', ARRAY['Desktop PCs', 'Projector']),
('CHEM', 'Chemistry Lab', 'Academic Block 2', 'Level 1', 30, 'Science', ARRAY['Fume Hoods', 'Glassware']),
('ELEC', 'Electronics Lab', 'Academic Block 3', 'Level 2', 25, 'Engineering', ARRAY['Oscilloscopes', 'Soldering Stations'])
ON CONFLICT (code) DO NOTHING;

-- Sample Safety Modules
INSERT INTO safety_modules (name, description, is_required) VALUES
('General Lab Safety', 'Basic laboratory safety procedures and protocols', true),
('Chemical Handling', 'Safe handling of chemicals and hazardous materials', true),
('Fire Safety & Emergency', 'Fire prevention and emergency response procedures', true),
('Electrical Safety', 'Electrical safety guidelines for labs and workshops', true)
ON CONFLICT DO NOTHING;

-- Sample Print Stations
INSERT INTO print_stations (name, location, status, has_color) VALUES
('Library Print Station', 'Library Level 1', 'online', true),
('Academic Block 1', 'AB1 Level 2', 'online', true),
('V1 Print Kiosk', 'Village 1 Common Room', 'online', false),
('V5 Print Kiosk', 'Village 5 Common Room', 'online', false)
ON CONFLICT DO NOTHING;

-- Sample Past Papers
INSERT INTO past_papers (subject_code, subject_name, year, semester, exam_type, file_url, download_count, rating) VALUES
('MAT1013', 'Calculus I', 2024, 'September', 'final', '/papers/mat1013_sep24.pdf', 1250, 4.8),
('MAT1013', 'Calculus I', 2024, 'January', 'final', '/papers/mat1013_jan24.pdf', 980, 4.5),
('PHY1011', 'Physics I', 2024, 'September', 'final', '/papers/phy1011_sep24.pdf', 1100, 4.7),
('CHM2021', 'Organic Chemistry', 2024, 'September', 'final', '/papers/chm2021_sep24.pdf', 750, 4.3)
ON CONFLICT DO NOTHING;

-- Sample Doctors
INSERT INTO doctors (name, specialization, available_days, is_active) VALUES
('Dr. Ahmad Razak', 'General Practitioner', ARRAY['Monday', 'Wednesday', 'Friday'], true),
('Dr. Sarah Lim', 'General Practitioner', ARRAY['Tuesday', 'Thursday'], true),
('Dr. Siti Aminah', 'Psychiatrist', ARRAY['Monday', 'Thursday'], true)
ON CONFLICT DO NOTHING;
