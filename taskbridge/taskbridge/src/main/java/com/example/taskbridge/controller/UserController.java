package com.example.taskbridge.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.taskbridge.entity.RoleType;
import com.example.taskbridge.entity.User;
import com.example.taskbridge.repository.UserRepository;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Get all employees (accessible to authenticated users)
    @GetMapping("/employees")
    public ResponseEntity<List<User>> getAllEmployees() {
        List<User> users = userRepository.findAll().stream()
                .filter(User::isActive)
                .filter(u -> u.getRole() == RoleType.EMPLOYEE || u.getRole() == RoleType.HR)
                .toList();
        return ResponseEntity.ok(users);
    }
}
