package com.example.taskbridge.controller;

import java.math.BigDecimal;
import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.taskbridge.entity.Attendance;
import com.example.taskbridge.entity.Leave;
import com.example.taskbridge.entity.Notice;
import com.example.taskbridge.entity.Roster;
import com.example.taskbridge.entity.Salary;
import com.example.taskbridge.entity.User;
import com.example.taskbridge.exception.ResourceNotFoundException;
import com.example.taskbridge.repository.UserRepository;
import com.example.taskbridge.service.AttendanceService;
import com.example.taskbridge.service.LeaveService;
import com.example.taskbridge.service.NoticeService;
import com.example.taskbridge.service.RosterService;
import com.example.taskbridge.service.SalaryService;

@RestController
@RequestMapping("/api/hr")
@PreAuthorize("hasRole('HR') or hasRole('ADMIN')")
public class HRController {

    private final AttendanceService attendanceService;
    private final LeaveService leaveService;
    private final SalaryService salaryService;
    private final RosterService rosterService;
    private final NoticeService noticeService;
    private final UserRepository userRepository;

    public HRController(AttendanceService attendanceService, LeaveService leaveService, 
                      SalaryService salaryService, RosterService rosterService, 
                      NoticeService noticeService, UserRepository userRepository) {
        this.attendanceService = attendanceService;
        this.leaveService = leaveService;
        this.salaryService = salaryService;
        this.rosterService = rosterService;
        this.noticeService = noticeService;
        this.userRepository = userRepository;
    }

    // ========== USER MANAGEMENT (HR can see all employees/managers to manage) ==========

    // Get all active employees and managers (HR accessible endpoint)
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllActiveEmployees() {
        List<User> users = userRepository.findAll().stream()
                .filter(u -> u.isActive() && (u.getRole().name().equals("EMPLOYEE") || u.getRole().name().equals("MANAGER")))
                .toList();
        return ResponseEntity.ok(users);
    }

    // ========== ATTENDANCE MANAGEMENT ==========

    // Get attendance for a specific employee
    @GetMapping("/attendance/user/{userId}")
    public ResponseEntity<List<Attendance>> getEmployeeAttendance(@PathVariable Long userId) {
        List<Attendance> attendance = attendanceService.getUserAttendance(userId);
        return ResponseEntity.ok(attendance);
    }

    // Get attendance for a specific employee in date range
    @GetMapping("/attendance/user/{userId}/range")
    public ResponseEntity<List<Attendance>> getEmployeeAttendanceByDateRange(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<Attendance> attendance = attendanceService.getUserAttendanceByDateRange(userId, startDate, endDate);
        return ResponseEntity.ok(attendance);
    }

