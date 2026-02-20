package com.example.taskbridge.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.taskbridge.dto.TaskRequest;
import com.example.taskbridge.dto.TaskResponse;
import com.example.taskbridge.dto.TaskResponse.UserResponse;
import com.example.taskbridge.entity.Task;
import com.example.taskbridge.entity.TaskStatus;
import com.example.taskbridge.entity.User;
import com.example.taskbridge.exception.ResourceNotFoundException;
import com.example.taskbridge.repository.TaskRepository;
import com.example.taskbridge.repository.UserRepository;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    // Convert Task entity to TaskResponse DTO
    private TaskResponse convertToResponse(Task task) {
        UserResponse creator = null;
        UserResponse manager = null;

        if (task.getCreator() != null) {
            creator = new UserResponse(
                task.getCreator().getId(),
                task.getCreator().getName(),
                task.getCreator().getEmail(),
                task.getCreator().getRole().name()
            );
        }

        if (task.getManager() != null) {
            manager = new UserResponse(
                task.getManager().getId(),
                task.getManager().getName(),
                task.getManager().getEmail(),
                task.getManager().getRole().name()
            );
        }

        return TaskResponse.builder()
            .id(task.getId())
            .title(task.getTitle())
            .description(task.getDescription())
            .priority(task.getPriority())
            .status(task.getStatus())
            .deadline(task.getDeadline())
            .createdAt(task.getCreatedAt())
            .creator(creator)
            .manager(manager)
            .build();
    }

    // Employee/Manager: Create a task
    public TaskResponse createTask(TaskRequest request, String creatorEmail) {
        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority() != null ? request.getPriority() : com.example.taskbridge.entity.TaskPriority.MEDIUM);
        task.setDeadline(request.getDeadline());
        task.setCreator(creator);
        // If manager provided an assignee email, assign immediately
        if (request.getAssigneeEmail() != null && !request.getAssigneeEmail().isBlank()) {
            User assignee = userRepository.findByEmail(request.getAssigneeEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee not found"));
            task.setManager(assignee);
            task.setStatus(TaskStatus.ASSIGNED);
        } else {
            task.setStatus(TaskStatus.CREATED);
        }

        Task savedTask = taskRepository.save(task);
        return convertToResponse(savedTask);
    }

    // Get my tasks based on role
    public List<TaskResponse> getMyTasks(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        if ("MANAGER".equals(user.getRole().name())) {
            // Manager sees tasks they created
            return taskRepository.findByCreator(user).stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());
        } else {
            // Employee sees tasks they claimed
            return taskRepository.findByManager(user).stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());
        }
    }

    // Employee: Claim task (assign to themselves)
    public TaskResponse claimTask(Long taskId, String employeeEmail) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (task.getManager() != null) {
            throw new ResourceNotFoundException("Task is already claimed");
        }

        User employee = userRepository.findByEmail(employeeEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        task.setManager(employee);
        task.setStatus(TaskStatus.ASSIGNED);
        Task savedTask = taskRepository.save(task);
        return convertToResponse(savedTask);
    }

    // Employee: Get available (unclaimed) tasks
    public List<TaskResponse> getAvailableTasks() {
        return taskRepository.findByManagerIsNull().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Manager: Update task status
    public TaskResponse updateTaskStatus(Long taskId, TaskStatus status) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        task.setStatus(status);
        Task savedTask = taskRepository.save(task);
        return convertToResponse(savedTask);
    }

    // Admin: Get all tasks
    public List<TaskResponse> getAllTasks() {
        return taskRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Admin: Delete task
    public void deleteTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        taskRepository.delete(task);
    }
}
