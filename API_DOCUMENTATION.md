# Medicare API - Complete Documentation

## Overview

Medicare API is a comprehensive healthcare management backend built with Node.js, TypeScript, Express, and PostgreSQL. It provides a complete ecosystem for connecting patients with doctors through appointments, prescriptions, reviews, and payment management.

**Version:** 1.0.0  
**Base URL:** `/api/v1`  
**Status:** Production Ready

---

## 🏥 Core Features

- **Authentication & Authorization** - Email/password, Google OAuth, JWT sessions
- **Doctor Management** - Comprehensive doctor profiles with specialties and ratings
- **Appointment Scheduling** - Book, manage, and track medical appointments
- **Doctor Schedules** - Flexible availability management for doctors
- **Prescriptions** - Digital prescription management with PDF generation
- **Reviews & Ratings** - Patient feedback system with aggregated ratings
- **Payment Integration** - Stripe integration for secure payments
- **Dashboard Analytics** - Real-time statistics and insights
- **Role-based Access Control** - Patient, Doctor, Admin, Super Admin roles

---

## 🔐 Authentication

### Register Patient
```
POST /api/v1/auth/register
```
Create a new patient account with email and password.

**Request Body:**
```json
{
  "email": "patient@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "role": "PATIENT"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "patient@example.com",
    "name": "John Doe",
    "role": "PATIENT"
  }
}
```

---

### Login User
```
POST /api/v1/auth/login
```
Authenticate user with email and password.

**Request Body:**
```json
{
  "email": "patient@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "id": "user_123",
      "email": "patient@example.com",
      "role": "PATIENT"
    }
  }
}
```

---

### Get Current User
```
GET /api/v1/auth/me
```
Retrieve authenticated user profile.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "patient@example.com",
    "role": "PATIENT",
    "createdAt": "2026-01-15T10:30:00Z"
  }
}
```

---

### Refresh Token
```
POST /api/v1/auth/refresh-token
```
Get a new JWT token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc..."
  }
}
```

---

### Change Password
```
POST /api/v1/auth/change-password
```
Update user password. **Requires Authentication**

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "oldPassword": "oldPassword123",
  "newPassword": "newPassword123"
}
```

**Response:** `200 OK`

---

### Logout
```
POST /api/v1/auth/logout
```
End user session. **Requires Authentication**

**Response:** `200 OK`

---

## 👨‍⚕️ Doctor Management

### Get All Doctors
```
GET /api/v1/doctors
```
List all doctors with optional filtering and pagination.

**Query Parameters:**
```
?specialization=Cardiology&rating=4&page=1&limit=10
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "doctors": [
      {
        "id": "doctor_123",
        "name": "Dr. Ahmed Khan",
        "specialization": "Cardiology",
        "qualification": "MBBS, MD",
        "experience": 10,
        "hourlyRate": 100,
        "rating": 4.8,
        "verified": true
      }
    ],
    "total": 150,
    "page": 1,
    "limit": 10
  }
}
```

---

### Get Doctor Details
```
GET /api/v1/doctors/:id
```
Retrieve specific doctor profile. **Requires Admin Authentication**

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "doctor_123",
    "name": "Dr. Ahmed Khan",
    "email": "doctor@example.com",
    "specialization": "Cardiology",
    "bio": "Experienced cardiologist...",
    "qualifications": ["MBBS", "MD"],
    "experience": 10,
    "hourlyRate": 100,
    "rating": 4.8,
    "totalReviews": 45,
    "verified": true,
    "createdAt": "2025-06-10T08:00:00Z"
  }
}
```

---

### Update Doctor
```
PATCH /api/v1/doctors/:id
```
Modify doctor information. **Requires Admin Authentication**

**Request Body:**
```json
{
  "hourlyRate": 120,
  "verified": true
}
```

**Response:** `200 OK`

---

### Delete Doctor
```
DELETE /api/v1/doctors/:id
```
Remove doctor from system. **Requires Admin Authentication**

**Response:** `200 OK`

---

### Create Doctor Account
```
POST /api/v1/users/create-doctor
```
Register new doctor account with credentials.

**Request Body:**
```json
{
  "name": "Dr. Sarah Johnson",
  "email": "doctor@example.com",
  "password": "securePassword123",
  "specialization": "Neurology",
  "qualifications": ["MBBS", "MD"],
  "experience": 8,
  "hourlyRate": 150,
  "bio": "Experienced neurologist..."
}
```

