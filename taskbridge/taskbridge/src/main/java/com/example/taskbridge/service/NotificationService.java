package com.example.taskbridge.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.taskbridge.dto.NotificationRequest;
import com.example.taskbridge.dto.NotificationResponse;
import com.example.taskbridge.dto.NotificationResponse.UserResponse;
import com.example.taskbridge.entity.Notification;
import com.example.taskbridge.entity.Task;
import com.example.taskbridge.entity.User;
import com.example.taskbridge.exception.ResourceNotFoundException;
import com.example.taskbridge.repository.NotificationRepository;
import com.example.taskbridge.repository.TaskRepository;
import com.example.taskbridge.repository.UserRepository;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository,
                               TaskRepository taskRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
    }

    private NotificationResponse convertToResponse(Notification notification) {
        UserResponse sender = new UserResponse(
            notification.getSender().getId(),
            notification.getSender().getName(),
            notification.getSender().getEmail(),
            notification.getSender().getRole().name()
        );

        UserResponse recipient = new UserResponse(
            notification.getRecipient().getId(),
            notification.getRecipient().getName(),
            notification.getRecipient().getEmail(),
            notification.getRecipient().getRole().name()
        );

        return NotificationResponse.builder()
            .id(notification.getId())
            .sender(sender)
            .recipient(recipient)
            .title(notification.getTitle())
            .message(notification.getMessage())
            .taskId(notification.getTask() != null ? notification.getTask().getId() : null)
            .type(notification.getType())
            .isRead(notification.getIsRead())
            .createdAt(notification.getCreatedAt())
            .build();
    }

    // Send notification from one user to another with hierarchical message flow validation
    public NotificationResponse sendNotification(NotificationRequest request, String senderEmail) {
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));

        User recipient = userRepository.findById(request.getRecipientId())
                .orElseThrow(() -> new ResourceNotFoundException("Recipient not found"));

        // Validate hierarchical message flow
        validateMessageFlow(sender, recipient);

        Notification notification = new Notification();
        notification.setSender(sender);
        notification.setRecipient(recipient);
        notification.setTitle(request.getTitle());
        notification.setMessage(request.getMessage());
        notification.setType(request.getType());
        notification.setIsRead(false);

        // Optional: link to task
        if (request.getTaskId() != null) {
            Task task = taskRepository.findById(request.getTaskId())
                    .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
            notification.setTask(task);
        }

        Notification saved = notificationRepository.save(notification);
        return convertToResponse(saved);
    }

    // Validate if sender can send message to recipient based on hierarchical flow
    private void validateMessageFlow(User sender, User recipient) {
        com.example.taskbridge.entity.RoleType senderRole = sender.getRole();
        com.example.taskbridge.entity.RoleType recipientRole = recipient.getRole();

        // Admin can message anyone
        if (senderRole == com.example.taskbridge.entity.RoleType.ADMIN) {
            return;
        }

        // Manager can message admin or employees
        if (senderRole == com.example.taskbridge.entity.RoleType.MANAGER) {
            if (recipientRole == com.example.taskbridge.entity.RoleType.ADMIN ||
                recipientRole == com.example.taskbridge.entity.RoleType.EMPLOYEE) {
                return;
            }
            throw new IllegalArgumentException("Managers can only send messages to Admins or Employees");
        }

        // Employee can only message their manager
        if (senderRole == com.example.taskbridge.entity.RoleType.EMPLOYEE) {
            if (recipientRole == com.example.taskbridge.entity.RoleType.MANAGER) {
                return;
            }
            throw new IllegalArgumentException("Employees can only send messages to Managers");
        }
    }

    // Get my notifications
    public List<NotificationResponse> getMyNotifications(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return notificationRepository.findByRecipient(user).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Get unread notifications
    public List<NotificationResponse> getUnreadNotifications(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return notificationRepository.findByRecipientAndIsReadFalse(user).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Mark notification as read
    public NotificationResponse markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        notification.setIsRead(true);
        Notification saved = notificationRepository.save(notification);
        return convertToResponse(saved);
    }

    // Get allowed recipients based on sender's role
    public List<User> getAllowedRecipients(String senderEmail) {
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));

        com.example.taskbridge.entity.RoleType senderRole = sender.getRole();

        // Admin can message any active user
        if (senderRole == com.example.taskbridge.entity.RoleType.ADMIN) {
            return userRepository.findByActive(true);
        }

        // Manager can message all employees and admins
        if (senderRole == com.example.taskbridge.entity.RoleType.MANAGER) {
            List<User> recipients = new java.util.ArrayList<>();
            recipients.addAll(userRepository.findByRoleAndActive(com.example.taskbridge.entity.RoleType.ADMIN, true));
            recipients.addAll(userRepository.findByRoleAndActive(com.example.taskbridge.entity.RoleType.EMPLOYEE, true));
            return recipients;
        }

        // Employee can only message managers
        if (senderRole == com.example.taskbridge.entity.RoleType.EMPLOYEE) {
            return userRepository.findByRoleAndActive(com.example.taskbridge.entity.RoleType.MANAGER, true);
        }

        return new java.util.ArrayList<>();
    }
}
