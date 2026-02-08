-- =============================================
-- RLS Policy Updates for UTP System
-- Run this in Supabase SQL Editor
-- =============================================

-- ============ PROFILES ============
-- Allow users to read their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT TO authenticated
    USING (id = auth.uid());

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE TO authenticated
    USING (id = auth.uid());

-- Admin Access
DROP POLICY IF EXISTS "Admins have full access to profiles" ON profiles;
CREATE POLICY "Admins have full access to profiles" ON profiles
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('department_admin', 'super_admin')));

-- ============ BOOK LOANS ============
-- Allow users to view their own loans
DROP POLICY IF EXISTS "Users can view own book loans" ON book_loans;
CREATE POLICY "Users can view own book loans" ON book_loans
    FOR SELECT TO authenticated
    USING (student_id = auth.uid());

-- Allow users to create their own loans
DROP POLICY IF EXISTS "Users can create own book loans" ON book_loans;
CREATE POLICY "Users can create own book loans" ON book_loans
    FOR INSERT TO authenticated
    WITH CHECK (student_id = auth.uid());

-- Allow users to update their own loans (for returns)
DROP POLICY IF EXISTS "Users can update own book loans" ON book_loans;
CREATE POLICY "Users can update own book loans" ON book_loans
    FOR UPDATE TO authenticated
    USING (student_id = auth.uid());

-- Admin Access
DROP POLICY IF EXISTS "Admins have full access to book loans" ON book_loans;
CREATE POLICY "Admins have full access to book loans" ON book_loans
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('department_admin', 'super_admin')));

-- ============ BOOK RESERVATIONS ============
DROP POLICY IF EXISTS "Users can view own reservations" ON book_reservations;
CREATE POLICY "Users can view own reservations" ON book_reservations
    FOR SELECT TO authenticated
    USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Users can create reservations" ON book_reservations;
CREATE POLICY "Users can create reservations" ON book_reservations
    FOR INSERT TO authenticated
    WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Admins have full access to book reservations" ON book_reservations;
CREATE POLICY "Admins have full access to book reservations" ON book_reservations
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('department_admin', 'super_admin')));

-- ============ FACILITY BOOKINGS ============
DROP POLICY IF EXISTS "Users can view own facility bookings" ON facility_bookings;
CREATE POLICY "Users can view own facility bookings" ON facility_bookings
    FOR SELECT TO authenticated
    USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Users can create facility bookings" ON facility_bookings;
CREATE POLICY "Users can create facility bookings" ON facility_bookings
    FOR INSERT TO authenticated
    WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own facility bookings" ON facility_bookings;
CREATE POLICY "Users can update own facility bookings" ON facility_bookings
    FOR UPDATE TO authenticated
    USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Admins have full access to facility bookings" ON facility_bookings;
CREATE POLICY "Admins have full access to facility bookings" ON facility_bookings
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('department_admin', 'super_admin')));

-- ============ MAINTENANCE REQUESTS ============
DROP POLICY IF EXISTS "Users can view own maintenance requests" ON maintenance_requests;
CREATE POLICY "Users can view own maintenance requests" ON maintenance_requests
    FOR SELECT TO authenticated
    USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Users can create maintenance requests" ON maintenance_requests;
CREATE POLICY "Users can create maintenance requests" ON maintenance_requests
    FOR INSERT TO authenticated
    WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Admins have full access to maintenance requests" ON maintenance_requests;
CREATE POLICY "Admins have full access to maintenance requests" ON maintenance_requests
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('department_admin', 'super_admin')));

-- ============ PRINT JOBS ============
DROP POLICY IF EXISTS "Users can view own print jobs" ON print_jobs;
CREATE POLICY "Users can view own print jobs" ON print_jobs
    FOR SELECT TO authenticated
    USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Users can create print jobs" ON print_jobs;
CREATE POLICY "Users can create print jobs" ON print_jobs
    FOR INSERT TO authenticated
    WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Admins have full access to print jobs" ON print_jobs;
CREATE POLICY "Admins have full access to print jobs" ON print_jobs
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('department_admin', 'super_admin')));

-- ============ PRINT BALANCE ============
DROP POLICY IF EXISTS "Users can view own print balance" ON print_balance;
CREATE POLICY "Users can view own print balance" ON print_balance
    FOR SELECT TO authenticated
    USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own print balance" ON print_balance;
CREATE POLICY "Users can update own print balance" ON print_balance
    FOR UPDATE TO authenticated
    USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Admins have full access to print balance" ON print_balance;
