export const mockUser = {
  admin: { id: 1, name: 'Dr. Rajesh Kumar', email: 'admin@intelliattend.edu', role: 'admin', avatar: 'RK' },
  teacher: { id: 2, name: 'Prof. Ananya Sharma', email: 'teacher@intelliattend.edu', role: 'teacher', avatar: 'AS' },
  student: { id: 3, name: 'Arjun Mehta', email: 'student@intelliattend.edu', role: 'student', rollNumber: 'CS21B042', department: 'Computer Science', section: 'A', avatar: 'AM' },
}

export const mockStats = {
  totalStudents: 1248,
  totalFaculty: 87,
  activeSessions: 14,
  totalPenalties: 32,
}

export const mockWatchlist = [
  { id: 1, name: 'Rahul Verma', rollNumber: 'CS21B011', department: 'CSE', riskScore: 247, qrViolations: 8, networkViolations: 5, failedVerifications: 3, proxyAttempts: 2 },
  { id: 2, name: 'Priya Nair', rollNumber: 'EC21B034', department: 'ECE', riskScore: 183, qrViolations: 5, networkViolations: 4, failedVerifications: 2, proxyAttempts: 1 },
  { id: 3, name: 'Karan Singh', rollNumber: 'ME21B056', department: 'MECH', riskScore: 142, qrViolations: 4, networkViolations: 3, failedVerifications: 1, proxyAttempts: 2 },
  { id: 4, name: 'Sneha Patel', rollNumber: 'CS21B078', department: 'CSE', riskScore: 98, qrViolations: 3, networkViolations: 2, failedVerifications: 2, proxyAttempts: 0 },
  { id: 5, name: 'Amit Joshi', rollNumber: 'IT21B023', department: 'IT', riskScore: 76, qrViolations: 2, networkViolations: 2, failedVerifications: 1, proxyAttempts: 0 },
  { id: 6, name: 'Divya Reddy', rollNumber: 'CS21B091', department: 'CSE', riskScore: 54, qrViolations: 1, networkViolations: 2, failedVerifications: 1, proxyAttempts: 0 },
  { id: 7, name: 'Rohan Das', rollNumber: 'CE21B012', department: 'CIVIL', riskScore: 28, qrViolations: 0, networkViolations: 1, failedVerifications: 1, proxyAttempts: 0 },
]

export const mockActivity = [
  { id: 1, type: 'session_start', message: 'Session started for Data Structures – Section A', time: '10 min ago', user: 'Prof. Ananya Sharma' },
  { id: 2, type: 'attendance_verified', message: 'Attendance verified for Rahul Verma after failed QR scan', time: '18 min ago', user: 'System' },
  { id: 3, type: 'penalty_applied', message: 'Academic penalty applied to Karan Singh (Low Attendance)', time: '1 hr ago', user: 'Admin' },
  { id: 4, type: 'session_end', message: 'Session ended for Operating Systems – Section B', time: '2 hrs ago', user: 'Prof. Vikram Nair' },
  { id: 5, type: 'penalty_revoked', message: 'Penalty revoked for Sneha Patel (Documented Medical Leave)', time: '3 hrs ago', user: 'Admin' },
  { id: 6, type: 'risk_alert', message: 'Rahul Verma crossed CRITICAL risk threshold (247 pts)', time: '5 hrs ago', user: 'AI Engine' },
]

export const mockSessions = [
  { id: 1, subject: 'Data Structures', code: 'CS3201', faculty: 'Prof. Ananya Sharma', startTime: '2025-03-15T09:00:00', endTime: null, status: 'active', totalStudents: 62, present: 54, attendancePct: 87 },
  { id: 2, subject: 'Operating Systems', code: 'CS3202', faculty: 'Prof. Vikram Nair', startTime: '2025-03-15T08:00:00', endTime: '2025-03-15T09:00:00', status: 'ended', totalStudents: 58, present: 47, attendancePct: 81 },
  { id: 3, subject: 'Computer Networks', code: 'CS3203', faculty: 'Prof. Meera Iyer', startTime: '2025-03-14T10:00:00', endTime: '2025-03-14T11:00:00', status: 'ended', totalStudents: 60, present: 38, attendancePct: 63 },
  { id: 4, subject: 'DBMS', code: 'CS3204', faculty: 'Prof. Ravi Kumar', startTime: '2025-03-14T11:00:00', endTime: '2025-03-14T12:00:00', status: 'ended', totalStudents: 55, present: 50, attendancePct: 91 },
]

