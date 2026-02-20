package com.example.taskbridge.dto;

import com.example.taskbridge.entity.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequest {
    private Long recipientId;
    private String title;
    private String message;
    private Long taskId; // Optional
    private NotificationType type;
}

