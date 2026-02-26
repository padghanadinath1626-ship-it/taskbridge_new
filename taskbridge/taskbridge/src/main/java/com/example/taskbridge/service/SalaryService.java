package com.example.taskbridge.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.taskbridge.entity.Salary;
import com.example.taskbridge.entity.User;
import com.example.taskbridge.exception.ResourceNotFoundException;
import com.example.taskbridge.repository.AttendanceRepository;
import com.example.taskbridge.repository.LeaveRepository;
import com.example.taskbridge.repository.SalaryRepository;
import com.example.taskbridge.repository.UserRepository;

@Service
public class SalaryService {

    private final SalaryRepository salaryRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRepository leaveRepository;
    private final UserRepository userRepository;

    public SalaryService(SalaryRepository salaryRepository, AttendanceRepository attendanceRepository,
                        LeaveRepository leaveRepository, UserRepository userRepository) {
        this.salaryRepository = salaryRepository;
        this.attendanceRepository = attendanceRepository;
        this.leaveRepository = leaveRepository;
        this.userRepository = userRepository;
    }

    // Calculate and create salary record for a user for a given month
    public Salary calculateAndCreateSalary(Long userId, Integer year, Integer month, BigDecimal baseSalary) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check if salary already exists for this month
        var existingSalary = salaryRepository.findByUserAndYearAndMonth(user, year, month);
        if (existingSalary.isPresent()) {
            throw new IllegalStateException("Salary already calculated for this month");
        }

        Salary salary = new Salary();
        salary.setUser(user);
        salary.setYear(year);
        salary.setMonth(month);
        salary.setBaseSalary(baseSalary);

        // Calculate days
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        long totalDays = startDate.until(endDate).getDays() + 1; // +1 to include the last day

        // Get attendance records for the month
        var attendanceRecords = attendanceRepository.findByUserAndAttendanceDateBetween(user, startDate, endDate);
        int presentDays = (int) attendanceRecords.stream()
                .filter(a -> "PRESENT".equals(a.getStatus()))
                .count();

        // Get approved leaves for the month
        var leaves = leaveRepository.findByUserAndStartDateBetween(user, startDate, endDate);
        int leaveDays = (int) leaves.stream()
                .filter(l -> l.getStatus().toString().equals("APPROVED"))
                .count();

        int absentDays = (int) (totalDays - presentDays - leaveDays);

        salary.setTotalWorkingDays((int) totalDays);
        salary.setPresentDays(presentDays);
        salary.setAbsentDays(Math.max(absentDays, 0));
        salary.setLeaveDays(leaveDays);

        // Calculate salary per day
        BigDecimal salaryPerDay = baseSalary.divide(BigDecimal.valueOf(totalDays), 2, java.math.RoundingMode.HALF_UP);
        salary.setSalaryPerDay(salaryPerDay);

        // Earned salary = salary per day * present days
        BigDecimal earnedSalary = salaryPerDay.multiply(BigDecimal.valueOf(presentDays));
        salary.setEarnedSalary(earnedSalary);

        // Deductions = salary per day * absent days
        BigDecimal deductions = salaryPerDay.multiply(BigDecimal.valueOf(Math.max(absentDays, 0)));
        salary.setDeductions(deductions);

        // Net salary = earned salary (leave days are paid)
        BigDecimal netSalary = earnedSalary.add(salaryPerDay.multiply(BigDecimal.valueOf(leaveDays)));
        salary.setNetSalary(netSalary);

        return salaryRepository.save(salary);
    }

    // Get salary records for a user
    public List<Salary> getUserSalaryRecords(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return salaryRepository.findByUser(user);
    }

    // Get salary for a specific month
    public Salary getSalaryForMonth(Long userId, Integer year, Integer month) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return salaryRepository.findByUserAndYearAndMonth(user, year, month)
                .orElseThrow(() -> new ResourceNotFoundException("Salary record not found"));
    }

    // Get all salary records for a year
    public List<Salary> getUserSalaryRecordsForYear(Long userId, Integer year) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return salaryRepository.findByUserAndYear(user, year);
    }

    // Get all salaries for a specific month (for HR reporting)
    public List<Salary> getAllSalariesForMonth(Integer year, Integer month) {
        return salaryRepository.findByYearAndMonth(year, month);
    }

    // Update salary record (HR can adjust if needed)
    public Salary updateSalary(Long salaryId, BigDecimal adjustedNetSalary, String notes) {
        Salary salary = salaryRepository.findById(salaryId)
                .orElseThrow(() -> new ResourceNotFoundException("Salary record not found"));

        salary.setNetSalary(adjustedNetSalary);
        salary.setNotes(notes);

        return salaryRepository.save(salary);
    }
}
