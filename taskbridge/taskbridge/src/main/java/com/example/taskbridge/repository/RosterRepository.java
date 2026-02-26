package com.example.taskbridge.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.taskbridge.entity.Roster;
import com.example.taskbridge.entity.User;

@Repository
public interface RosterRepository extends JpaRepository<Roster, Long> {
    
    List<Roster> findByUser(User user);
    
    List<Roster> findByShiftDate(LocalDate shiftDate);
    
    List<Roster> findByUserAndShiftDate(User user, LocalDate shiftDate);
    
    List<Roster> findByUserAndShiftDateBetween(User user, LocalDate startDate, LocalDate endDate);
    
    List<Roster> findByShiftDateBetween(LocalDate startDate, LocalDate endDate);
}
