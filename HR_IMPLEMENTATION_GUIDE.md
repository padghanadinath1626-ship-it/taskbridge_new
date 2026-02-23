# HR Role Implementation - Complete Setup Guide

## Overview
The HR role system has been successfully implemented for the TaskBridge application. HR users can:
- Manage employee and manager attendance records
- Review and approve/reject leave requests
- Calculate and manage employee salaries based on attendance
- Create and manage work rosters for team scheduling
- Send notices/emails to employees and managers
- Clock in and clock out like regular employees

## What Has Been Implemented

### Backend Changes

#### 1. **Role Type Extension**
- Added `HR` role to `RoleType.java` enum
- Location: `src/main/java/com/example/taskbridge/entity/RoleType.java`

#### 2. **New Database Entities**
Created four new JPA entities to support HR functionality:

- **Leave.java** - Leave/vacation requests
  - Fields: id, user, startDate, endDate, leaveType, reason, status, approverNotes, approvedBy, timestamps
  - LeaveStatus enum: PENDING, APPROVED, REJECTED
  - Leave Types: CASUAL, SICK, EARNED, MATERNITY, PATERNITY

- **Salary.java** - Salary records and calculations
  - Fields: id, user, year, month, baseSalary, totalWorkingDays, presentDays, absentDays, leaveDays, salaryPerDay, earnedSalary, deductions, netSalary, notes, timestamps
  - Tracks attendance-based salary calculations

- **Notice.java** - HR notices and communications
  - Fields: id, sender, recipient, subject, content, noticeType, status, readAt, acknowledgedAt, timestamps
  - NoticeType enum: GENERAL, ATTENDANCE, SALARY, CONDUCT, PERFORMANCE
  - NoticeStatus enum: SENT, READ, ACKNOWLEDGED

- **Roster.java** - Shift scheduling and rosters
  - Fields: id, user, shiftDate, shiftType, location, notes, createdBy, timestamps
  - Shift Types: MORNING, AFTERNOON, NIGHT, OFF

#### 3. **Repository Classes**
Created repositories for data access:
- `LeaveRepository.java` - Queries for leave records
- `SalaryRepository.java` - Queries for salary calculations
- `NoticeRepository.java` - Queries for notices
- `RosterRepository.java` - Queries for roster entries

#### 4. **Service Classes**
Implemented business logic in service layer:

- **LeaveService.java**
  - applyForLeave() - Employee/Manager submits leave request
  - approveLeave() - HR approves leave request
  - rejectLeave() - HR rejects leave request
  - getUserLeaves() - Get all leaves for a user
  - getPendingLeaves() - Get pending leaves for approval

- **SalaryService.java**
  - calculateAndCreateSalary() - Auto-calculates based on attendance
  - Formula: Daily Rate = Base Salary ÷ Total Days, Earned = Daily Rate × Present Days
  - getEmployeeSalaryRecords() - Get salary history
  - getSalaryForMonth() - Get specific month's salary
  - updateSalary() - Manual salary adjustments

- **RosterService.java**
  - createOrUpdateRosterEntry() - Add/update shift assignments
  - getUserRoster() - Get roster for an employee
  - getAllRosterInDateRange() - Get roster for period

- **NoticeService.java**
  - sendNotice() - Send notice to employee
  - getUserNotices() - Get notices received
  - markNoticeAsRead() - Mark notice as read
  - markNoticeAsAcknowledged() - Employee acknowledges notice

- **EmailService.java** (NEW)
  - sendNoticeEmail() - Email notifications for notices
  - sendAttendanceAlert() - Alert emails for attendance
  - sendLeaveDecisionEmail() - Leave approval/rejection emails
  - sendSalaryEmail() - Salary report emails
  - sendRosterEmail() - Roster assignment emails
  - Configured with Gmail SMTP (configurable in application.properties)

