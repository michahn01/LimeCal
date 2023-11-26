package com.limecal.scheduler.Event;

import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;



@Service
public class EventService {
    private final EventDAO eventDAO;

    public EventService(EventDAO eventDAO) {
        this.eventDAO = eventDAO;
    }

    public Map<String, String> getEventByPublicID(String public_id) {
        Optional<Event> event = eventDAO.getByPublicId(public_id);
        if (!event.isPresent()) {
            throw new NoSuchElementException("Item with public id: " + public_id + " does not exist.");
        }

        // "event_info" contains *all* inforation about an event
        // such as attendees and when they're available, in addition
        // to basic identifying information held in an Event object.
        Map<String, String> event_info = new HashMap<>();
        event_info.put("title", event.get().getTitle());
        event_info.put("public_id", public_id);
        

        return event_info;
    }

}
