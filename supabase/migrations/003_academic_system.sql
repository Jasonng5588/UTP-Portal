-- ===========================================
-- UTP SUPER PORTAL - EXTENDED SCHEMA
-- Phase 2: UCampus, USchedule, ULearn
-- ===========================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- UCAMPUS: ACADEMIC RECORDS
-- ===========================================

-- Academic Semesters
CREATE TABLE IF NOT EXISTS semesters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL, -- e.g., "2024/2025-1"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    registration_start DATE,
    registration_end DATE,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Course Catalog
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL, -- e.g., "CSE101"
    name TEXT NOT NULL,
    description TEXT,
    credit_hours INTEGER NOT NULL DEFAULT 3,
    department_id UUID REFERENCES departments(id),
    prerequisites TEXT[], -- Array of course codes
    course_type TEXT DEFAULT 'core' CHECK (course_type IN ('core', 'elective', 'mpu', 'free')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student Enrollments
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    semester_id UUID NOT NULL REFERENCES semesters(id),
    section TEXT DEFAULT 'A',
    status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'withdrawn', 'completed', 'failed')),
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, course_id, semester_id)
);

-- Academic Grades/Results
CREATE TABLE IF NOT EXISTS academic_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE UNIQUE,
    midterm_score DECIMAL(5,2),
    final_score DECIMAL(5,2),
    assignment_score DECIMAL(5,2),
    total_score DECIMAL(5,2),
    grade TEXT, -- A, A-, B+, etc.
    grade_point DECIMAL(3,2), -- 4.00, 3.67, etc.
    is_published BOOLEAN DEFAULT false,
    graded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student Academic Summary (GPA per semester)
CREATE TABLE IF NOT EXISTS academic_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    semester_id UUID NOT NULL REFERENCES semesters(id),
    credits_attempted INTEGER DEFAULT 0,
    credits_earned INTEGER DEFAULT 0,
    gpa DECIMAL(4,2),
    cgpa DECIMAL(4,2),
    academic_status TEXT DEFAULT 'good' CHECK (academic_status IN ('good', 'probation', 'warning', 'dismissed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, semester_id)
);

-- ===========================================
-- USCHEDULE: TIMETABLE SYSTEM
-- ===========================================

-- Campus Rooms/Venues
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    building TEXT NOT NULL,
    room_number TEXT NOT NULL,
    name TEXT, -- e.g., "Lecture Hall 1"
    room_type TEXT DEFAULT 'classroom' CHECK (room_type IN ('classroom', 'lab', 'lecture_hall', 'tutorial_room', 'meeting_room', 'auditorium')),
    capacity INTEGER DEFAULT 30,
    floor INTEGER DEFAULT 1,
    facilities TEXT[], -- projector, whiteboard, computers, etc.
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(building, room_number)
);

-- Class Sessions (Timetable Entries)
CREATE TABLE IF NOT EXISTS class_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    semester_id UUID NOT NULL REFERENCES semesters(id),
    section TEXT DEFAULT 'A',
    lecturer_id UUID REFERENCES profiles(id),
    room_id UUID REFERENCES rooms(id),
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 1=Monday, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    session_type TEXT DEFAULT 'lecture' CHECK (session_type IN ('lecture', 'tutorial', 'lab', 'workshop')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student Personal Timetable (selected sections)
CREATE TABLE IF NOT EXISTS student_timetables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    class_session_id UUID NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
    semester_id UUID NOT NULL REFERENCES semesters(id),
    is_confirmed BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, class_session_id)
);

-- ===========================================
-- ULEARN: LEARNING MANAGEMENT SYSTEM
-- ===========================================

-- LMS Courses (linked to academic courses)
CREATE TABLE IF NOT EXISTS learning_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id),
    semester_id UUID REFERENCES semesters(id),
    title TEXT NOT NULL,
    description TEXT,
    instructor_id UUID REFERENCES profiles(id),
    cover_image TEXT,
    is_published BOOLEAN DEFAULT false,
    allow_self_enroll BOOLEAN DEFAULT false,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Course Modules/Sections
CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    learning_course_id UUID NOT NULL REFERENCES learning_courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    unlock_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons within Modules
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT, -- HTML/Markdown content
    content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'video', 'document', 'link', 'embed')),
    video_url TEXT,
    document_url TEXT,
    duration_minutes INTEGER,
    order_index INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student Lesson Progress
CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    progress_percent INTEGER DEFAULT 0,
    time_spent_seconds INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    UNIQUE(student_id, lesson_id)
);

-- Quizzes
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    learning_course_id UUID REFERENCES learning_courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    time_limit_minutes INTEGER,
    passing_score INTEGER DEFAULT 60,
    max_attempts INTEGER DEFAULT 1,
    shuffle_questions BOOLEAN DEFAULT true,
    show_answers_after BOOLEAN DEFAULT true,
    is_published BOOLEAN DEFAULT false,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz Questions
CREATE TABLE IF NOT EXISTS quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer', 'essay')),
    options JSONB, -- For multiple choice: [{id, text, is_correct}]
    correct_answer TEXT,
    points INTEGER DEFAULT 1,
    explanation TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz Attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    answers JSONB, -- {question_id: selected_answer}
    score INTEGER,
    max_score INTEGER,
    percentage DECIMAL(5,2),
    passed BOOLEAN,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    time_taken_seconds INTEGER
);

-- Assignments
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    learning_course_id UUID REFERENCES learning_courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    instructions TEXT,
    max_score INTEGER DEFAULT 100,
    due_date TIMESTAMPTZ,
    allow_late BOOLEAN DEFAULT false,
    late_penalty_percent INTEGER DEFAULT 10,
    submission_type TEXT DEFAULT 'file' CHECK (submission_type IN ('file', 'text', 'link', 'multiple')),
    allowed_file_types TEXT[],
    max_file_size_mb INTEGER DEFAULT 10,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignment Submissions
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT,
    file_urls TEXT[],
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    is_late BOOLEAN DEFAULT false,
    score INTEGER,
    feedback TEXT,
    graded_by UUID REFERENCES profiles(id),
    graded_at TIMESTAMPTZ,
    status TEXT DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'graded', 'returned'))
);