export const mockStudents = [
  { id: 1, name: 'Arjun Mehta', rollNumber: 'CS21B042', email: 'arjun@student.edu', department: 'CSE', section: 'A', year: 3, attendancePct: 82, riskScore: 12, status: 'active' },
  { id: 2, name: 'Rahul Verma', rollNumber: 'CS21B011', email: 'rahul@student.edu', department: 'CSE', section: 'A', year: 3, attendancePct: 55, riskScore: 247, status: 'active' },
  { id: 3, name: 'Priya Nair', rollNumber: 'EC21B034', email: 'priya@student.edu', department: 'ECE', section: 'B', year: 3, attendancePct: 60, riskScore: 183, status: 'active' },
  { id: 4, name: 'Karan Singh', rollNumber: 'ME21B056', email: 'karan@student.edu', department: 'MECH', section: 'A', year: 3, attendancePct: 63, riskScore: 142, status: 'active' },
  { id: 5, name: 'Sneha Patel', rollNumber: 'CS21B078', email: 'sneha@student.edu', department: 'CSE', section: 'B', year: 3, attendancePct: 71, riskScore: 98, status: 'active' },
]

export const mockPenalties = [
  { id: 1, student: 'Rahul Verma', rollNumber: 'CS21B011', reason: 'Attendance below 60% threshold', startDate: '2025-03-01', endDate: '2025-03-31', status: 'active' },
  { id: 2, student: 'Karan Singh', rollNumber: 'ME21B056', reason: 'Multiple proxy attendance attempts detected', startDate: '2025-03-05', endDate: '2025-03-20', status: 'active' },
  { id: 3, student: 'Priya Nair', rollNumber: 'EC21B034', reason: 'Attendance below 60% threshold', startDate: '2025-02-15', endDate: '2025-03-15', status: 'revoked' },
]

export const mockAttendanceTrend = [
  { month: 'Oct', rate: 88 }, { month: 'Nov', rate: 84 }, { month: 'Dec', rate: 76 },
  { month: 'Jan', rate: 82 }, { month: 'Feb', rate: 79 }, { month: 'Mar', rate: 85 },
]

export const mockRiskDistribution = [
  { name: 'Low', value: 892, color: '#10B981' },
  { name: 'Medium', value: 243, color: '#F59E0B' },
  { name: 'High', value: 87, color: '#F97316' },
  { name: 'Critical', value: 26, color: '#EF4444' },
]

export const mockRiskTrend = [
  { week: 'W1', score: 45 }, { week: 'W2', score: 68 }, { week: 'W3', score: 92 },
  { week: 'W4', score: 130 }, { week: 'W5', score: 175 }, { week: 'W6', score: 247 },
]

export const mockStudentAttendance = [
  { subject: 'Data Structures', code: 'CS3201', total: 30, present: 25, pct: 83 },
  { subject: 'Operating Systems', code: 'CS3202', total: 28, present: 21, pct: 75 },
  { subject: 'Computer Networks', code: 'CS3203', total: 25, present: 15, pct: 60 },
  { subject: 'DBMS', code: 'CS3204', total: 32, present: 28, pct: 87 },
  { subject: 'Software Engineering', code: 'CS3205', total: 20, present: 18, pct: 90 },
]

export const mockVerificationQueue = [
  { id: 1, student: 'Rahul Verma', rollNumber: 'CS21B011', reason: 'Network mismatch detected', riskScore: 247, time: '5 min ago' },
  { id: 2, student: 'Sneha Patel', rollNumber: 'CS21B078', reason: 'QR scan from outside campus', riskScore: 98, time: '8 min ago' },
  { id: 3, student: 'Amit Joshi', rollNumber: 'IT21B023', reason: 'Device fingerprint mismatch', riskScore: 76, time: '12 min ago' },
]

export const mockTeachers = [
  { id: 1, name: 'Prof. Ananya Sharma', email: 'ananya@faculty.edu', department: 'CSE', subjects: ['Data Structures', 'Algorithms'], sessions: 48, status: 'active' },
  { id: 2, name: 'Prof. Vikram Nair', email: 'vikram@faculty.edu', department: 'CSE', subjects: ['Operating Systems'], sessions: 42, status: 'active' },
  { id: 3, name: 'Prof. Meera Iyer', email: 'meera@faculty.edu', department: 'CSE', subjects: ['Computer Networks'], sessions: 35, status: 'active' },
  { id: 4, name: 'Prof. Ravi Kumar', email: 'ravi@faculty.edu', department: 'CSE', subjects: ['DBMS', 'Data Mining'], sessions: 50, status: 'active' },
]

export const mockSubjects = [
  { id: 1, name: 'Data Structures', code: 'CS3201', faculty: 'Prof. Ananya Sharma', department: 'CSE', credits: 4, students: 62, avgAttendance: 84 },
  { id: 2, name: 'Operating Systems', code: 'CS3202', faculty: 'Prof. Vikram Nair', department: 'CSE', credits: 4, students: 58, avgAttendance: 79 },
  { id: 3, name: 'Computer Networks', code: 'CS3203', faculty: 'Prof. Meera Iyer', department: 'CSE', credits: 3, students: 60, avgAttendance: 72 },
  { id: 4, name: 'DBMS', code: 'CS3204', faculty: 'Prof. Ravi Kumar', department: 'CSE', credits: 4, students: 55, avgAttendance: 88 },
]