**Response:** `201 Created`

---

## 📅 Appointments

### Book Appointment
```
POST /api/v1/appointments/book-appointment
```
Create new appointment with immediate payment. **Requires Patient Authentication**

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "doctorId": "doctor_123",
  "scheduleId": "schedule_456",
  "appointmentDateTime": "2026-02-20T14:00:00Z",
  "reason": "Regular checkup"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "appointment_789",
    "doctorId": "doctor_123",
    "patientId": "patient_123",
    "status": "CONFIRMED",
    "appointmentDateTime": "2026-02-20T14:00:00Z",
    "paymentStatus": "PAID",
    "createdAt": "2026-02-15T10:00:00Z"
  }
}
```

---

### Book Appointment (Pay Later)
```
POST /api/v1/appointments/book-appointment-with-pay-later
```
Book appointment with deferred payment. **Requires Patient Authentication**

**Request Body:**
```json
{
  "doctorId": "doctor_123",
  "scheduleId": "schedule_456",
  "appointmentDateTime": "2026-02-20T14:00:00Z",
  "reason": "Consultation"
}
```

**Response:** `201 Created` - Same as above with `paymentStatus: PENDING`

---

### Get My Appointments
```
GET /api/v1/appointments/my-appointments
```
List authenticated user's appointments. **Requires Authentication**

**Query Parameters:**
```
?status=CONFIRMED&page=1&limit=10
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "appointments": [
      {
        "id": "appointment_789",
        "doctorName": "Dr. Ahmed Khan",
        "status": "CONFIRMED",
        "appointmentDateTime": "2026-02-20T14:00:00Z",
        "paymentStatus": "PAID"
      }
    ],
    "total": 5,
    "page": 1,
    "limit": 10
  }
}
```

---

### Get Appointment Details
```
GET /api/v1/appointments/my-single-appointment/:id
```
Retrieve specific appointment. **Requires Authentication**

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "appointment_789",
    "doctorId": "doctor_123",
    "doctorName": "Dr. Ahmed Khan",
    "patientId": "patient_123",
    "patientName": "John Doe",
    "status": "CONFIRMED",
    "reason": "Regular checkup",
    "appointmentDateTime": "2026-02-20T14:00:00Z",
    "paymentStatus": "PAID",
    "totalFee": 100,
    "createdAt": "2026-02-15T10:00:00Z"
  }
}
```

---

### Update Appointment Status
```
PATCH /api/v1/appointments/change-appointment-status/:id
```
Change appointment status. **Requires Authentication**

**Request Body:**
```json
{
  "status": "COMPLETED"
}
```

**Valid Statuses:** `PENDING`, `CONFIRMED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`

**Response:** `200 OK`

---

### Get All Appointments
```
GET /api/v1/appointments/all-appointments
```
List all appointments in system. **Requires Admin Authentication**

**Query Parameters:**
```
?status=CONFIRMED&doctorId=doctor_123&page=1&limit=20
```

**Response:** `200 OK`

---

## 🕐 Doctor Schedules

### Create Doctor Schedule
```
POST /api/v1/doctor-schedules/create-my-doctor-schedule
```
Add availability slots for doctor. **Requires Doctor Authentication**

**Request Body:**
```json
{
  "scheduleId": "schedule_456",
  "startDate": "2026-02-15",
  "endDate": "2026-02-28",
  "dayOfWeek": "MONDAY",
  "startTime": "09:00",
  "endTime": "17:00",
  "isAvailable": true
}
```

**Response:** `201 Created`

---

