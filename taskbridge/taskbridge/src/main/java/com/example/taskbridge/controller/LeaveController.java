package com.example.taskbridge.controller;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.taskbridge.entity.Leave;
import com.example.taskbridge.entity.User;
import com.example.taskbridge.exception.ResourceNotFoundException;
import com.example.taskbridge.repository.UserRepository;
import com.example.taskbridge.service.LeaveService;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    private final LeaveService leaveService;
    private final UserRepository userRepository;

    public LeaveController(LeaveService leaveService, UserRepository userRepository) {
        this.leaveService = leaveService;
        this.userRepository = userRepository;
    }

    // Get my leaves (accessible by any authenticated user)
    @GetMapping("/my-leaves")
    public ResponseEntity<List<Leave>> getMyLeaves(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        List<Leave> leaves = leaveService.getUserLeaves(user.getId());
        return ResponseEntity.ok(leaves);
    }

    // Get my pending leaves
    @GetMapping("/my-leaves/pending")
    public ResponseEntity<List<Leave>> getMyPendingLeaves(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        List<Leave> leaves = leaveService.getPendingLeaves(user.getId());
        return ResponseEntity.ok(leaves);
    }

    // Apply for leave (accessible by authenticated users)
    @PostMapping("/apply")
    public ResponseEntity<Leave> applyForLeave(
            @RequestBody ApplyLeaveRequest request,
            Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Leave leave = leaveService.applyForLeave(
                user.getId(),
                request.getStartDate(),
                request.getEndDate(),
                request.getLeaveType(),
                request.getReason()
        );
        return ResponseEntity.ok(leave);
    }

    // Get leaves in date range
    @GetMapping("/range")
    public ResponseEntity<List<Leave>> getLeavesInDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<Leave> leaves = leaveService.getAllLeavesInDateRange(startDate, endDate);
        return ResponseEntity.ok(leaves);
    }

    // DTO for leave requests
    public static class ApplyLeaveRequest {
        private LocalDate startDate;
        private LocalDate endDate;
        private String leaveType;
        private String reason;

        public LocalDate getStartDate() {
            return startDate;
        }

        public void setStartDate(LocalDate startDate) {
            this.startDate = startDate;
        }

        public LocalDate getEndDate() {
            return endDate;
        }

        public void setEndDate(LocalDate endDate) {
            this.endDate = endDate;
        }

        public String getLeaveType() {
            return leaveType;
        }

        public void setLeaveType(String leaveType) {
            this.leaveType = leaveType;
        }

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }
    }
}
