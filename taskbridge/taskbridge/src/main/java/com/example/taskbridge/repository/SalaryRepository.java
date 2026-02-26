package com.example.taskbridge.repository;

import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.taskbridge.entity.Salary;
import com.example.taskbridge.entity.User;

@Repository
public interface SalaryRepository extends JpaRepository<Salary, Long> {
    
    List<Salary> findByUser(User user);
    
    Optional<Salary> findByUserAndYearAndMonth(User user, Integer year, Integer month);
    
    List<Salary> findByUserAndYear(User user, Integer year);
    
    List<Salary> findByYear(Integer year);
    
    List<Salary> findByYearAndMonth(Integer year, Integer month);
}
