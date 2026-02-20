package com.example.taskbridge.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.taskbridge.entity.Task;
import com.example.taskbridge.entity.TaskStatus;
import com.example.taskbridge.entity.User;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    // Find tasks created by a specific user (for Employees to see their own
    // requests)
    List<Task> findByCreator(User creator);

    // Find tasks managed by a specific user (for Managers to see their workload)
    List<Task> findByManager(User manager);

    // Find tasks by specific status (e.g., finding all COMPLETED tasks)
    List<Task> findByStatus(TaskStatus status);

    // Find tasks by a list of statuses (e.g., CREATED tasks for Managers to pick
    // up)
    List<Task> findByStatusIn(List<TaskStatus> statuses);

    // Find unassigned tasks (available for managers to claim)
    List<Task> findByManagerIsNull();
}
