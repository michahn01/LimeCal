package com.limecal.scheduler.Email;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private Environment env;

    public void sendEmail(Feedback feedback) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(env.getProperty("spring.mail.username"));
        message.setSubject(String.format("LimeCal Feedback: %s", feedback.getFeedbackType()));
        message.setText(feedback.getFeedbackMessage());

        mailSender.send(message);
    }
}