package com.example.taskbridge.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.taskbridge.dto.TaskRequest;
import com.example.taskbridge.dto.TaskResponse;
import com.example.taskbridge.entity.TaskStatus;
import com.example.taskbridge.service.TaskService;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    // Manager: Create task
    @PostMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<TaskResponse> createTask(@RequestBody TaskRequest request, Principal principal) {
        TaskResponse created = taskService.createTask(request, principal.getName());
        return ResponseEntity.ok(created);
    }

    // Employee: Get available tasks to claim
    @GetMapping("/available")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<TaskResponse>> getAvailableTasks() {
        return ResponseEntity.ok(taskService.getAvailableTasks());
    }

    // Employee: Claim task
    @PostMapping("/{id}/claim")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<TaskResponse> claimTask(@PathVariable Long id, Principal principal) {
        TaskResponse task = taskService.claimTask(id, principal.getName());
        return ResponseEntity.ok(task);
    }

    // Get my tasks (Employee: claimed, Manager: created)
    @GetMapping
    public ResponseEntity<List<TaskResponse>> getMyTasks(Principal principal) {
        List<TaskResponse> tasks = taskService.getMyTasks(principal.getName());
        return ResponseEntity.ok(tasks);
    }

    // Employee/Manager: Update status
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER')")
    public ResponseEntity<TaskResponse> updateStatus(@PathVariable Long id, @RequestBody TaskStatus status) {
        TaskResponse task = taskService.updateTaskStatus(id, status);
        return ResponseEntity.ok(task);
    }
}
