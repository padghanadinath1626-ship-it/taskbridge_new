package com.example.taskbridge.controller;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.taskbridge.entity.Attendance;
import com.example.taskbridge.service.AttendanceService;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    // Clock in for current user
    @PostMapping("/clock-in")
    public ResponseEntity<Attendance> clockIn(Principal principal) {
        Attendance attendance = attendanceService.clockIn(principal.getName());
        return ResponseEntity.ok(attendance);
    }

    // Clock out for current user
    @PostMapping("/clock-out")
    public ResponseEntity<Attendance> clockOut(Principal principal) {
        Attendance attendance = attendanceService.clockOut(principal.getName());
        return ResponseEntity.ok(attendance);
    }

    // Get my attendance records
    @GetMapping("/my-attendance")
    public ResponseEntity<List<Attendance>> getMyAttendance(Principal principal) {
        List<Attendance> attendance = attendanceService.getMyAttendance(principal.getName());
        return ResponseEntity.ok(attendance);
    }

    // Get my attendance for date range
    @GetMapping("/my-attendance/range")
    public ResponseEntity<List<Attendance>> getMyAttendanceByDateRange(
            Principal principal,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<Attendance> attendance = attendanceService.getMyAttendanceByDateRange(principal.getName(), startDate, endDate);
        return ResponseEntity.ok(attendance);
    }

    // Get today's attendance status
    @GetMapping("/today")
    public ResponseEntity<Attendance> getTodayAttendance(Principal principal) {
        Attendance attendance = attendanceService.getTodayAttendance(principal.getName());
        return ResponseEntity.ok(attendance);
    }

    // Get user attendance (admin/manager)
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Attendance>> getUserAttendance(@PathVariable Long userId) {
        List<Attendance> attendance = attendanceService.getUserAttendance(userId);
        return ResponseEntity.ok(attendance);
    }

    // Get user attendance by date range (admin/manager)
    @GetMapping("/user/{userId}/range")
    public ResponseEntity<List<Attendance>> getUserAttendanceByDateRange(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<Attendance> attendance = attendanceService.getUserAttendanceByDateRange(userId, startDate, endDate);
        return ResponseEntity.ok(attendance);
    }
}