CREATE POLICY "Admins have full access to print balance" ON print_balance
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('department_admin', 'super_admin')));

-- ============ HEALTH APPOINTMENTS ============
DROP POLICY IF EXISTS "Users can view own health appointments" ON health_appointments;
CREATE POLICY "Users can view own health appointments" ON health_appointments
    FOR SELECT TO authenticated
    USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Users can create health appointments" ON health_appointments;
CREATE POLICY "Users can create health appointments" ON health_appointments
    FOR INSERT TO authenticated
    WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own health appointments" ON health_appointments;
CREATE POLICY "Users can update own health appointments" ON health_appointments
    FOR UPDATE TO authenticated
    USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Admins have full access to health appointments" ON health_appointments;
CREATE POLICY "Admins have full access to health appointments" ON health_appointments
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('department_admin', 'super_admin')));

-- ============ HEALTH RECORDS ============
DROP POLICY IF EXISTS "Users can view own health records" ON health_records;
CREATE POLICY "Users can view own health records" ON health_records
    FOR SELECT TO authenticated
    USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Admins have full access to health records" ON health_records;
CREATE POLICY "Admins have full access to health records" ON health_records
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('department_admin', 'super_admin')));

-- ============ PRESCRIPTIONS ============
DROP POLICY IF EXISTS "Users can view own prescriptions" ON prescriptions;
CREATE POLICY "Users can view own prescriptions" ON prescriptions
    FOR SELECT TO authenticated
    USING (
        health_record_id IN (
            SELECT id FROM health_records WHERE student_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins have full access to prescriptions" ON prescriptions;
CREATE POLICY "Admins have full access to prescriptions" ON prescriptions
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('department_admin', 'super_admin')));

-- ============ EVENT REGISTRATIONS ============
DROP POLICY IF EXISTS "Users can view own event registrations" ON event_registrations;
CREATE POLICY "Users can view own event registrations" ON event_registrations
    FOR SELECT TO authenticated
    USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Users can create event registrations" ON event_registrations;
CREATE POLICY "Users can create event registrations" ON event_registrations
    FOR INSERT TO authenticated
    WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own event registrations" ON event_registrations;
CREATE POLICY "Users can delete own event registrations" ON event_registrations
    FOR DELETE TO authenticated
    USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Admins have full access to event registrations" ON event_registrations;
CREATE POLICY "Admins have full access to event registrations" ON event_registrations
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('department_admin', 'super_admin')));

-- ============ JOB APPLICATIONS ============
DROP POLICY IF EXISTS "Users can view own job applications" ON job_applications;
CREATE POLICY "Users can view own job applications" ON job_applications
    FOR SELECT TO authenticated
    USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Users can create job applications" ON job_applications;
CREATE POLICY "Users can create job applications" ON job_applications
    FOR INSERT TO authenticated
    WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Admins have full access to job applications" ON job_applications;
CREATE POLICY "Admins have full access to job applications" ON job_applications
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('department_admin', 'super_admin')));

-- ============ LAB BOOKINGS ============
DROP POLICY IF EXISTS "Users can view own lab bookings" ON lab_bookings;
CREATE POLICY "Users can view own lab bookings" ON lab_bookings
    FOR SELECT TO authenticated
    USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Users can create lab bookings" ON lab_bookings;
CREATE POLICY "Users can create lab bookings" ON lab_bookings
    FOR INSERT TO authenticated
    WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own lab bookings" ON lab_bookings;
CREATE POLICY "Users can update own lab bookings" ON lab_bookings
    FOR UPDATE TO authenticated
    USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Admins have full access to lab bookings" ON lab_bookings;
CREATE POLICY "Admins have full access to lab bookings" ON lab_bookings
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('department_admin', 'super_admin')));

-- ============ SAFETY COMPLETIONS ============
DROP POLICY IF EXISTS "Users can view own safety completions" ON safety_completions;
CREATE POLICY "Users can view own safety completions" ON safety_completions
    FOR SELECT TO authenticated
    USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Users can create safety completions" ON safety_completions;
CREATE POLICY "Users can create safety completions" ON safety_completions
    FOR INSERT TO authenticated
    WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Admins have full access to safety completions" ON safety_completions;
CREATE POLICY "Admins have full access to safety completions" ON safety_completions
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('department_admin', 'super_admin')));

