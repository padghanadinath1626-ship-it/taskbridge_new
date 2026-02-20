package com.example.taskbridge.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private String message;
    private boolean success;
    private Long userId;
    private String email;
    private String name;
    private String role;
    private boolean active;

    public AuthResponse(String token, String message, boolean success, Long userId, String email, String name,
            String role, boolean active) {
        this.token = token;
        this.message = message;
        this.success = success;
        this.userId = userId;
        this.email = email;
        this.name = name;
        this.role = role;
        this.active = active;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
