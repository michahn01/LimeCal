package com.limecal.scheduler.Attendee;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.ArrayList;
import java.util.Optional;
import java.util.Set;
import java.util.HashSet;
import com.limecal.scheduler.Event.Event;



@Service
public class AttendeeService {
    private final AttendeeDAO attendeeDAO;

    public AttendeeService(AttendeeDAO attendeeDAO) {
        this.attendeeDAO = attendeeDAO;
    }

    public List<String> fetchAttendeeTimes(String attendee_name, String event_public_id) {
        Optional<Event> event = attendeeDAO.getByPublicId(event_public_id);
        if (!event.isPresent()) {
            throw new NoSuchElementException("Item with public id: " + event_public_id + " does not exist.");
        }

        // important: even if the specified attendee exists, "res" won't contain their available dates, 
        // which must be retrieved manually and separately.

        Optional<Attendee> res = attendeeDAO.getAttendee(event.get().getId(), attendee_name);
        if (res.isPresent()) {
            return attendeeDAO.fetchAvailableTimes(res.get());
        }
        attendeeDAO.create(attendee_name, event.get().getId());
        return new ArrayList<String>();
    }

    @Transactional
    public void updateAttendeeTimes(Attendee attendee) {
        List<String> new_times = attendee.getAvailableTimes();
        if (new_times == null) return;

        Optional<Event> event = attendeeDAO.getByPublicId(attendee.getEventPublicId());
        if (!event.isPresent()) {
            throw new NoSuchElementException("Item with public id: " + attendee.getEventPublicId() + " does not exist.");
        }
        Optional<Attendee> res = attendeeDAO.getAttendee(event.get().getId(), attendee.getUsername());
        if (!res.isPresent()) {
            throw new NoSuchElementException("Attendee with name: " + attendee.getUsername() + 
                                            " does not exist for " + attendee.getEventPublicId());
        }
        attendee.setId(res.get().getId());
        List<String> old_times = attendeeDAO.fetchAvailableTimes(attendee);


        Set<String> new_set = new HashSet<String>(new_times);
        Set<String> old_set = new HashSet<String>(old_times);

        List<String> add_times = new ArrayList<>();
        List<String> delete_times = new ArrayList<>();

        for (String time : new_times) {
            if (!old_set.contains(time)) {
                add_times.add(time);
            }
        }   
        for (String time : old_times) {
            if (!new_set.contains(time)) {
                delete_times.add(time);
            }
        }

        attendeeDAO.addTimes(attendee.getId(), add_times);
        attendeeDAO.deleteTimes(attendee.getId(), delete_times);
    }
}
