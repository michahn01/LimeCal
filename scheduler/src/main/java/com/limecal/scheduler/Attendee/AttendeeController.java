package com.limecal.scheduler.Attendee;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import jakarta.validation.Valid;

@CrossOrigin(origins = {
        "*"
})
@RestController
@RequestMapping(path = "api/v1/attendee")
public class AttendeeController {
    private final AttendeeService attendeeService;

    public AttendeeController(AttendeeService attendeeService) {
        this.attendeeService = attendeeService;
    }

    // adds attendee to Event and return empty array.
    // if attendee with specified name already exists, do not add. 
    // Then, return array containing attendee's
    // available time intervals. 
    @PostMapping("")
    public ResponseEntity<Map<String, Object>> addAttendee(@Valid @RequestBody Attendee attendee) {
        Map<String, Object> response = new HashMap<>();
        response.put("available_times", 
        attendeeService.fetchAttendeeTimes(attendee.getUsername(), attendee.getEventPublicId()));
        return ResponseEntity.ok(response);
    }

    @PutMapping("")
    public ResponseEntity<Map<String, Object>> addAvailability(@Valid @RequestBody Attendee attendee) {
        Map<String, Object> response = new HashMap<>();
        attendeeService.updateAttendeeTimes(attendee);
        return ResponseEntity.ok(response); 
    }
}
