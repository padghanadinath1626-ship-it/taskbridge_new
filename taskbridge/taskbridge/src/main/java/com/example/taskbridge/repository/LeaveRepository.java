package com.example.taskbridge.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.taskbridge.entity.Leave;
import com.example.taskbridge.entity.User;
import com.example.taskbridge.entity.Leave.LeaveStatus;

@Repository
public interface LeaveRepository extends JpaRepository<Leave, Long> {
    
    List<Leave> findByUser(User user);
    
    List<Leave> findByUserAndStatus(User user, LeaveStatus status);
    
    List<Leave> findByUserAndStartDateBetween(User user, LocalDate startDate, LocalDate endDate);
    
    List<Leave> findByStartDateBetween(LocalDate startDate, LocalDate endDate);
    
    Optional<Leave> findByIdAndUser(Long id, User user);
}