#### 5. **REST Controller**
- **HRController.java** at `/api/hr/**`
- Endpoints secured with `@PreAuthorize("hasRole('HR') or hasRole('ADMIN')")`
- Full CRUD operations for attendance, leaves, salary, roster, and notices
- Includes nested DTOs for request bodies

#### 6. **Configuration Updates**
- **pom.xml** - Added `spring-boot-starter-mail` dependency for email functionality
- **application.properties** - Added email configuration (SMTP settings placeholder)
  ```properties
  spring.mail.host=smtp.gmail.com
  spring.mail.port=587
  spring.mail.username=your-email@gmail.com
  spring.mail.password=your-app-password
  spring.mail.properties.mail.smtp.auth=true
  spring.mail.properties.mail.smtp.starttls.enable=true
  spring.mail.properties.mail.smtp.starttls.required=true
  ```

#### 7. **Security Configuration**
- SecurityConfig.java already has `@EnableMethodSecurity` enabled
- All endpoints properly protected with role checks
- HR endpoints accessible only by HR users (and ADMIN for oversight)

### Frontend Changes

#### 1. **API Service**
- **HRService.js** - Complete API client for HR operations
  - Methods for all attendance, leave, salary, roster, and notice operations
  - Properly configured with authentication tokens

- **UserService.js** - User management API client
  - getAllActiveUsers() - Fetch all active employees/managers
  - Integrates with Admin endpoints

#### 2. **Pages**
- **HRDashboard.jsx & HRDashboard.css** - Main HR dashboard
  - Tabbed interface for different HR functions
  - Professional styling and responsive design

#### 3. **HR Component Suite**
- **AttendancePanel.jsx** - Manage employee attendance
  - Select employee and date range
  - View clock-in/out times
  - Status visualization (PRESENT, ABSENT, ON_LEAVE)

- **LeavePanel.jsx** - Leave request management
  - View pending leave requests
  - Approve/reject with comments
  - Filter by employee

- **SalaryPanel.jsx** - Salary management and calculation
  - Calculate salary for employees (current month)
  - View salary history
  - Display breakdown: base, daily rate, present days, deductions, net salary
  - Manual salary adjustments

- **RosterPanel.jsx** - Shift and roster management
  - Create/update roster entries
  - Support for MORNING, AFTERNOON, NIGHT, OFF shifts
  - Assignment notes and location
  - Delete roster entries

- **NoticePanel.jsx** - Internal notice system
  - Send notices to employees/managers
  - Notice types: GENERAL, ATTENDANCE, SALARY, CONDUCT, PERFORMANCE
  - Track sent notices and their status
  - Email integration

- **HRComponents.css** - Comprehensive styling for all HR components
  - Responsive grid layouts
  - Color-coded status badges
  - Professional form styling
  - Mobile-friendly design

#### 4. **Navigation Updates**
- **Header.jsx** - Added HR navigation links
  - HR users see "HR Dashboard" link in navigation
  - Proper role-based menu display

#### 5. **Router Configuration**
- **App.jsx** - Added HR routes
  ```jsx
  <Route path="/hr-dashboard" element={
    <ProtectedRoute allowedRoles={["HR"]}>
      <HRDashboard />
    </ProtectedRoute>
  } />
  ```
- ProtectedRoute already handles role-based access control

## API Endpoints Summary

### Attendance Management
- `GET /api/hr/attendance/user/{userId}` - Get employee attendance
- `GET /api/hr/attendance/user/{userId}/range` - Get attendance in date range
- `GET /api/hr/attendance/range` - Get all attendance in date range

### Leave Management
- `GET /api/hr/leaves/pending` - Get all pending leaves
- `GET /api/hr/leaves/user/{userId}` - Get employee's leaves
- `POST /api/hr/leaves/{leaveId}/approve` - Approve leave
- `POST /api/hr/leaves/{leaveId}/reject` - Reject leave
- `GET /api/hr/leaves/range` - Get leaves in date range

