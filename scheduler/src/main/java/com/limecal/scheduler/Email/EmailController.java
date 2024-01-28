package com.limecal.scheduler.Email;

 
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
 

import org.springframework.web.bind.annotation.CrossOrigin;
@CrossOrigin(
    origins = {
        "*"
        })
@RestController
@RequestMapping(path = "api/v1/sendFeedback")
public class EmailController {
 
    private final EmailService emailService;

    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }
 
    // Sending a simple Email
    @PostMapping
    public void sendMail(@Valid @RequestBody Feedback feedback) {
        emailService.sendEmail(feedback);
    }

}