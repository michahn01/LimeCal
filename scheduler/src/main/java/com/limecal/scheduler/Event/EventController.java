package com.limecal.scheduler.Event;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import jakarta.validation.Valid;


@CrossOrigin(
    origins = {
        "*"
        })
@RestController
@RequestMapping(path = "api/v1/event")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

	// for Development
	@GetMapping(path = "")
	public ResponseEntity<Map<String, Event>> getAllEvents() {
        return new ResponseEntity<>
		(eventService.getAllEvents(), HttpStatus.OK);
	}

	
	@GetMapping(path = "/{public_id}")
	public ResponseEntity<Map<String, Object>> getEvent(@PathVariable String public_id) {
        return ResponseEntity.ok(eventService.getEventByPublicID(public_id));
	}

	@PostMapping
	public ResponseEntity<Map<String, Object>> registerNewEvent(@Valid @RequestBody Event event) {
		eventService.createEvent(event);
		Map<String, Object> response = new HashMap<>();
		response.put("Message", "Event added.");
		response.put("title", event.getTitle());
		response.put("public_id", event.getPublicId());
		response.put("dates", event.getDates());
		response.put("start_time", event.getStartTime());
		response.put("end_time", event.getEndTime());
		response.put("timezone", event.getTimezone());
        return ResponseEntity.ok(response);
	}

	// @DeleteMapping("/something/{eventId}/another/{susId}")
	// public void paramPassing(@PathVariable String eventId,
	// 						 @PathVariable String susId,
	// 						 @RequestParam(required = false) String bleh)  {
	// 	System.out.printf("Received values are: %s and %s and %s\n", 
	// 	eventId, susId, bleh != null ? bleh : "null query param");
	// }

	@PutMapping("/{eventId}")
	public void updateEventName(@PathVariable Long eventId,
								@RequestParam(required = false) String name) {
		// function below not yet implemented
		eventService.updateEvent(eventId, name);
	}
}