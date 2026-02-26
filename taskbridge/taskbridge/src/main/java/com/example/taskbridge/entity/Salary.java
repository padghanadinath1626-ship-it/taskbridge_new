package com.example.taskbridge.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "salary")
public class Salary {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false)
    private Integer month; // 1-12

    @Column(nullable = false)
    private BigDecimal baseSalary;

    @Column
    private Integer totalWorkingDays; // Total days in the month

    @Column
    private Integer presentDays; // Days the employee was present

    @Column
    private Integer absentDays; // Days the employee was absent

    @Column
    private Integer leaveDays; // Approved leave days

    @Column
    private BigDecimal salaryPerDay;

    @Column
    private BigDecimal earnedSalary; // Salary based on present days

    @Column
    private BigDecimal deductions; // Deductions for absences

    @Column
    private BigDecimal netSalary; // Final salary after deductions

    @Column
    private String notes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column
    private LocalDateTime updatedAt = LocalDateTime.now();
}