-- Discussion Forums
CREATE TABLE IF NOT EXISTS forums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    learning_course_id UUID NOT NULL REFERENCES learning_courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    is_locked BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forum Posts
CREATE TABLE IF NOT EXISTS forum_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    forum_id UUID NOT NULL REFERENCES forums(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE, -- For replies
    author_id UUID NOT NULL REFERENCES profiles(id),
    title TEXT,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT false,
    is_answered BOOLEAN DEFAULT false, -- For Q&A forums
    upvotes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Course Announcements
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    learning_course_id UUID NOT NULL REFERENCES learning_courses(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_semester ON enrollments(semester_id);
CREATE INDEX IF NOT EXISTS idx_academic_records_enrollment ON academic_records(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_course ON class_sessions(course_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_semester ON class_sessions(semester_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_day ON class_sessions(day_of_week);
CREATE INDEX IF NOT EXISTS idx_student_timetables_student ON student_timetables(student_id);
CREATE INDEX IF NOT EXISTS idx_learning_courses_instructor ON learning_courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_modules_course ON modules(learning_course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_student ON lesson_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_course ON quizzes(learning_course_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student ON quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_assignments_course ON assignments(learning_course_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_forum ON forum_posts(forum_id);

-- ===========================================
-- ROW LEVEL SECURITY
-- ===========================================

ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Public read access for course catalog and semesters
CREATE POLICY "Anyone can view semesters" ON semesters FOR SELECT USING (true);
CREATE POLICY "Anyone can view active courses" ON courses FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view rooms" ON rooms FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view class sessions" ON class_sessions FOR SELECT USING (is_active = true);

-- Students can view own data
CREATE POLICY "Students view own enrollments" ON enrollments FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students view own grades" ON academic_records FOR SELECT USING (
    EXISTS (SELECT 1 FROM enrollments e WHERE e.id = enrollment_id AND e.student_id = auth.uid())
);
CREATE POLICY "Students view own summaries" ON academic_summaries FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students view own timetable" ON student_timetables FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students manage own timetable" ON student_timetables FOR ALL USING (auth.uid() = student_id);

-- LMS Policies
CREATE POLICY "Anyone view published courses" ON learning_courses FOR SELECT USING (is_published = true);
CREATE POLICY "Anyone view published modules" ON modules FOR SELECT USING (is_published = true);
CREATE POLICY "Anyone view published lessons" ON lessons FOR SELECT USING (is_published = true);
CREATE POLICY "Students manage own progress" ON lesson_progress FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Anyone view published quizzes" ON quizzes FOR SELECT USING (is_published = true);
CREATE POLICY "Anyone view quiz questions" ON quiz_questions FOR SELECT USING (
    EXISTS (SELECT 1 FROM quizzes q WHERE q.id = quiz_id AND q.is_published = true)
);
CREATE POLICY "Students manage own attempts" ON quiz_attempts FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Anyone view published assignments" ON assignments FOR SELECT USING (is_published = true);
CREATE POLICY "Students manage own submissions" ON submissions FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Anyone view forums" ON forums FOR SELECT USING (true);
CREATE POLICY "Anyone view forum posts" ON forum_posts FOR SELECT USING (true);
CREATE POLICY "Users can post" ON forum_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can edit own posts" ON forum_posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Anyone view announcements" ON announcements FOR SELECT USING (true);

-- ===========================================
-- SEED DATA
-- ===========================================

-- Insert current semester
INSERT INTO semesters (name, code, start_date, end_date, is_current) VALUES
('Semester 1 2024/2025', '2024/2025-1', '2024-09-01', '2025-01-15', true),
('Semester 2 2024/2025', '2024/2025-2', '2025-02-01', '2025-06-15', false)
ON CONFLICT (code) DO NOTHING;

-- Sample Courses
INSERT INTO courses (code, name, description, credit_hours, course_type) VALUES
('CSC1101', 'Introduction to Programming', 'Fundamentals of programming using Python', 3, 'core'),
('CSC1102', 'Data Structures', 'Arrays, linked lists, trees, graphs, and algorithms', 3, 'core'),
('CSC2101', 'Database Systems', 'Relational databases, SQL, and database design', 3, 'core'),
('CSC2102', 'Web Development', 'Frontend and backend web development', 3, 'core'),
('CSC3101', 'Software Engineering', 'Software development methodologies and practices', 3, 'core'),
('CSC3102', 'Artificial Intelligence', 'Machine learning and AI fundamentals', 3, 'elective'),
('MTH1101', 'Calculus I', 'Limits, derivatives, and integrals', 4, 'core'),
('MTH1102', 'Linear Algebra', 'Vectors, matrices, and linear transformations', 3, 'core'),
('PHY1101', 'Physics I', 'Mechanics, waves, and thermodynamics', 4, 'core'),
('ENG1101', 'English for Communication', 'Academic writing and presentation skills', 2, 'mpu')
ON CONFLICT (code) DO NOTHING;

-- Sample Rooms
INSERT INTO rooms (building, room_number, name, room_type, capacity, facilities) VALUES
('Academic Block 1', '101', 'Lecture Hall 1', 'lecture_hall', 200, ARRAY['projector', 'microphone', 'air_conditioning']),
('Academic Block 1', '102', 'Lecture Hall 2', 'lecture_hall', 150, ARRAY['projector', 'microphone', 'air_conditioning']),
('Academic Block 2', '201', 'Tutorial Room 1', 'tutorial_room', 40, ARRAY['projector', 'whiteboard']),
('Academic Block 2', '202', 'Tutorial Room 2', 'tutorial_room', 40, ARRAY['projector', 'whiteboard']),
('IT Building', 'LAB1', 'Computer Lab 1', 'lab', 50, ARRAY['computers', 'projector', 'air_conditioning']),
('IT Building', 'LAB2', 'Computer Lab 2', 'lab', 50, ARRAY['computers', 'projector', 'air_conditioning']),
('Engineering Block', 'E101', 'Engineering Lab 1', 'lab', 30, ARRAY['equipment', 'projector']),
('Library', 'DR1', 'Discussion Room 1', 'meeting_room', 10, ARRAY['whiteboard', 'screen'])
ON CONFLICT (building, room_number) DO NOTHING;
