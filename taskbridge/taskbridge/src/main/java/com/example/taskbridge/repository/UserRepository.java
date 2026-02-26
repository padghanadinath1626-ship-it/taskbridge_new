package com.example.taskbridge.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.taskbridge.entity.RoleType;
import com.example.taskbridge.entity.User;
@Repository
public interface UserRepository
extends JpaRepository<User, Long> {

Optional<User> findByEmail(String email);
List<User> findByRole(RoleType role);
List<User> findByActive(boolean active);
List<User> findByRoleAndActive(RoleType role, boolean active);
}

