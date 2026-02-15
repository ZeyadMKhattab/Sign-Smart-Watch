# Sign Smart Watch - Application Architecture

## 🎯 Project Overview

Sign Smart Watch is a comprehensive sign language learning application with the following key features:

### 🔓 Public Features (No Login Required)
- **Translator**: Convert English words to sign language gestures and vice versa
- Supports 15+ common words with gesture descriptions

### 🔐 Protected Features (Login Required)
- **Learning & Training**: Interactive gesture mastery tracking
- **Quiz System**: Test knowledge with scored quizzes
- **Progress Tracking**: Monitor learning streak, accuracy, and hours spent
- **Gesture Practice**: Track individual gesture practice sessions
- **Health Monitoring**: (Ready for smart jacket integration)

---

## 📁 Project Structure

```
Sign-Smart-Watch/
├── index.js                    # Main server file
├── database.js                 # SQLite database initialization
├── package.json                # Dependencies
├── .env                        # Environment variables
├── TODO.md                     # Project tasks
├── API_DOCUMENTATION.md        # Complete API reference
│
├── middleware/
│   └── auth.js                # JWT authentication middleware
│
├── routes/
│   ├── auth.js                # User registration & login
│   ├── translator.js          # PUBLIC: Word ↔ Gesture translation
│   ├── learning.js            # PROTECTED: Learning progress & gestures
│   └── health.js              # PROTECTED: Health metrics (future)
│
├── data/
│   └── app.db                 # SQLite database file (created on first run)
│
└── public/
    ├── index.html             # Frontend entry point
    ├── css/
    │   └── style.css
    ├── js/
    └── assets/
```

---

## 🗄️ Database Schema

### Tables Overview

**Users** - User accounts with authentication
- id, name, email, password (hashed), age, created_at, updated_at

**Learning Progress** - User's learning metrics
- gestures_mastered, quiz_accuracy, learning_streak, total_practice_hours, etc.

**Gesture Records** - Individual gesture practice tracking
- gesture_name, accuracy, practice_count, last_practiced, etc.

**Quiz Results** - Quiz performance history
- quiz_name, score, total_questions, completed_at

**Health Metrics** - Smart jacket data (scalable for future expansion)
- metric_type, metric_value, unit, recorded_at
- Supports: heart_rate, blood_pressure, temperature, step_count, etc.

---

## 🚀 API Quick Reference

### Public Endpoints (No Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/translator/word-to-gesture?word=hello` | Translate word to gesture |
| GET | `/api/translator/gesture-to-word?gesture=wave` | Translate gesture to word |
| GET | `/api/translator/all-translations` | Get all translations |

### Protected Endpoints (Requires JWT Token)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/learning/progress` | Get learning progress |
| PUT | `/api/learning/progress` | Update learning progress |
| GET | `/api/learning/gestures` | Get gesture practice records |
| POST | `/api/learning/gestures` | Record gesture practice |
| POST | `/api/learning/quiz` | Record quiz result |
| GET | `/api/learning/quiz-results` | Get all quiz results |
| POST | `/api/health/record-metric` | Record health metric |
| GET | `/api/health/metrics` | Get health metrics |
| GET | `/api/health/metrics-summary` | Get health statistics |
| DELETE | `/api/health/metrics/:id` | Delete health metric |

---

## 🔐 Authentication

### How It Works

1. **Signup**: User creates account with name, email, password, age
   - Password is hashed with bcryptjs
   - Returns JWT token for immediate access

2. **Login**: User provides email and password
   - Password is verified against hashed version
   - Returns JWT token valid for 7 days

3. **Protected Routes**: Include token in Authorization header
   ```
   Authorization: Bearer <your_token_here>
   ```

---

## 💾 Installation & Setup

### Prerequisites
- Node.js (v14+)
- npm

### Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment (`.env`):**
   ```
   JWT_SECRET=your-secret-key-change-in-production
   PORT=3000
   NODE_ENV=development
   ```

3. **Start server:**
   ```bash
   npm run dev    # Development mode with hot reload
   npm start      # Production mode
   ```

4. **Access the app:**
   - Frontend: `http://localhost:3000`
   - API Health Check: `http://localhost:3000/api/health-check`

---

## 🌱 Scalability Features

### Database Design
✅ **Extensible Schema**: Health metrics table supports unlimited metric types
✅ **Foreign Keys**: Proper data relationships with cascade delete
✅ **Prepared Statements**: SQL injection protection
✅ **Timestamps**: All records traceable to creation/update time

### Future Enhancements Ready
- Smart jacket health monitoring integration
- Additional gesture libraries
- Social features (compare progress with others)
- Advanced analytics and reporting
- Mobile app support
- Cloud database migration (easily switch from SQLite to MongoDB/PostgreSQL)

---

## 🧪 Testing the API

### Example: Test Translator (Public - No Auth)
```bash
curl "http://localhost:3000/api/translator/word-to-gesture?word=hello"
```

### Example: Test Learning (Protected - Requires Auth)
```bash
# 1. Login first to get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# 2. Use the token to access protected routes
curl http://localhost:3000/api/learning/progress \
  -H "Authorization: Bearer <token>"
```

---

## 📊 Key Features Explained

### ✨ Translator Feature
- **Public Access**: Anyone can use without login
- **Two-way Translation**: Word → Gesture and Gesture → Word
- **Extensive Dictionary**: 15+ gestures with descriptions
- **Real-time Response**: Instant translations

### 📚 Learning System
- **Progress Tracking**: Monitor mastery, accuracy, and practice hours
- **Gesture Practice**: Record individual gesture practice sessions
- **Quiz System**: Test knowledge and track accuracy
- **Learning Streak**: Motivate users with streak counting

### 💪 Health Monitoring (Ready for Integration)
- **Flexible Metrics**: Support for any health metric type
- **Time Series Data**: All metrics stamped with timestamps
- **Statistical Queries**: Get averages, min/max per metric type
- **Smart Jacket Ready**: Perfect for integrating wearable data

---

## 🔧 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET` | (required) | Secret key for JWT signing - CHANGE IN PRODUCTION |
| `PORT` | 3000 | Server port |
| `NODE_ENV` | development | Environment mode |

---

## ⚠️ Security Notes

- **Password Hashing**: All passwords are hashed with bcryptjs (10 salt rounds)
- **JWT Expiration**: Tokens expire after 7 days
- **SQL Injection Protection**: Uses parameterized queries
- **CORS**: Configure as needed for production deployment
- **Production Setup**:
  - Change JWT_SECRET to a strong random value
  - Use HTTPS
  - Add rate limiting
  - Set NODE_ENV=production

---

## 📝 License

ISC

---

## 🤝 Support

For API issues or questions, refer to [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed endpoint documentation.
