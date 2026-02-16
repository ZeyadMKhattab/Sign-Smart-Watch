const express = require('express');
const router = express.Router();

// Mock database for coach sessions
let coachSessions = [];
let sessionIdCounter = 1;

// Book a coaching session
router.post('/book-session', async (req, res) => {
    try {
        const { coachId, coachName, sessionDate, sessionTime, duration, focusArea, notes, rate } = req.body;

        // Validate required fields
        if (!coachId || !sessionDate || !sessionTime || !duration) {
            return res.json({ success: false, message: 'Missing required fields' });
        }

        // Create new session
        const newSession = {
            id: sessionIdCounter++,
            coachId,
            coachName,
            sessionDate,
            sessionTime,
            duration,
            focusArea,
            notes,
            rate,
            status: 'confirmed',
            createdAt: new Date(),
            userId: req.user?.id || null // Will be set if user is authenticated
        };

        coachSessions.push(newSession);

        // TODO: Send confirmation email to user

        res.json({
            success: true,
            message: 'Session booked successfully',
            session: newSession
        });
    } catch (error) {
        console.error('Error booking session:', error);
        res.json({ success: false, message: 'Error booking session' });
    }
});

// Get user's upcoming sessions
router.get('/sessions', async (req, res) => {
    try {
        // Filter sessions for current user (if authenticated)
        // For now, return all sessions
        const upcomingSessions = coachSessions.filter(session => {
            const sessionDateTime = new Date(`${session.sessionDate}T${session.sessionTime}`);
            return sessionDateTime > new Date();
        }).sort((a, b) => {
            const dateA = new Date(`${a.sessionDate}T${a.sessionTime}`);
            const dateB = new Date(`${b.sessionDate}T${b.sessionTime}`);
            return dateA - dateB;
        });

        res.json({
            success: true,
            sessions: upcomingSessions
        });
    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.json({ success: false, message: 'Error fetching sessions', sessions: [] });
    }
});

// Get single coaching session details
router.get('/sessions/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = coachSessions.find(s => s.id === parseInt(sessionId));

        if (!session) {
            return res.json({ success: false, message: 'Session not found' });
        }

        res.json({ success: true, session });
    } catch (error) {
        console.error('Error fetching session:', error);
        res.json({ success: false, message: 'Error fetching session' });
    }
});

// Cancel a coaching session
router.delete('/sessions/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const sessionIndex = coachSessions.findIndex(s => s.id === parseInt(sessionId));

        if (sessionIndex === -1) {
            return res.json({ success: false, message: 'Session not found' });
        }

        coachSessions.splice(sessionIndex, 1);

        // TODO: Send cancellation email to user and coach

        res.json({ success: true, message: 'Session canceled successfully' });
    } catch (error) {
        console.error('Error canceling session:', error);
        res.json({ success: false, message: 'Error canceling session' });
    }
});

// Reschedule a coaching session
router.put('/sessions/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { newDate, newTime } = req.body;

        const session = coachSessions.find(s => s.id === parseInt(sessionId));

        if (!session) {
            return res.json({ success: false, message: 'Session not found' });
        }

        session.sessionDate = newDate;
        session.sessionTime = newTime;

        // TODO: Send reschedule notification email

        res.json({ success: true, message: 'Session rescheduled successfully', session });
    } catch (error) {
        console.error('Error rescheduling session:', error);
        res.json({ success: false, message: 'Error rescheduling session' });
    }
});

// Get available time slots for a coach
router.get('/coaches/:coachId/availability', async (req, res) => {
    try {
        const { coachId } = req.params;
        const { date } = req.query;

        // Mock available time slots - in production, fetch from a scheduling system
        const availableSlots = [
            '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'
        ];

        // Filter out booked slots
        const bookedSlots = coachSessions
            .filter(s => s.coachId === parseInt(coachId) && s.sessionDate === date)
            .map(s => s.sessionTime);

        const availableTime = availableSlots.filter(slot => !bookedSlots.includes(slot));

        res.json({ success: true, availableSlots: availableTime });
    } catch (error) {
        console.error('Error fetching availability:', error);
        res.json({ success: false, message: 'Error fetching availability', availableSlots: [] });
    }
});

module.exports = router;
