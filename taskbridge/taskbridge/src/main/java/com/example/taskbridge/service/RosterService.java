package com.example.taskbridge.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.taskbridge.entity.Roster;
import com.example.taskbridge.entity.User;
import com.example.taskbridge.exception.ResourceNotFoundException;
import com.example.taskbridge.repository.RosterRepository;
import com.example.taskbridge.repository.UserRepository;

@Service
public class RosterService {

    private final RosterRepository rosterRepository;
    private final UserRepository userRepository;

    public RosterService(RosterRepository rosterRepository, UserRepository userRepository) {
        this.rosterRepository = rosterRepository;
        this.userRepository = userRepository;
    }

    // Create/update roster for a user on a specific date
    public Roster createOrUpdateRosterEntry(Long userId, LocalDate shiftDate, String shiftType, 
                                           String location, String notes, Long createdByUserId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        User createdBy = userRepository.findById(createdByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Creator user not found"));

        // Check if roster entry already exists for this date
        List<Roster> existing = rosterRepository.findByUserAndShiftDate(user, shiftDate);
        Roster roster;

        if (!existing.isEmpty()) {
            roster = existing.get(0);
        } else {
            roster = new Roster();
            roster.setUser(user);
            roster.setShiftDate(shiftDate);
            roster.setCreatedBy(createdBy);
        }

        roster.setShiftType(shiftType);
        roster.setLocation(location);
        roster.setNotes(notes);

        return rosterRepository.save(roster);
    }

    // Get roster entries for a user
    public List<Roster> getUserRoster(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return rosterRepository.findByUser(user);
    }

    // Get roster entries for a user in a date range
    public List<Roster> getUserRosterInDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return rosterRepository.findByUserAndShiftDateBetween(user, startDate, endDate);
    }

    // Get all roster entries for a specific date
    public List<Roster> getRosterForDate(LocalDate shiftDate) {
        return rosterRepository.findByShiftDate(shiftDate);
    }

    // Get all roster entries for a date range
    public List<Roster> getAllRosterInDateRange(LocalDate startDate, LocalDate endDate) {
        return rosterRepository.findByShiftDateBetween(startDate, endDate);
    }

    // Delete roster entry
    public void deleteRosterEntry(Long rosterId) {
        Roster roster = rosterRepository.findById(rosterId)
                .orElseThrow(() -> new ResourceNotFoundException("Roster entry not found"));
        rosterRepository.delete(roster);
    }
}
