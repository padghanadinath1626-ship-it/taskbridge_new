package com.example.taskbridge.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.taskbridge.entity.Notice;
import com.example.taskbridge.entity.User;
import com.example.taskbridge.entity.Notice.NoticeType;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Long> {
    
    List<Notice> findByRecipient(User recipient);
    
    List<Notice> findByRecipientAndStatus(User recipient, Notice.NoticeStatus status);
    
    List<Notice> findBySender(User sender);
    
    List<Notice> findByRecipientAndCreatedAtAfter(User recipient, LocalDateTime createdAt);
    
    List<Notice> findByNoticeType(NoticeType noticeType);
}