### Salary Management
- `POST /api/hr/salary/calculate` - Calculate salary for a month
- `GET /api/hr/salary/user/{userId}` - Get salary records for employee
- `GET /api/hr/salary/user/{userId}/month` - Get specific month's salary
- `GET /api/hr/salary/month` - Get all salaries for a month
- `PUT /api/hr/salary/{salaryId}` - Update salary record

### Roster Management
- `POST /api/hr/roster` - Create/update roster entry
- `GET /api/hr/roster/user/{userId}` - Get user's roster
- `GET /api/hr/roster/user/{userId}/range` - Get roster in date range
- `GET /api/hr/roster/date` - Get roster for specific date
- `GET /api/hr/roster/range` - Get roster for date range
- `DELETE /api/hr/roster/{rosterId}` - Delete roster entry

### Notice Management
- `POST /api/hr/notice` - Send notice
- `GET /api/hr/notice/sent` - Get notices sent by HR

## Setup Instructions

### 1. Database Changes
- No manual migration needed if `spring.jpa.hibernate.ddl-auto=update`
- New tables will be created automatically:
  - `leave_request`
  - `salary`
  - `notice`
  - `roster`

### 2. Email Configuration
Edit `src/main/resources/application.properties`:
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

For Gmail:
1. Enable 2-Factor Authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the generated password in `spring.mail.password`

### 3. User Management
1. Create users as EMPLOYEE via registration
2. Admin can change role to HR via Admin Panel
3. HR users can access `/hr-dashboard`

### 4. Clock In/Clock Out
- HR users can use existing clock in/out endpoints
- They clock in/out like regular employees
- Location: HomePage -> Click "Clock In/Out" (if implemented) or via API

## Testing Checklist

- [ ] Login as HR user
- [ ] View HR Dashboard
- [ ] Select employee and view attendance records
- [ ] Approve/reject leave requests
- [ ] Calculate employee salary
- [ ] Create roster entries
- [ ] Send internal notices
- [ ] Verify email notifications (if configured)
- [ ] Check salary calculations are correct
- [ ] Test date range filters
- [ ] Verify role-based access control

## Frontend-Backend API Integration Notes

1. **AttendancePanel** calls `HRService.getEmployeeAttendance()` → Backend `/api/attendance/user/{userId}`
2. **LeavePanel** calls `HRService.approveLeave()` → Backend `/api/hr/leaves/{leaveId}/approve`
3. **SalaryPanel** calls `HRService.calculateSalary()` → Backend `/api/hr/salary/calculate`
4. **RosterPanel** calls `HRService.createRosterEntry()` → Backend `/api/hr/roster`
5. **NoticePanel** calls `HRService.sendNotice()` → Backend `/api/hr/notice`

All endpoints require JWT authentication token.

## Future Enhancements

1. **Email Templates** - Internationalization for email content
2. **Bulk Operations** - Import/export salary data, bulk roster updates
3. **Reports** - Monthly attendance reports, salary reports with charts
4. **Leave Balance Tracking** - Track leaves used vs. allocated
5. **Overtime Calculation** - Calculate overtime based on attendance
6. **Performance Integration** - Link notices to performance evaluations
7. **Approval Workflows** - Multi-level approval process
8. **Document Upload** - Attach documents to notices

## Known Limitations

1. Email is configured but requires SMTP setup
2. Salary calculation is simple (attendance-based), no bonuses/allowances
3. No recurring roster patterns
4. Leave balance not tracked (future enhancement)
5. No batch operations for salary calculation

## Support

For issues or questions:
1. Check role assignment in database: `SELECT * FROM app_user WHERE role='HR'`
2. Verify email configuration if notices don't arrive
3. Check application.properties for correct properties format
4. Ensure all new tables are created: `SELECT * FROM information_schema.tables`

---
**Implementation Date:** February 22, 2026
**Status:** Complete and Ready for Testing