### Get My Doctor Schedules
```
GET /api/v1/doctor-schedules/my-doctor-schedules
```
List doctor's availability. **Requires Doctor Authentication**

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "schedules": [
      {
        "id": "doctor_schedule_123",
        "dayOfWeek": "MONDAY",
        "startTime": "09:00",
        "endTime": "17:00",
        "isAvailable": true
      }
    ]
  }
}
```

---

### Get All Doctor Schedules
```
GET /api/v1/doctor-schedules
```
List all doctor schedules. **Requires Admin Authentication**

**Response:** `200 OK`

---

### Get Doctor Schedule Details
```
GET /api/v1/doctor-schedules/:doctorId/schedule/:scheduleId
```
Retrieve specific doctor schedule.

**Response:** `200 OK`

---

### Update Doctor Schedule
```
PATCH /api/v1/doctor-schedules/update-my-doctor-schedule
```
Modify availability slots. **Requires Doctor Authentication**

**Request Body:**
```json
{
  "scheduleId": "schedule_456",
  "startTime": "08:00",
  "endTime": "18:00"
}
```

**Response:** `200 OK`

---

### Delete Doctor Schedule
```
DELETE /api/v1/doctor-schedules/delete-my-doctor-schedule/:id
```
Remove availability slot. **Requires Doctor Authentication**

**Response:** `200 OK`

---

## 💊 Prescriptions

### Get All Prescriptions
```
GET /api/v1/prescription
```
List all prescriptions in system. **Requires Admin Authentication**

**Query Parameters:**
```
?patientId=patient_123&doctorId=doctor_123&page=1&limit=20
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "prescriptions": [
      {
        "id": "prescription_789",
        "doctorName": "Dr. Ahmed Khan",
        "patientName": "John Doe",
        "medications": ["Aspirin 500mg", "Ibuprofen 200mg"],
        "issuedDate": "2026-02-15T10:00:00Z"
      }
    ],
    "total": 50
  }
}
```

---

### Get My Prescriptions
```
GET /api/v1/prescription/my-prescriptions
```
List user's prescriptions. **Requires Authentication**

**Response:** `200 OK`

---

### Issue Prescription
```
POST /api/v1/prescription
```
Doctor creates new prescription. **Requires Doctor Authentication**

**Request Body:**
```json
{
  "patientId": "patient_123",
  "appointmentId": "appointment_789",
  "medications": [
    {
      "name": "Aspirin",
      "dosage": "500mg",
      "frequency": "Twice daily",
      "duration": "7 days"
    }
  ],
  "instructions": "Take after meals",
  "followUpDate": "2026-02-28"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "prescription_789",
    "patientId": "patient_123",
    "doctorId": "doctor_123",
    "medications": [...],
    "issuedDate": "2026-02-15T10:00:00Z",
    "pdfUrl": "https://cdn.example.com/prescription_789.pdf"
  }
}
```

---

### Update Prescription
```
PATCH /api/v1/prescription/:id
```
Modify prescription details. **Requires Doctor Authentication**

**Request Body:**
```json
{
  "medications": [...],
  "instructions": "Updated instructions"
}
```

**Response:** `200 OK`

---

### Delete Prescription
```
DELETE /api/v1/prescription/:id
```
Remove prescription. **Requires Doctor Authentication**

**Response:** `200 OK`

---

## ⭐ Reviews

### Get All Reviews
```
GET /api/v1/review
```
List all doctor reviews.

**Query Parameters:**
```
?doctorId=doctor_123&rating=4&page=1&limit=10
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "review_123",
        "doctorName": "Dr. Ahmed Khan",
        "patientName": "John Doe",
        "rating": 5,
        "comment": "Excellent doctor, very professional",
        "createdAt": "2026-02-15T10:00:00Z"
      }
    ],
    "total": 45
  }
}
```

---

### Submit Review
```
POST /api/v1/review
```
Patient provides rating and feedback. **Requires Patient Authentication**

**Request Body:**
```json
{
  "doctorId": "doctor_123",
  "appointmentId": "appointment_789",
  "rating": 5,
  "comment": "Excellent doctor, very professional and caring"
}
```

**Response:** `201 Created`

---

### Get My Reviews
```
GET /api/v1/review/my-reviews
```
List user's given/received reviews. **Requires Authentication**

**Response:** `200 OK`

---

### Update Review
```
PATCH /api/v1/review/:id
```
Modify review content. **Requires Patient Authentication**

**Request Body:**
```json
{
  "rating": 4,
  "comment": "Updated comment"
}
```

**Response:** `200 OK`

---

### Delete Review
```
DELETE /api/v1/review/:id
```
Remove review. **Requires Patient Authentication**

**Response:** `200 OK`

---

## 🔧 Additional Endpoints

### Get All Specialties
```
GET /api/v1/specialties
```
List all medical specialties.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "specialties": [
      {
        "id": "specialty_1",
        "name": "Cardiology",
        "description": "Heart and cardiovascular diseases",
        "icon": "https://cdn.example.com/cardiology.png"
      }
    ]
  }
}
```

---

### Create Specialty
```
POST /api/v1/specialties
```
Add new medical specialty.

**Request Body:**
```json
{
  "name": "Dermatology",
  "description": "Skin diseases and treatments",
  "file": <binary_image_data>
}
```

