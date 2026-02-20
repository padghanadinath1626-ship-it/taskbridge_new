package com.example.taskbridge.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.taskbridge.dto.TaskResponse;
import com.example.taskbridge.entity.RoleType;
import com.example.taskbridge.entity.User;
import com.example.taskbridge.service.TaskService;
import com.example.taskbridge.service.UserService;
import com.example.taskbridge.service.NotificationService;
import com.example.taskbridge.dto.NotificationRequest;
import com.example.taskbridge.entity.NotificationType;

import java.security.Principal;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final TaskService taskService;
    private final NotificationService notificationService;

    public AdminController(UserService userService, TaskService taskService, NotificationService notificationService) {
        this.userService = userService;
        this.taskService = taskService;
        this.notificationService = notificationService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllActiveUsers());
    }

    @GetMapping("/users/all")
    public ResponseEntity<List<User>> getAllUsersIncludingInactive() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<User> updateUserRole(@PathVariable Long id, @RequestBody RoleType role) {
        User user = userService.updateUserRole(id, role);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id, Principal principal) {
        userService.deleteUser(id);

        // Send notification to the user informing about deactivation
        try {
            NotificationRequest req = new NotificationRequest();
            req.setRecipientId(id);
            req.setTitle("Account Deactivated");
            req.setMessage("Your account has been deactivated by an administrator. Please contact admin to request reactivation.");
            req.setType(NotificationType.NOTICE);
            notificationService.sendNotification(req, principal.getName());
        } catch (Exception e) {
            // Log and continue
            System.err.println("Failed to send deactivation notification: " + e.getMessage());
        }

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/users/{id}/reactivate")
    public ResponseEntity<User> reactivateUser(@PathVariable Long id, Principal principal) {
        userService.reactivateUser(id);
        User user = userService.getUserById(id);

        // Send notification to the user informing about reactivation
        try {
            NotificationRequest req = new NotificationRequest();
            req.setRecipientId(id);
            req.setTitle("Account Reactivated");
            req.setMessage("Your account has been reactivated. You can now access the system.");
            req.setType(NotificationType.NOTICE);
            notificationService.sendNotification(req, principal.getName());
        } catch (Exception e) {
            System.err.println("Failed to send reactivation notification: " + e.getMessage());
        }

        return ResponseEntity.ok(user);
    }

    @GetMapping("/tasks")
    public ResponseEntity<List<TaskResponse>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
