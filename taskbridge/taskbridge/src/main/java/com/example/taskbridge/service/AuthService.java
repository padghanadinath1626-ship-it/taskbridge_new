package com.example.taskbridge.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.taskbridge.dto.AuthResponse;
import com.example.taskbridge.dto.LoginRequest;
import com.example.taskbridge.dto.RegisterRequest;
import com.example.taskbridge.entity.RoleType;
import com.example.taskbridge.entity.User;
import com.example.taskbridge.exception.InvalidCredentialsException;
import com.example.taskbridge.exception.ResourceAlreadyExistsException;
import com.example.taskbridge.exception.ResourceNotFoundException;
import com.example.taskbridge.repository.UserRepository;
import com.example.taskbridge.security.JwtUtil;

@Service
public class AuthService {

  private final UserRepository repo;
  private final PasswordEncoder encoder;
  private final JwtUtil jwt;

  public AuthService(UserRepository repo, PasswordEncoder encoder, JwtUtil jwt) {
    this.repo = repo;
    this.encoder = encoder;
    this.jwt = jwt;
  }

  public AuthResponse register(RegisterRequest req) {

    if (repo.findByEmail(req.email).isPresent()) {
      throw new ResourceAlreadyExistsException("Email already registered");
    }

    User u = new User();
    u.setName(req.name);
    u.setEmail(req.email);
    u.setPassword(encoder.encode(req.password));
    u.setRole(RoleType.EMPLOYEE); // All new users register as EMPLOYEE
    u.setActive(true);

    User savedUser = repo.save(u);

    String token = jwt.generateToken(savedUser.getEmail());

    return new AuthResponse(
      token,
      "User registered successfully",
      true,
      savedUser.getId(),
      savedUser.getEmail(),
      savedUser.getName(),
      savedUser.getRole().name(),
      savedUser.isActive());
  }

  public AuthResponse login(LoginRequest req) {

    User user = repo.findByEmail(req.email)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    if (!encoder.matches(req.password, user.getPassword())) {
      throw new InvalidCredentialsException("Invalid email or password");
    }

    // Allow login even if account is deactivated so user can submit reactivation request.
    String token = jwt.generateToken(user.getEmail());

    return new AuthResponse(
      token,
      user.isActive() ? "Login successful" : "Account is deactivated",
      true,
      user.getId(),
      user.getEmail(),
      user.getName(),
      user.getRole().name(),
      user.isActive());
  }

  public com.example.taskbridge.dto.UserInfoResponse getCurrentUser(String email) {
    User user = repo.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    return new com.example.taskbridge.dto.UserInfoResponse(user.getId(), user.getName(), user.getEmail(), user.getRole().name(), user.isActive());
  }

  public void logout(String email) {
    User user = repo.findByEmail(email)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    user.setActive(false);
    repo.save(user);
  }
}
