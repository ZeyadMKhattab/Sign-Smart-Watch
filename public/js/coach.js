document.addEventListener('DOMContentLoaded', async () => {
    const coachesContainer = document.getElementById('coachesContainer');
    const bookingSection = document.getElementById('bookingSection');
    const coachBookingForm = document.getElementById('coachBookingForm');
    const cancelBooking = document.getElementById('cancelBooking');
    const upcomingSessions = document.getElementById('upcomingSessions');
    let selectedCoach = null;

    // Mock coaches data - in production, fetch from backend
    const mockCoaches = [
        {
            id: 1,
            name: 'Sarah Martinez',
            specialization: 'ASL Certified Instructor',
            experience: '8 years',
            rating: 4.9,
            reviews: 127,
            languages: ['ASL', 'English', 'Spanish'],
            availability: ['Mon', 'Wed', 'Fri', 'Sat'],
            hourlyRate: 25,
            bio: 'Certified ASL instructor with a passion for making sign language accessible to everyone.'
        },
        {
            id: 2,
            name: 'James Chen',
            specialization: 'ESL & Professional Communication',
            experience: '10 years',
            rating: 4.8,
            reviews: 95,
            languages: ['ASL', 'English', 'Mandarin'],
            availability: ['Tue', 'Thu', 'Sat', 'Sun'],
            hourlyRate: 25,
            bio: 'Expert in professional and workplace sign language communication.'
        },
        {
            id: 3,
            name: 'Emma Rodriguez',
            specialization: 'Medical Sign Language',
            experience: '12 years',
            rating: 5.0,
            reviews: 156,
            languages: ['ASL', 'English', 'Portuguese'],
            availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            hourlyRate: 30,
            bio: 'Specialized in healthcare and medical sign language terminology.'
        },
        {
            id: 4,
            name: 'Michael Johnson',
            specialization: 'Beginner & Intermediate',
            experience: '6 years',
            rating: 4.7,
            reviews: 82,
            languages: ['ASL', 'English'],
            availability: ['Tue', 'Wed', 'Thu', 'Sat', 'Sun'],
            hourlyRate: 20,
            bio: 'Patient and encouraging instructor perfect for beginners.'
        }
    ];

    // Load coaches
    function loadCoaches() {
        coachesContainer.innerHTML = '';
        mockCoaches.forEach(coach => {
            const coachCard = document.createElement('div');
            coachCard.className = 'coach-card';
            coachCard.innerHTML = `
                <div class="coach-header">
                    <div class="coach-avatar">${coach.name.split(' ').map(n => n[0]).join('')}</div>
                    <div class="coach-info">
                        <h3>${coach.name}</h3>
                        <p class="coach-specialization">${coach.specialization}</p>
                    </div>
                </div>
                <div class="coach-stats">
                    <span class="rating">⭐ ${coach.rating} (${coach.reviews})</span>
                    <span class="rate">$${coach.hourlyRate}/hr</span>
                </div>
                <div class="coach-details">
                    <p><strong>Experience:</strong> ${coach.experience}</p>
                    <p><strong>Languages:</strong> ${coach.languages.join(', ')}</p>
                    <p><strong>Availability:</strong> ${coach.availability.join(', ')}</p>
                    <p class="bio">${coach.bio}</p>
                </div>
                <button class="btn-primary book-coach-btn" data-coach-id="${coach.id}">Book Session</button>
            `;
            coachesContainer.appendChild(coachCard);
        });

        // Add event listeners to book buttons
        document.querySelectorAll('.book-coach-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const coachId = parseInt(e.target.dataset.coachId);
                selectedCoach = mockCoaches.find(c => c.id === coachId);
                showBookingForm();
            });
        });
    }

    // Show booking form
    function showBookingForm() {
        if (selectedCoach) {
            document.getElementById('coachName').value = `${selectedCoach.name} - $${selectedCoach.hourlyRate}/hr`;
            // Set minimum date to today
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('sessionDate').min = today;
            bookingSection.style.display = 'block';
            bookingSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Handle booking form submission
    coachBookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const bookingData = {
            coachId: selectedCoach.id,
            coachName: selectedCoach.name,
            sessionDate: document.getElementById('sessionDate').value,
            sessionTime: document.getElementById('sessionTime').value,
            duration: document.getElementById('sessionDuration').value,
            focusArea: document.getElementById('focusArea').value,
            notes: document.getElementById('notes').value,
            rate: selectedCoach.hourlyRate
        };

        try {
            const response = await fetch('/api/coach/book-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookingData)
            });

            const data = await response.json();

            if (data.success) {
                alert('Booking confirmed! You will receive a confirmation email shortly.');
                coachBookingForm.reset();
                bookingSection.style.display = 'none';
                loadUpcomingSessions();
            } else {
                alert(data.message || 'Failed to book session. Please try again.');
            }
        } catch (error) {
            console.error('Error booking session:', error);
            alert('Error booking session. Please try again.');
        }
    });

    // Cancel booking
    cancelBooking.addEventListener('click', () => {
        bookingSection.style.display = 'none';
        coachBookingForm.reset();
        selectedCoach = null;
    });

    // Load upcoming sessions
    async function loadUpcomingSessions() {
        try {
            const response = await fetch('/api/coach/sessions');
            const data = await response.json();

            if (data.success && data.sessions && data.sessions.length > 0) {
                upcomingSessions.innerHTML = data.sessions.map(session => `
                    <div class="session-card">
                        <div class="session-header">
                            <h3>${session.coachName}</h3>
                            <span class="session-status">${session.status}</span>
                        </div>
                        <div class="session-details">
                            <p><strong>Date:</strong> ${new Date(session.sessionDate).toLocaleDateString()}</p>
                            <p><strong>Time:</strong> ${session.sessionTime}</p>
                            <p><strong>Duration:</strong> ${session.duration} minutes</p>
                            <p><strong>Focus:</strong> ${session.focusArea}</p>
                            <p><strong>Rate:</strong> $${session.rate}/hr</p>
                        </div>
                        <div class="session-actions">
                            <button class="btn-secondary join-session-btn" data-session-id="${session.id}">Join Session</button>
                            <button class="btn-delete cancel-session-btn" data-session-id="${session.id}">Cancel</button>
                        </div>
                    </div>
                `).join('');

                // Add event listeners to join buttons
                document.querySelectorAll('.join-session-btn').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        const sessionId = e.target.dataset.sessionId;
                        window.location.href = `/coach/session/${sessionId}`;
                    });
                });

                // Add event listeners to cancel buttons
                document.querySelectorAll('.cancel-session-btn').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        const sessionId = e.target.dataset.sessionId;
                        if (confirm('Are you sure you want to cancel this session?')) {
                            try {
                                const cancelResponse = await fetch(`/api/coach/sessions/${sessionId}`, {
                                    method: 'DELETE'
                                });
                                const cancelData = await cancelResponse.json();
                                if (cancelData.success) {
                                    loadUpcomingSessions();
                                }
                            } catch (error) {
                                console.error('Error canceling session:', error);
                            }
                        }
                    });
                });
            } else {
                upcomingSessions.innerHTML = '<p class="empty-state">No upcoming sessions. Book your first session with a coach!</p>';
            }
        } catch (error) {
            console.error('Error loading sessions:', error);
        }
    }

    // Initialize
    loadCoaches();
    loadUpcomingSessions();
});
