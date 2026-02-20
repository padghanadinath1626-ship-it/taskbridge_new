package com.example.taskbridge.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.taskbridge.entity.Attendance;
import com.example.taskbridge.entity.User;
import com.example.taskbridge.exception.ResourceNotFoundException;
import com.example.taskbridge.repository.AttendanceRepository;
import com.example.taskbridge.repository.UserRepository;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;

    public AttendanceService(AttendanceRepository attendanceRepository, UserRepository userRepository) {
        this.attendanceRepository = attendanceRepository;
        this.userRepository = userRepository;
    }

    // Clock in for the current user
    public Attendance clockIn(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        LocalDate today = LocalDate.now();
        // Check if attendance record exists for today
        Attendance attendance = attendanceRepository.findByUserAndAttendanceDate(user, today)
                .orElse(null);

        if (attendance != null && attendance.getClockInTime() != null) {
            throw new IllegalStateException("User has already clocked in today");
        }

        // Enforce 24 hour gap since last clock out
        java.time.LocalDateTime now = LocalDateTime.now();
        java.util.Optional<Attendance> lastOpt = attendanceRepository.findTopByUserOrderByAttendanceDateDesc(user);
        if (lastOpt.isPresent()) {
            Attendance last = lastOpt.get();
            if (last.getClockOutTime() != null) {
                long hours = java.time.Duration.between(last.getClockOutTime(), now).toHours();
                if (hours < 24) {
                    throw new IllegalStateException("Cannot clock in within 24 hours of last clock out");
                }
            }
        }

        if (attendance == null) {
            attendance = new Attendance();
            attendance.setUser(user);
            attendance.setAttendanceDate(today);
        }

        attendance.setClockInTime(now);
        attendance.setStatus("PRESENT");

        return attendanceRepository.save(attendance);
    }

    // Clock out for the current user
    public Attendance clockOut(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        LocalDate today = LocalDate.now();
        
        Attendance attendance = attendanceRepository.findByUserAndAttendanceDate(user, today)
                .orElseThrow(() -> new IllegalStateException("No clock-in found for today"));

        if (attendance.getClockOutTime() != null) {
            throw new IllegalStateException("User has already clocked out today");
        }

        attendance.setClockOutTime(LocalDateTime.now());

        return attendanceRepository.save(attendance);
    }

    // Get my attendance records
    public List<Attendance> getMyAttendance(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return attendanceRepository.findByUser(user);
    }

    // Get my attendance for a date range
    public List<Attendance> getMyAttendanceByDateRange(String userEmail, LocalDate startDate, LocalDate endDate) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return attendanceRepository.findByUserAndAttendanceDateBetween(user, startDate, endDate);
    }

    // Get attendance for a specific user (admin/manager)
    public List<Attendance> getUserAttendance(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return attendanceRepository.findByUser(user);
    }

    // Get attendance for a specific user by date range (admin/manager)
    public List<Attendance> getUserAttendanceByDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return attendanceRepository.findByUserAndAttendanceDateBetween(user, startDate, endDate);
    }

    // Get all attendance records for a date range (admin only)
    public List<Attendance> getAllAttendanceByDateRange(LocalDate startDate, LocalDate endDate) {
        return attendanceRepository.findByAttendanceDateBetween(startDate, endDate);
    }

    // Get today's attendance
    public Attendance getTodayAttendance(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        LocalDate today = LocalDate.now();
        
        return attendanceRepository.findByUserAndAttendanceDate(user, today)
                .orElse(null);
    }
}