-- ============ PAPER DOWNLOADS ============
DROP POLICY IF EXISTS "Users can view own paper downloads" ON paper_downloads;
CREATE POLICY "Users can view own paper downloads" ON paper_downloads
    FOR SELECT TO authenticated
    USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Users can create paper downloads" ON paper_downloads;
CREATE POLICY "Users can create paper downloads" ON paper_downloads
    FOR INSERT TO authenticated
    WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Admins have full access to paper downloads" ON paper_downloads;
CREATE POLICY "Admins have full access to paper downloads" ON paper_downloads
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('department_admin', 'super_admin')));

-- ============ PAPER BOOKMARKS ============
DROP POLICY IF EXISTS "Users can view own paper bookmarks" ON paper_bookmarks;
CREATE POLICY "Users can view own paper bookmarks" ON paper_bookmarks
    FOR SELECT TO authenticated
    USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Users can create paper bookmarks" ON paper_bookmarks;
CREATE POLICY "Users can create paper bookmarks" ON paper_bookmarks
    FOR INSERT TO authenticated
    WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own paper bookmarks" ON paper_bookmarks;
CREATE POLICY "Users can delete own paper bookmarks" ON paper_bookmarks
    FOR DELETE TO authenticated
    USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Admins have full access to paper bookmarks" ON paper_bookmarks;
CREATE POLICY "Admins have full access to paper bookmarks" ON paper_bookmarks
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('department_admin', 'super_admin')));

-- ============ POSTS (UNexus) ============
DROP POLICY IF EXISTS "Users can view all posts" ON posts;
CREATE POLICY "Users can view all posts" ON posts
    FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Users can create posts" ON posts;
CREATE POLICY "Users can create posts" ON posts
    FOR INSERT TO authenticated
    WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own posts" ON posts;
CREATE POLICY "Users can update own posts" ON posts
    FOR UPDATE TO authenticated
    USING (author_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own posts" ON posts;
CREATE POLICY "Users can delete own posts" ON posts
    FOR DELETE TO authenticated
    USING (author_id = auth.uid());

DROP POLICY IF EXISTS "Admins have full access to posts" ON posts;
CREATE POLICY "Admins have full access to posts" ON posts
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('department_admin', 'super_admin')));

-- ============ POST LIKES ============
DROP POLICY IF EXISTS "Users can view all likes" ON post_likes;
CREATE POLICY "Users can view all likes" ON post_likes
    FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Users can create likes" ON post_likes;
CREATE POLICY "Users can create likes" ON post_likes
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own likes" ON post_likes;
CREATE POLICY "Users can delete own likes" ON post_likes
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- ============ POST COMMENTS ============
DROP POLICY IF EXISTS "Users can view all comments" ON post_comments;
CREATE POLICY "Users can view all comments" ON post_comments
    FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Users can create comments" ON post_comments;
CREATE POLICY "Users can create comments" ON post_comments
    FOR INSERT TO authenticated
    WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "Admins have full access to comments" ON post_comments;
CREATE POLICY "Admins have full access to comments" ON post_comments
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('department_admin', 'super_admin')));

-- ============ CONNECTIONS ============
DROP POLICY IF EXISTS "Users can view own connections" ON connections;
CREATE POLICY "Users can view own connections" ON connections
    FOR SELECT TO authenticated
    USING (follower_id = auth.uid() OR following_id = auth.uid());

DROP POLICY IF EXISTS "Users can create connections" ON connections;
CREATE POLICY "Users can create connections" ON connections
    FOR INSERT TO authenticated
    WITH CHECK (follower_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own connections" ON connections;
CREATE POLICY "Users can delete own connections" ON connections
    FOR DELETE TO authenticated
    USING (follower_id = auth.uid());

-- ============ PUBLIC READ ACCESS & ADMIN WRITE ============
-- Allow reading of reference data, and admins to manage it

-- Books
DROP POLICY IF EXISTS "Anyone can view books" ON books;
CREATE POLICY "Anyone can view books" ON books FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins manage books" ON books;
CREATE POLICY "Admins manage books" ON books FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('department_admin', 'super_admin')));

-- Facilities
DROP POLICY IF EXISTS "Anyone can view facilities" ON facilities;
CREATE POLICY "Anyone can view facilities" ON facilities FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins manage facilities" ON facilities;
CREATE POLICY "Admins manage facilities" ON facilities FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('department_admin', 'super_admin')));

-- Events
DROP POLICY IF EXISTS "Anyone can view events" ON events;
CREATE POLICY "Anyone can view events" ON events FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins manage events" ON events;
CREATE POLICY "Admins manage events" ON events FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('department_admin', 'super_admin')));

