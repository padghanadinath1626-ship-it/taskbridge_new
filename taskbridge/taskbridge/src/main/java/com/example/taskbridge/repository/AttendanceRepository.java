package com.example.taskbridge.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.taskbridge.entity.Attendance;
import com.example.taskbridge.entity.User;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByUser(User user);
    List<Attendance> findByUserAndAttendanceDateBetween(User user, LocalDate startDate, LocalDate endDate);
    Optional<Attendance> findByUserAndAttendanceDate(User user, LocalDate attendanceDate);
    List<Attendance> findByAttendanceDateBetween(LocalDate startDate, LocalDate endDate);
    Optional<Attendance> findTopByUserOrderByAttendanceDateDesc(User user);
}
