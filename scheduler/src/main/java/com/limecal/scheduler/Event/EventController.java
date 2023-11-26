package com.limecal.scheduler.Event;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;

@RestController
@RequestMapping(path = "api/v1/event")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    // public_id is a UUID corresponding to "public_id"
    // in database table for "event"
	@GetMapping(path = "/{public_id}")
	public ResponseEntity<Map<String, String>> getInteger() {
        return ResponseEntity(,HttpStatus.OK);
	}

	@PostMapping
	public ResponseEntity<String> registerNewStudent(@Valid @RequestBody Event event) {
        return ResponseEntity.ok("Event added.");
	}

	@DeleteMapping("/something/{studentId}/another/{susId}")
	public void paramPassing(@PathVariable String studentId,
							 @PathVariable String susId,
							 @RequestParam(required = false) String bleh)  {
		System.out.printf("Received values are: %s and %s and %s\n", 
		studentId, susId, bleh != null ? bleh : "null query param");
	}

	@DeleteMapping("/{studentId}")
	public void deleteStudent(@PathVariable Long studentId) {
		studentService.deleteStudent(studentId);
	}

	@PutMapping("/{studentId}")
	public void updateStudentName(@PathVariable Long studentId,
								  @RequestParam(required = false) String name) {
		studentService.updateStudent(studentId, name);
	}
}