package com.example.taskbridge.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "notice")
public class Notice {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender; // HR or Admin who is sending the notice

    @ManyToOne
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient; // Employee or Manager receiving the notice

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column
    private NoticeType noticeType = NoticeType.GENERAL; // GENERAL, ATTENDANCE, SALARY, CONDUCT, PERFORMANCE

    @Enumerated(EnumType.STRING)
    @Column
    private NoticeStatus status = NoticeStatus.SENT; // SENT, READ, ACKNOWLEDGED

    @Column
    private LocalDateTime readAt;

    @Column
    private LocalDateTime acknowledgedAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum NoticeType {
        GENERAL, ATTENDANCE, SALARY, CONDUCT, PERFORMANCE
    }

    public enum NoticeStatus {
        SENT, READ, ACKNOWLEDGED
    }
}
