package com.example.taskbridge.dto;

import com.example.taskbridge.entity.TaskPriority;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskRequest {
    private String title;
    private String description;
    private TaskPriority priority;
    private LocalDateTime deadline;
    private String assigneeEmail; // optional: manager can assign at creation
}
