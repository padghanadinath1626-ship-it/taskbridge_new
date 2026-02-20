package com.example.taskbridge.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.taskbridge.entity.Notification;
import com.example.taskbridge.entity.User;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipient(User recipient);
    List<Notification> findByRecipientAndIsReadFalse(User recipient);
}
