package com.limecal.scheduler.Event;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
// import org.springframework.web.bind.annotation.CrossOrigin;
import jakarta.validation.Valid;

@RestController
@RequestMapping(path = "api/v1/event")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
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
}