import { createClient } from '@/lib/supabase/client'

// Generic API helper
const supabase = createClient()

// ============================================
// ULibrary API
// ============================================

export const libraryApi = {
    // Get all books
    async getBooks(search?: string, category?: string) {
        let query = supabase.from('books').select('*').order('title')
        if (search) {
            query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%,isbn.ilike.%${search}%`)
        }
        if (category && category !== 'all') {
            query = query.eq('category', category)
        }
        return query
    },

    // Get user's loans
    async getMyLoans(userId: string) {
        return supabase
            .from('book_loans')
            .select('*, book:books(*)')
            .eq('student_id', userId)
            .order('borrowed_at', { ascending: false })
    },

    // Borrow a book
    async borrowBook(bookId: string, userId: string, dueDate: string) {
        return supabase.from('book_loans').insert({
            book_id: bookId,
            student_id: userId,
            due_date: dueDate,
            status: 'borrowed'
        })
    },

    // Return a book
    async returnBook(loanId: string) {
        return supabase.from('book_loans').update({
            status: 'returned',
            returned_at: new Date().toISOString()
        }).eq('id', loanId)
    },

    // Renew loan
    async renewLoan(loanId: string, newDueDate: string) {
        return supabase.rpc('renew_loan', { loan_id: loanId, new_due_date: newDueDate })
    },

    // Reserve a book
    async reserveBook(bookId: string, userId: string) {
        return supabase.from('book_reservations').insert({
            book_id: bookId,
            student_id: userId,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
    }
}

// ============================================
// UCareer API
// ============================================

export const careerApi = {
    // Get job listings
    async getJobs(jobType?: string, search?: string) {
        let query = supabase.from('job_listings').select('*').eq('is_active', true).order('posted_at', { ascending: false })
        if (jobType && jobType !== 'all') {
            query = query.eq('job_type', jobType)
        }
        if (search) {
            query = query.or(`title.ilike.%${search}%,company_name.ilike.%${search}%`)
        }
        return query
    },

    // Get my applications
    async getMyApplications(userId: string) {
        return supabase
            .from('job_applications')
            .select('*, job:job_listings(*)')
            .eq('student_id', userId)
            .order('applied_at', { ascending: false })
    },

    // Apply for job
    async applyForJob(jobId: string, userId: string, resumeUrl?: string, coverLetter?: string) {
        return supabase.from('job_applications').insert({
            job_id: jobId,
            student_id: userId,
            resume_url: resumeUrl,
            cover_letter: coverLetter,
            status: 'pending'
        })
    },

    // Withdraw application
    async withdrawApplication(applicationId: string) {
        return supabase.from('job_applications').update({ status: 'withdrawn' }).eq('id', applicationId)
    },

    // Get career events
    async getCareerEvents() {
        return supabase.from('career_events').select('*').eq('is_active', true).order('event_date')
    }
}

// ============================================
// UFinance API
// ============================================

export const financeApi = {
    // Get student account
    async getAccount(userId: string) {
        return supabase.from('student_accounts').select('*').eq('student_id', userId).single()
    },

    // Get transactions
    async getTransactions(userId: string) {
        return supabase.from('transactions').select('*').eq('student_id', userId).order('created_at', { ascending: false })
    },

    // Get scholarships
    async getScholarships(userId: string) {
        return supabase.from('scholarships').select('*').eq('student_id', userId)
    },

    // Make payment
    async makePayment(userId: string, amount: number, description: string, paymentMethod: string) {
        return supabase.from('transactions').insert({
            student_id: userId,
            transaction_type: 'payment',
            amount: -amount, // Negative for payment
            description,
            payment_method: paymentMethod,
            status: 'completed'
        })
    }
}

// ============================================
// UHealth API
// ============================================

export const healthApi = {
    // Get doctors
    async getDoctors() {
        return supabase.from('doctors').select('*').eq('is_active', true)
    },

    // Get my appointments
    async getMyAppointments(userId: string) {
        return supabase
            .from('health_appointments')
            .select('*')
            .eq('student_id', userId)
            .order('appointment_date', { ascending: false })
    },

    // Book appointment
    async bookAppointment(userId: string, department: string, date: string, time: string, reason?: string) {
        return supabase.from('health_appointments').insert({
            student_id: userId,
            department,
            doctor_name: 'TBD',
            appointment_date: date,
            appointment_time: time,
            reason: reason || null,
            status: 'scheduled'
        })
    },

    // Cancel appointment
    async cancelAppointment(appointmentId: string) {
        return supabase.from('health_appointments').update({ status: 'cancelled' }).eq('id', appointmentId)
    },

    // Get my health records
    async getMyRecords(userId: string) {
        return supabase.from('health_records').select('*').eq('student_id', userId).order('visit_date', { ascending: false })
    },

    // Get my prescriptions
    async getMyPrescriptions(userId: string) {
        return supabase.from('prescriptions').select('*').eq('student_id', userId).order('start_date', { ascending: false })
    },

    // Get health records (legacy)
    async getHealthRecords(userId: string) {
        return supabase.from('health_records').select('*').eq('student_id', userId).order('visit_date', { ascending: false })
    }
}

// ============================================
// UEvent API
// ============================================

export const eventApi = {
    // Get events
    async getEvents(category?: string) {
        let query = supabase.from('events').select('*').eq('is_active', true).order('start_datetime')
        if (category && category !== 'all') {
            query = query.eq('category', category)
        }
        return query
    },

    // Get my registrations
    async getMyRegistrations(userId: string) {
        return supabase
            .from('event_registrations')
            .select('*, event:events(*)')
            .eq('student_id', userId)
            .order('registered_at', { ascending: false })
    },

    // Register for event
    async registerForEvent(eventId: string, userId: string) {
        const ticketNumber = `EVT-${Date.now().toString(36).toUpperCase()}`
        return supabase.from('event_registrations').insert({
            event_id: eventId,
            student_id: userId,
            ticket_number: ticketNumber,
            qr_code: ticketNumber
        })
    },

    // Cancel registration
    async cancelRegistration(registrationId: string) {
        return supabase.from('event_registrations').update({ status: 'cancelled' }).eq('id', registrationId)
    }
}

// ============================================
// UBooking API
// ============================================

export const bookingApi = {
    // Get facilities
    async getFacilities(category?: string) {
        let query = supabase.from('facilities').select('*').eq('is_active', true)
        if (category && category !== 'all') {
            query = query.eq('category', category)
        }
        return query
    },

    // Get my bookings  
    async getMyBookings(userId: string) {
        return supabase
            .from('facility_bookings')
            .select('*, facility:facilities(*)')
            .eq('student_id', userId)
            .order('booking_date', { ascending: false })
    },

    // Create booking
    async createBooking(facilityId: string, userId: string, date: string, startTime: string, endTime: string, purpose: string) {
        return supabase.from('facility_bookings').insert({
            facility_id: facilityId,
            student_id: userId,
            booking_date: date,
            start_time: startTime,
            end_time: endTime,
            purpose,
            status: 'confirmed'
        })
    },

    // Cancel booking
    async cancelBooking(bookingId: string) {
        return supabase.from('facility_bookings').update({ status: 'cancelled' }).eq('id', bookingId)
    }
}

// ============================================
// UFacility API
// ============================================

export const facilityApi = {
    // Get my maintenance requests
    async getMyRequests(userId: string) {
        return supabase.from('maintenance_requests').select('*').eq('student_id', userId).order('created_at', { ascending: false })
    },

    // Submit maintenance request
    async submitRequest(userId: string, category: string, building: string, roomLocation: string, description: string, priority: string) {
        return supabase.from('maintenance_requests').insert({
            student_id: userId,
            category,
            building,
            room_location: roomLocation,
            description,
            priority
        })
    }
}

// ============================================
// ULab API
// ============================================

export const labApi = {
    // Get labs
    async getLabs(category?: string) {
        let query = supabase.from('labs').select('*').eq('is_active', true)
        if (category && category !== 'all') {
            query = query.eq('category', category)
        }
        return query
    },

    // Get my lab bookings
    async getMyLabBookings(userId: string) {
        return supabase.from('lab_bookings').select('*, lab:labs(*)').eq('student_id', userId).order('booking_date', { ascending: false })
    },

    // Book lab
    async bookLab(labId: string, userId: string, date: string, startTime: string, endTime: string, purpose: string) {
        return supabase.from('lab_bookings').insert({
            lab_id: labId,
            student_id: userId,
            booking_date: date,
            start_time: startTime,
            end_time: endTime,
            purpose
        })
    },

    // Get safety modules
    async getSafetyModules() {
        return supabase.from('safety_modules').select('*')
    },

    // Get my safety completions
    async getMySafetyCompletions(userId: string) {
        return supabase.from('safety_completions').select('*, module:safety_modules(*)').eq('student_id', userId)
    },

    // Complete safety module
    async completeSafetyModule(userId: string, moduleId: string, score?: number) {
        return supabase.from('safety_completions').insert({
            student_id: userId,
            module_id: moduleId,
            score
        })
    }
}

// ============================================
// UPrint API
// ============================================

export const printApi = {
    // Get print balance
    async getBalance(userId: string) {
        return supabase.from('print_balance').select('*').eq('student_id', userId).single()
    },

    // Get print jobs
    async getMyPrintJobs(userId: string) {
        return supabase.from('print_jobs').select('*').eq('student_id', userId).order('created_at', { ascending: false })
    },

    // Get print stations
    async getPrintStations() {
        return supabase.from('print_stations').select('*')
    },

    // Submit print job
    async submitPrintJob(userId: string, fileName: string, pages: number, copies: number, isColor: boolean, paperSize: string, stationId: string, cost: number) {
        return supabase.from('print_jobs').insert({
            student_id: userId,
            file_name: fileName,
            pages,
            copies,
            is_color: isColor,
            paper_size: paperSize,
            station_id: stationId,
            cost
        })
    },

    // Cancel print job
    async cancelPrintJob(jobId: string) {
        return supabase.from('print_jobs').update({ status: 'cancelled' }).eq('id', jobId)
    },

    // Top up balance
    async topUpBalance(userId: string, amount: number) {
        // This would typically be handled by a payment gateway
        return supabase.from('print_balance').upsert({
            student_id: userId,
            balance: amount, // In real app, would add to existing
            last_topup_at: new Date().toISOString(),
            last_topup_amount: amount
        })
    }
}

// ============================================
// UPast API
// ============================================

export const pastApi = {
    // Get past papers
    async getPapers(subjectCode?: string, year?: number, semester?: string) {
        let query = supabase.from('past_papers').select('*').order('year', { ascending: false })
        if (subjectCode) {
            query = query.eq('subject_code', subjectCode)
        }
        if (year) {
            query = query.eq('year', year)
        }
        if (semester && semester !== 'all') {
            query = query.eq('semester', semester)
        }
        return query
    },

    // Get my downloads
    async getMyDownloads(userId: string) {
        return supabase.from('paper_downloads').select('*, paper:past_papers(*)').eq('student_id', userId).order('downloaded_at', { ascending: false })
    },

    // Record download
    async recordDownload(paperId: string) {
        // Just increments download count, no user tracking required
        return supabase.rpc('increment_download_count', { paper_id: paperId })
    },

    // Get bookmarks
    async getMyBookmarks(userId: string) {
        return supabase.from('paper_bookmarks').select('*, paper:past_papers(*)').eq('student_id', userId)
    },

    // Add bookmark
    async addBookmark(paperId: string, userId: string) {
        return supabase.from('paper_bookmarks').insert({
            paper_id: paperId,
            student_id: userId
        })
    },

    // Remove bookmark
    async removeBookmark(bookmarkId: string) {
        return supabase.from('paper_bookmarks').delete().eq('id', bookmarkId)
    }
}

// ============================================
// UNexus API
// ============================================

export const nexusApi = {
    // Get posts
    async getPosts(limit = 20) {
        return supabase
            .from('posts')
            .select('*, author:profiles(id, full_name, avatar_url)')
            .order('created_at', { ascending: false })
            .limit(limit)
    },

    // Create post
    async createPost(userId: string, content: string, imageUrls?: string[]) {
        return supabase.from('posts').insert({
            author_id: userId,
            content,
            image_urls: imageUrls
        })
    },

    // Like post
    async likePost(postId: string, userId: string) {
        return supabase.from('post_likes').insert({
            post_id: postId,
            user_id: userId
        })
    },

    // Unlike post
    async unlikePost(postId: string, userId: string) {
        return supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId)
    },

    // Get comments
    async getComments(postId: string) {
        return supabase
            .from('post_comments')
            .select('*, author:profiles(id, full_name, avatar_url)')
            .eq('post_id', postId)
            .order('created_at')
    },

    // Add comment
    async addComment(postId: string, userId: string, content: string) {
        return supabase.from('post_comments').insert({
            post_id: postId,
            author_id: userId,
            content
        })
    },

    // Get connections
    async getConnections(userId: string) {
        return supabase
            .from('connections')
            .select('*, follower:profiles!follower_id(*), following:profiles!following_id(*)')
            .or(`follower_id.eq.${userId},following_id.eq.${userId}`)
            .eq('status', 'accepted')
    },

    // Follow user
    async followUser(followerId: string, followingId: string) {
        return supabase.from('connections').insert({
            follower_id: followerId,
            following_id: followingId,
            status: 'accepted' // Auto-accept for now
        })
    },

    // Get groups
    async getGroups() {
        return supabase.from('groups').select('*').eq('is_public', true)
    },

    // Join group
    async joinGroup(groupId: string, userId: string) {
        return supabase.from('group_members').insert({
            group_id: groupId,
            user_id: userId
        })
    }
}