    // Get all attendance for a date range
    @GetMapping("/attendance/range")
    public ResponseEntity<List<Attendance>> getAllAttendanceByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<Attendance> attendance = attendanceService.getAllAttendanceByDateRange(startDate, endDate);
        return ResponseEntity.ok(attendance);
    }

    // ========== LEAVE MANAGEMENT ==========

    // Get all pending leaves
    @GetMapping("/leaves/pending")
    public ResponseEntity<List<Leave>> getAllPendingLeaves() {
        List<Leave> leaves = leaveService.getAllPendingLeaves();
        return ResponseEntity.ok(leaves);
    }

    // Get leaves for a specific employee
    @GetMapping("/leaves/user/{userId}")
    public ResponseEntity<List<Leave>> getEmployeeLeaves(@PathVariable Long userId) {
        List<Leave> leaves = leaveService.getUserLeaves(userId);
        return ResponseEntity.ok(leaves);
    }

    // Get pending leaves for a specific employee
    @GetMapping("/leaves/user/{userId}/pending")
    public ResponseEntity<List<Leave>> getEmployeePendingLeaves(@PathVariable Long userId) {
        List<Leave> leaves = leaveService.getPendingLeaves(userId);
        return ResponseEntity.ok(leaves);
    }

    // Apply for leave (accessible by employees)
    @PostMapping("/leaves/apply")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Leave> applyForLeave(
            @RequestBody ApplyLeaveRequest request) {
        Leave leave = leaveService.applyForLeave(
                request.getUserId(),
                request.getStartDate(),
                request.getEndDate(),
                request.getLeaveType(),
                request.getReason()
        );
        return ResponseEntity.ok(leave);
    }

    // Approve a leave request
    @PostMapping("/leaves/{leaveId}/approve")
    public ResponseEntity<Leave> approveLeave(
            @PathVariable Long leaveId,
            @RequestBody ApproveLeaveRequest request,
            Principal principal) {
        User approver = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Approver not found"));
        
        Leave leave = leaveService.approveLeave(leaveId, approver.getId(), request.getNotes());
        return ResponseEntity.ok(leave);
    }

    // Reject a leave request
    @PostMapping("/leaves/{leaveId}/reject")
    public ResponseEntity<Leave> rejectLeave(
            @PathVariable Long leaveId,
            @RequestBody ApproveLeaveRequest request,
            Principal principal) {
        User approver = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Approver not found"));
        
        Leave leave = leaveService.rejectLeave(leaveId, approver.getId(), request.getNotes());
        return ResponseEntity.ok(leave);
    }

    // Get leaves in date range
    @GetMapping("/leaves/range")
    public ResponseEntity<List<Leave>> getLeavesInDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<Leave> leaves = leaveService.getAllLeavesInDateRange(startDate, endDate);
        return ResponseEntity.ok(leaves);
    }

    // ========== SALARY MANAGEMENT ==========

    // Calculate salary for an employee for a specific month
    @PostMapping("/salary/calculate")
    public ResponseEntity<Salary> calculateSalary(@RequestBody CalculateSalaryRequest request) {
        Salary salary = salaryService.calculateAndCreateSalary(
                request.getUserId(), 
                request.getYear(), 
                request.getMonth(), 
                request.getBaseSalary()
        );
        return ResponseEntity.ok(salary);
    }

    // Get salary records for an employee
    @GetMapping("/salary/user/{userId}")
    public ResponseEntity<List<Salary>> getEmployeeSalaryRecords(@PathVariable Long userId) {
        List<Salary> salaries = salaryService.getUserSalaryRecords(userId);
        return ResponseEntity.ok(salaries);
    }

    // Get salary for a specific month
    @GetMapping("/salary/user/{userId}/month")
    public ResponseEntity<Salary> getSalaryForMonth(
            @PathVariable Long userId,
            @RequestParam Integer year,
            @RequestParam Integer month) {
        Salary salary = salaryService.getSalaryForMonth(userId, year, month);
        return ResponseEntity.ok(salary);
    }

    // Get all salaries for a month
    @GetMapping("/salary/month")
    public ResponseEntity<List<Salary>> getAllSalariesForMonth(
            @RequestParam Integer year,
            @RequestParam Integer month) {
        List<Salary> salaries = salaryService.getAllSalariesForMonth(year, month);
        return ResponseEntity.ok(salaries);
    }

    // Update salary record
    @PutMapping("/salary/{salaryId}")
    public ResponseEntity<Salary> updateSalary(
            @PathVariable Long salaryId,
            @RequestBody UpdateSalaryRequest request) {
        Salary salary = salaryService.updateSalary(salaryId, request.getNetSalary(), request.getNotes());
        return ResponseEntity.ok(salary);
    }

    // ========== ROSTER MANAGEMENT ==========

    // Create or update roster entry
    @PostMapping("/roster")
    public ResponseEntity<Roster> createRosterEntry(
            @RequestBody CreateRosterRequest request,
            Principal principal) {
        User createdBy = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Roster roster = rosterService.createOrUpdateRosterEntry(
                request.getUserId(),
                request.getShiftDate(),
                request.getShiftType(),
                request.getLocation(),
                request.getNotes(),
                createdBy.getId()
        );
        return ResponseEntity.ok(roster);
    }

    // Get roster for a user
    @GetMapping("/roster/user/{userId}")
    public ResponseEntity<List<Roster>> getUserRoster(@PathVariable Long userId) {
        List<Roster> roster = rosterService.getUserRoster(userId);
        return ResponseEntity.ok(roster);
    }

    // Get roster for a user in date range
    @GetMapping("/roster/user/{userId}/range")
    public ResponseEntity<List<Roster>> getUserRosterInDateRange(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<Roster> roster = rosterService.getUserRosterInDateRange(userId, startDate, endDate);
        return ResponseEntity.ok(roster);
    }

    // Get all roster entries for a date
    @GetMapping("/roster/date")
    public ResponseEntity<List<Roster>> getRosterForDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate shiftDate) {
        List<Roster> roster = rosterService.getRosterForDate(shiftDate);
        return ResponseEntity.ok(roster);
    }

    // Get all roster entries for a date range
    @GetMapping("/roster/range")
    public ResponseEntity<List<Roster>> getAllRosterInDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<Roster> roster = rosterService.getAllRosterInDateRange(startDate, endDate);
        return ResponseEntity.ok(roster);
    }

    // Delete roster entry
    @DeleteMapping("/roster/{rosterId}")
    public ResponseEntity<Void> deleteRosterEntry(@PathVariable Long rosterId) {
        rosterService.deleteRosterEntry(rosterId);
        return ResponseEntity.noContent().build();
    }

    // ========== NOTICE MANAGEMENT ==========

    // Send notice to an employee
    @PostMapping("/notice")
    public ResponseEntity<Notice> sendNotice(
            @RequestBody SendNoticeRequest request,
            Principal principal) {
        User sender = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));
        
        Notice notice = noticeService.sendNotice(
                sender.getId(),
                request.getRecipientId(),
                request.getSubject(),
                request.getContent(),
                Notice.NoticeType.valueOf(request.getNoticeType())
        );
        return ResponseEntity.ok(notice);
    }

    // Get notices sent by HR
    @GetMapping("/notice/sent")
    public ResponseEntity<List<Notice>> getNoticesSent(Principal principal) {
        User hr = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        List<Notice> notices = noticeService.getNoticesSentByHR(hr.getId());
        return ResponseEntity.ok(notices);
    }

    // ========== REQUEST DTOS ==========

    // DTOs for requests
    public static class ApproveLeaveRequest {
        private String notes;

        public String getNotes() {
            return notes;
        }

        public void setNotes(String notes) {
            this.notes = notes;
        }
    }

    public static class CalculateSalaryRequest {
        private Long userId;
        private Integer year;
        private Integer month;
        private BigDecimal baseSalary;

        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public Integer getYear() {
            return year;
        }

        public void setYear(Integer year) {
            this.year = year;
        }

        public Integer getMonth() {
            return month;
        }

        public void setMonth(Integer month) {
            this.month = month;
        }

        public BigDecimal getBaseSalary() {
            return baseSalary;
        }

        public void setBaseSalary(BigDecimal baseSalary) {
            this.baseSalary = baseSalary;
        }
    }

    public static class UpdateSalaryRequest {
        private BigDecimal netSalary;
        private String notes;

        public BigDecimal getNetSalary() {
            return netSalary;
        }

        public void setNetSalary(BigDecimal netSalary) {
            this.netSalary = netSalary;
        }

        public String getNotes() {
            return notes;
        }

        public void setNotes(String notes) {
            this.notes = notes;
        }
    }

    public static class CreateRosterRequest {
        private Long userId;
        private LocalDate shiftDate;
        private String shiftType;
        private String location;
        private String notes;

        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public LocalDate getShiftDate() {
            return shiftDate;
        }

        public void setShiftDate(LocalDate shiftDate) {
            this.shiftDate = shiftDate;
        }

        public String getShiftType() {
            return shiftType;
        }

        public void setShiftType(String shiftType) {
            this.shiftType = shiftType;
        }

        public String getLocation() {
            return location;
        }

        public void setLocation(String location) {
            this.location = location;
        }

        public String getNotes() {
            return notes;
        }

        public void setNotes(String notes) {
            this.notes = notes;
        }
    }

    public static class SendNoticeRequest {
        private Long recipientId;
        private String subject;
        private String content;
        private String noticeType;

        public Long getRecipientId() {
            return recipientId;
        }

        public void setRecipientId(Long recipientId) {
            this.recipientId = recipientId;
        }

        public String getSubject() {
            return subject;
        }

        public void setSubject(String subject) {
            this.subject = subject;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public String getNoticeType() {
            return noticeType;
        }

        public void setNoticeType(String noticeType) {
            this.noticeType = noticeType;
        }
    }

    public static class ApplyLeaveRequest {
        private Long userId;
        private LocalDate startDate;
        private LocalDate endDate;
        private String leaveType;
        private String reason;

        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public LocalDate getStartDate() {
            return startDate;
        }

        public void setStartDate(LocalDate startDate) {
            this.startDate = startDate;
        }

        public LocalDate getEndDate() {
            return endDate;
        }

        public void setEndDate(LocalDate endDate) {
            this.endDate = endDate;
        }

        public String getLeaveType() {
            return leaveType;
        }

        public void setLeaveType(String leaveType) {
            this.leaveType = leaveType;
        }

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }
    }
}
