package com.example.taskbridge.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.taskbridge.dto.NotificationRequest;
import com.example.taskbridge.dto.NotificationResponse;
import com.example.taskbridge.entity.User;
import com.example.taskbridge.service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // Send notification (Admin/Manager to Employee, Employee to Manager, etc.)
    @PostMapping
    public ResponseEntity<NotificationResponse> sendNotification(@RequestBody NotificationRequest request,
                                                                   Principal principal) {
        NotificationResponse notification = notificationService.sendNotification(request, principal.getName());
        return ResponseEntity.ok(notification);
    }

    // Get my notifications
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(Principal principal) {
        List<NotificationResponse> notifications = notificationService.getMyNotifications(principal.getName());
        return ResponseEntity.ok(notifications);
    }

    // Get unread notifications count
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications(Principal principal) {
        List<NotificationResponse> notifications = notificationService.getUnreadNotifications(principal.getName());
        return ResponseEntity.ok(notifications);
    }

    // Mark notification as read
    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable Long id) {
        NotificationResponse notification = notificationService.markAsRead(id);
        return ResponseEntity.ok(notification);
    }

    // Get allowed recipients for messaging based on user's role
    @GetMapping("/allowed-recipients")
    public ResponseEntity<List<User>> getAllowedRecipients(Principal principal) {
        List<User> recipients = notificationService.getAllowedRecipients(principal.getName());
        return ResponseEntity.ok(recipients);
    }
}
