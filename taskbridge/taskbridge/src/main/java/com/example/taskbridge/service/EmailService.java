package com.example.taskbridge.service;

import java.util.List;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.example.taskbridge.entity.Notice;
import com.example.taskbridge.entity.User;
import com.example.taskbridge.repository.UserRepository;
import com.example.taskbridge.exception.ResourceNotFoundException;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final UserRepository userRepository;

    public EmailService(JavaMailSender mailSender, UserRepository userRepository) {
        this.mailSender = mailSender;
        this.userRepository = userRepository;
    }

    // Send email notification for a notice
    public void sendNoticeEmail(Long noticeId, Notice notice) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(notice.getRecipient().getEmail());
            message.setSubject("TaskBridge Notice: " + notice.getSubject());
            message.setText(buildNoticeEmailBody(notice));
            message.setFrom("noreply@taskbridge.com");

            mailSender.send(message);
            System.out.println("Notice email sent to " + notice.getRecipient().getEmail());
        } catch (Exception e) {
            System.err.println("Failed to send notice email: " + e.getMessage());
            e.printStackTrace();
            // Don't throw exception - email failure shouldn't block the notice from being created
        }
    }

    // Send attendance alert email
    public void sendAttendanceAlert(User user, String message) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo(user.getEmail());
            mailMessage.setSubject("TaskBridge Attendance Alert");
            mailMessage.setText(buildAttendanceAlertBody(user, message));
            mailMessage.setFrom("noreply@taskbridge.com");

            mailSender.send(mailMessage);
        } catch (Exception e) {
            System.err.println("Failed to send attendance alert email: " + e.getMessage());
        }
    }

    // Send leave approval/rejection email
    public void sendLeaveDecisionEmail(User user, String leaveType, String decision, String notes) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(user.getEmail());
            message.setSubject("TaskBridge Leave Request - " + decision.toUpperCase());
            message.setText(buildLeaveDecisionBody(user, leaveType, decision, notes));
            message.setFrom("noreply@taskbridge.com");

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send leave decision email: " + e.getMessage());
        }
    }

    // Send leave request notification to HR
    public void sendLeaveRequestNotificationToHR(User applicant, String leaveType, String startDate, String endDate, String reason) {
        try {
            // Get all HR users
            List<User> hrUsers = userRepository.findByRole(com.example.taskbridge.entity.RoleType.HR);
            
            for (User hrUser : hrUsers) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(hrUser.getEmail());
                message.setSubject("New Leave Request - " + applicant.getName());
                message.setText(buildLeaveRequestBody(applicant, leaveType, startDate, endDate, reason));
                message.setFrom("noreply@taskbridge.com");

                mailSender.send(message);
            }
            
            System.out.println("Leave request notification sent to HR team");
        } catch (Exception e) {
            System.err.println("Failed to send leave request notification: " + e.getMessage());
        }
    }

    // Send salary report email
    public void sendSalaryEmail(User user, Integer month, Integer year, String salaryDetails) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(user.getEmail());
            message.setSubject("TaskBridge Salary Report - " + getMonthName(month) + " " + year);
            message.setText(buildSalaryEmailBody(user, month, year, salaryDetails));
            message.setFrom("noreply@taskbridge.com");

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send salary email: " + e.getMessage());
        }
    }

    // Send roster assignment email
    public void sendRosterEmail(User user, String rosterDetails) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(user.getEmail());
            message.setSubject("TaskBridge Roster Assignment");
            message.setText(buildRosterEmailBody(user, rosterDetails));
            message.setFrom("noreply@taskbridge.com");

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send roster email: " + e.getMessage());
        }
    }

    // Helper methods to build email bodies
    private String buildNoticeEmailBody(Notice notice) {
        StringBuilder body = new StringBuilder();
        body.append("Dear ").append(notice.getRecipient().getName()).append(",\n\n");
        body.append("You have received a new notice from the HR department.\n\n");
        body.append("Subject: ").append(notice.getSubject()).append("\n");
        body.append("Type: ").append(notice.getNoticeType()).append("\n\n");
        body.append("Message:\n");
        body.append(notice.getContent()).append("\n\n");
        body.append("Please log in to TaskBridge to view and acknowledge this notice.\n\n");
        body.append("Best regards,\n");
        body.append("TaskBridge HR System");
        return body.toString();
    }

    private String buildAttendanceAlertBody(User user, String message) {
        StringBuilder body = new StringBuilder();
        body.append("Dear ").append(user.getName()).append(",\n\n");
        body.append("Attendance Alert:\n");
        body.append(message).append("\n\n");
        body.append("Please contact HR if you have any questions.\n\n");
        body.append("Best regards,\n");
        body.append("TaskBridge HR System");
        return body.toString();
    }

    private String buildLeaveDecisionBody(User user, String leaveType, String decision, String notes) {
        StringBuilder body = new StringBuilder();
        body.append("Dear ").append(user.getName()).append(",\n\n");
        body.append("Your leave request has been ").append(decision.toLowerCase()).append(".\n\n");
        body.append("Leave Type: ").append(leaveType).append("\n");
        if (notes != null && !notes.isEmpty()) {
            body.append("Notes: ").append(notes).append("\n");
        }
        body.append("\n");
        body.append("Best regards,\n");
        body.append("TaskBridge HR System");
        return body.toString();
    }

    private String buildLeaveRequestBody(User applicant, String leaveType, String startDate, String endDate, String reason) {
        StringBuilder body = new StringBuilder();
        body.append("Dear HR Team,\n\n");
        body.append("A new leave request has been submitted for your review.\n\n");
        body.append("Employee: ").append(applicant.getName()).append("\n");
        body.append("Email: ").append(applicant.getEmail()).append("\n");
        body.append("Leave Type: ").append(leaveType).append("\n");
        body.append("From: ").append(startDate).append("\n");
        body.append("To: ").append(endDate).append("\n");
        body.append("Reason: ").append(reason != null ? reason : "Not provided").append("\n\n");
        body.append("Please log in to TaskBridge to review and approve/reject this leave request.\n\n");
        body.append("Best regards,\n");
        body.append("TaskBridge HR System");
        return body.toString();
    }

    private String buildSalaryEmailBody(User user, Integer month, Integer year, String salaryDetails) {
        StringBuilder body = new StringBuilder();
        body.append("Dear ").append(user.getName()).append(",\n\n");
        body.append("Your salary report for ").append(getMonthName(month)).append(" ").append(year).append(" is ready.\n\n");
        body.append(salaryDetails).append("\n\n");
        body.append("Please log in to TaskBridge to view your complete salary details.\n\n");
        body.append("Best regards,\n");
        body.append("TaskBridge HR System");
        return body.toString();
    }

    private String buildRosterEmailBody(User user, String rosterDetails) {
        StringBuilder body = new StringBuilder();
        body.append("Dear ").append(user.getName()).append(",\n\n");
        body.append("Your roster has been updated.\n\n");
        body.append(rosterDetails).append("\n\n");
        body.append("Please log in to TaskBridge to view your complete roster.\n\n");
        body.append("Best regards,\n");
        body.append("TaskBridge HR System");
        return body.toString();
    }

    private String getMonthName(Integer month) {
        String[] months = {"", "January", "February", "March", "April", "May", "June",
                          "July", "August", "September", "October", "November", "December"};
        return months[month];
    }
}
