package com.example.taskbridge.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.taskbridge.entity.Notice;
import com.example.taskbridge.entity.User;
import com.example.taskbridge.exception.ResourceNotFoundException;
import com.example.taskbridge.repository.NoticeRepository;
import com.example.taskbridge.repository.UserRepository;

@Service
public class NoticeService {

    private final NoticeRepository noticeRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public NoticeService(NoticeRepository noticeRepository, UserRepository userRepository, EmailService emailService) {
        this.noticeRepository = noticeRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    // Send a notice from HR to an employee/manager
    public Notice sendNotice(Long senderId, Long recipientId, String subject, String content, 
                            Notice.NoticeType noticeType) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));

        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipient not found"));

        Notice notice = new Notice();
        notice.setSender(sender);
        notice.setRecipient(recipient);
        notice.setSubject(subject);
        notice.setContent(content);
        notice.setNoticeType(noticeType);
        notice.setStatus(Notice.NoticeStatus.SENT);

        Notice savedNotice = noticeRepository.save(notice);
        
        // Send email notification to recipient (non-blocking)
        try {
            emailService.sendNoticeEmail(savedNotice.getId(), savedNotice);
        } catch (Exception e) {
            System.err.println("Failed to send notice email, but notice was created: " + e.getMessage());
            // Don't re-throw - notice is already saved, email failure shouldn't block
        }

        return savedNotice;
    }

    // Get notices for a user
    public List<Notice> getUserNotices(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return noticeRepository.findByRecipient(user);
    }

    // Get unread notices for a user
    public List<Notice> getUnreadNoticesForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return noticeRepository.findByRecipientAndStatus(user, Notice.NoticeStatus.SENT);
    }

    // Get notices sent by HR
    public List<Notice> getNoticesSentByHR(Long hrUserId) {
        User hr = userRepository.findById(hrUserId)
                .orElseThrow(() -> new ResourceNotFoundException("HR user not found"));
        return noticeRepository.findBySender(hr);
    }

    // Mark notice as read
    public Notice markNoticeAsRead(Long noticeId) {
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new ResourceNotFoundException("Notice not found"));

        notice.setStatus(Notice.NoticeStatus.READ);
        notice.setReadAt(LocalDateTime.now());

        return noticeRepository.save(notice);
    }

    // Mark notice as acknowledged
    public Notice markNoticeAsAcknowledged(Long noticeId) {
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new ResourceNotFoundException("Notice not found"));

        notice.setStatus(Notice.NoticeStatus.ACKNOWLEDGED);
        notice.setAcknowledgedAt(LocalDateTime.now());

        return noticeRepository.save(notice);
    }
}