**Response:** `201 Created`

---

### Update Specialty
```
PUT /api/v1/specialties/:id
```
Modify specialty information.

**Response:** `200 OK`

---

### Delete Specialty
```
DELETE /api/v1/specialties/:id
```
Remove specialty.

**Response:** `200 OK`

---

### Get Dashboard Statistics
```
GET /api/v1/stats
```
Get dashboard statistics. **Requires Authentication**

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalAppointments": 150,
    "completedAppointments": 120,
    "pendingAppointments": 20,
    "totalDoctors": 25,
    "totalPatients": 500,
    "totalRevenue": 15000,
    "monthlyData": [...]
  }
}
```

---

### Update Patient Profile
```
PATCH /api/v1/patients/update-my-profile
```
Patient updates their information. **Requires Patient Authentication**

**Request Body (multipart/form-data):**
```
- name: string
- email: string
- phone: string
- dateOfBirth: date
- bloodType: string
- profilePhoto: file
- medicalReports: file[] (max 5)
```

**Response:** `200 OK`

---

### Get All Admins
```
GET /api/v1/admin
```
List all administrators. **Requires Admin Authentication**

**Response:** `200 OK`

---

### Change User Status
```
PATCH /api/v1/admin/change-user-status
```
Activate/deactivate user. **Requires Admin Authentication**

**Request Body:**
```json
{
  "userId": "user_123",
  "status": "ACTIVE"
}
```

**Valid Statuses:** `ACTIVE`, `INACTIVE`, `BLOCKED`

**Response:** `200 OK`

---

### Change User Role
```
PATCH /api/v1/admin/change-user-role
```
Modify user role. **Requires Super Admin Authentication**

**Request Body:**
```json
{
  "userId": "user_123",
  "role": "DOCTOR"
}
```

**Valid Roles:** `PATIENT`, `DOCTOR`, `ADMIN`, `SUPER_ADMIN`

**Response:** `200 OK`

---

## 🛡 Error Handling

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation error",
  "errorDetails": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Common Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 500 | Internal Server Error | Server error |

---

## 🔐 Authentication Methods

### JWT Token Structure

Tokens are valid for specific durations:
- **Access Token:** 15 minutes
- **Refresh Token:** 30 days
- **Email Verification Token:** 24 hours
- **Password Reset Token:** 1 hour

### Using Tokens

Include in request headers:
```
Authorization: Bearer <accessToken>
```

---

## 📋 Role-Based Access Control

| Endpoint | PATIENT | DOCTOR | ADMIN | SUPER_ADMIN |
|----------|---------|--------|-------|-------------|
| Book Appointment | ✅ | ❌ | ❌ | ❌ |
| Create Schedule | ❌ | ✅ | ❌ | ❌ |
| Issue Prescription | ❌ | ✅ | ❌ | ❌ |
| Give Review | ✅ | ❌ | ❌ | ❌ |
| Manage Doctors | ❌ | ❌ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ✅ | ✅ |
| Change User Role | ❌ | ❌ | ❌ | ✅ |

---

## 🎯 Getting Started

### 1. Register Patient Account
```bash
POST /api/v1/auth/register
{
  "email": "patient@example.com",
  "password": "secure123",
  "name": "John Doe"
}
```

### 2. Login
```bash
POST /api/v1/auth/login
{
  "email": "patient@example.com",
  "password": "secure123"
}
```

### 3. Get Available Doctors
```bash
GET /api/v1/doctors
```

### 4. Get Doctor Schedules
```bash
GET /api/v1/doctor-schedules/:doctorId/schedule/:scheduleId
```

### 5. Book Appointment
```bash
POST /api/v1/appointments/book-appointment
{
  "doctorId": "doctor_123",
  "scheduleId": "schedule_456",
  "appointmentDateTime": "2026-02-20T14:00:00Z"
}
```

---

## 🛠 Technology Stack

- **Runtime:** Node.js 20
- **Language:** TypeScript
- **Framework:** Express 5
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** Better Auth, JWT
- **Payments:** Stripe
- **File Storage:** Cloudinary
- **Email:** Nodemailer
- **PDF Generation:** PDFKit
- **File Upload:** Multer
- **Validation:** Zod
- **Task Scheduling:** Node Cron

---

## 📧 Support

For API support and documentation updates, contact the development team.

---

**Last Updated:** February 2026  
**Status:** Production Ready
