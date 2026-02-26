package com.example.taskbridge.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.taskbridge.entity.Leave;
import com.example.taskbridge.entity.Leave.LeaveStatus;
import com.example.taskbridge.entity.User;
import com.example.taskbridge.exception.ResourceNotFoundException;
import com.example.taskbridge.repository.LeaveRepository;
import com.example.taskbridge.repository.UserRepository;

@Service
public class LeaveService {

    private final LeaveRepository leaveRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public LeaveService(LeaveRepository leaveRepository, UserRepository userRepository, EmailService emailService) {
        this.leaveRepository = leaveRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    // Employee/Manager applies for leave
    public Leave applyForLeave(Long userId, LocalDate startDate, LocalDate endDate, String leaveType, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Leave leave = new Leave();
        leave.setUser(user);
        leave.setStartDate(startDate);
        leave.setEndDate(endDate);
        leave.setLeaveType(leaveType);
        leave.setReason(reason);
        leave.setStatus(LeaveStatus.PENDING);

        Leave savedLeave = leaveRepository.save(leave);
        
        // Send notification email to HR
        emailService.sendLeaveRequestNotificationToHR(user, leaveType, startDate.toString(), endDate.toString(), reason);
        
        return savedLeave;
    }

    // Get leaves for a user
    public List<Leave> getUserLeaves(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return leaveRepository.findByUser(user);
    }

    // Get pending leaves for a user
    public List<Leave> getPendingLeaves(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return leaveRepository.findByUserAndStatus(user, LeaveStatus.PENDING);
    }

    // Get all pending leaves (for HR to review)
    public List<Leave> getAllPendingLeaves() {
        return leaveRepository.findAll().stream()
                .filter(leave -> leave.getStatus() == LeaveStatus.PENDING)
                .toList();
    }

    // HR approves a leave
    public Leave approveLeave(Long leaveId, Long approverUserId, String notes) {
        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));

        User approver = userRepository.findById(approverUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Approver not found"));

        leave.setStatus(LeaveStatus.APPROVED);
        leave.setApprovedBy(approver);
        leave.setApproverNotes(notes);

        return leaveRepository.save(leave);
    }

    // HR rejects a leave
    public Leave rejectLeave(Long leaveId, Long approverUserId, String notes) {
        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));

        User approver = userRepository.findById(approverUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Approver not found"));

        leave.setStatus(LeaveStatus.REJECTED);
        leave.setApprovedBy(approver);
        leave.setApproverNotes(notes);

        return leaveRepository.save(leave);
    }

    // Get leaves in a date range
    public List<Leave> getLeavesInDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return leaveRepository.findByUserAndStartDateBetween(user, startDate, endDate);
    }

    // Get all leaves in date range (for reporting)
    public List<Leave> getAllLeavesInDateRange(LocalDate startDate, LocalDate endDate) {
        return leaveRepository.findByStartDateBetween(startDate, endDate);
    }
}