-- Jobs
DROP POLICY IF EXISTS "Anyone can view job listings" ON job_listings;
CREATE POLICY "Anyone can view job listings" ON job_listings FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins manage job listings" ON job_listings;
CREATE POLICY "Admins manage job listings" ON job_listings FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('department_admin', 'super_admin')));

-- Doctors
DROP POLICY IF EXISTS "Anyone can view doctors" ON doctors;
CREATE POLICY "Anyone can view doctors" ON doctors FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins manage doctors" ON doctors;
CREATE POLICY "Admins manage doctors" ON doctors FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('department_admin', 'super_admin')));

-- Labs
DROP POLICY IF EXISTS "Anyone can view labs" ON labs;
CREATE POLICY "Anyone can view labs" ON labs FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins manage labs" ON labs;
CREATE POLICY "Admins manage labs" ON labs FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('department_admin', 'super_admin')));

-- Safety Modules
DROP POLICY IF EXISTS "Anyone can view safety modules" ON safety_modules;
CREATE POLICY "Anyone can view safety modules" ON safety_modules FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins manage safety modules" ON safety_modules;
CREATE POLICY "Admins manage safety modules" ON safety_modules FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('department_admin', 'super_admin')));

-- Past Papers
DROP POLICY IF EXISTS "Anyone can view past papers" ON past_papers;
CREATE POLICY "Anyone can view past papers" ON past_papers FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins manage past papers" ON past_papers;
CREATE POLICY "Admins manage past papers" ON past_papers FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('department_admin', 'super_admin')));

-- Print Stations
DROP POLICY IF EXISTS "Anyone can view print stations" ON print_stations;
CREATE POLICY "Anyone can view print stations" ON print_stations FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins manage print stations" ON print_stations;
CREATE POLICY "Admins manage print stations" ON print_stations FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('department_admin', 'super_admin')));

-- Courses
DROP POLICY IF EXISTS "Anyone can view courses" ON courses;
CREATE POLICY "Anyone can view courses" ON courses FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins manage courses" ON courses;
CREATE POLICY "Admins manage courses" ON courses FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('department_admin', 'super_admin')));

-- Semesters
DROP POLICY IF EXISTS "Anyone can view semesters" ON semesters;
CREATE POLICY "Anyone can view semesters" ON semesters FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins manage semesters" ON semesters;
CREATE POLICY "Admins manage semesters" ON semesters FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('department_admin', 'super_admin')));

-- ============ ENROLLMENTS ============
DROP POLICY IF EXISTS "Users can view own enrollments" ON enrollments;
CREATE POLICY "Users can view own enrollments" ON enrollments
    FOR SELECT TO authenticated
    USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Admins have full access to enrollments" ON enrollments;
CREATE POLICY "Admins have full access to enrollments" ON enrollments
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('department_admin', 'super_admin')));

-- ============ ACADEMIC RECORDS (Grades) ============
DROP POLICY IF EXISTS "Users can view own grades" ON academic_records;
CREATE POLICY "Users can view own grades" ON academic_records
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM enrollments e 
            WHERE e.id = academic_records.enrollment_id 
            AND e.student_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins have full access to grades" ON academic_records;
CREATE POLICY "Admins have full access to grades" ON academic_records
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('department_admin', 'super_admin')));

-- ============ STUDENT ACCOUNTS (UFinance) ============
DROP POLICY IF EXISTS "Users can view own student account" ON student_accounts;
CREATE POLICY "Users can view own student account" ON student_accounts
    FOR SELECT TO authenticated
    USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Admins have full access to student accounts" ON student_accounts;
CREATE POLICY "Admins have full access to student accounts" ON student_accounts
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('department_admin', 'super_admin')));

-- ============ TRANSACTIONS ============
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT TO authenticated
    USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Admins have full access to transactions" ON transactions;
CREATE POLICY "Admins have full access to transactions" ON transactions
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('department_admin', 'super_admin')));

-- ============ SCHOLARSHIPS ============
DROP POLICY IF EXISTS "Users can view own scholarships" ON scholarships;
CREATE POLICY "Users can view own scholarships" ON scholarships
    FOR SELECT TO authenticated
    USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Admins have full access to scholarships" ON scholarships;
CREATE POLICY "Admins have full access to scholarships" ON scholarships
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('department_admin', 'super_admin')));

-- Success message
SELECT 'All RLS policies have been updated successfully!' AS result;
