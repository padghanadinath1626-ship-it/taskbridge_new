package com.example.taskbridge.dto;

import java.time.LocalDateTime;

import com.example.taskbridge.entity.NotificationType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {
	private Long id;
	private UserResponse sender;
	private UserResponse recipient;
	private String title;
	private String message;
	private Long taskId;
	private NotificationType type;
	private Boolean isRead;
	private LocalDateTime createdAt;

	@Data
	@NoArgsConstructor
	@AllArgsConstructor
	public static class UserResponse {
		private Long id;
		private String name;
		private String email;
		private String role;
	}
}
