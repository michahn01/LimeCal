package com.limecal.scheduler.Attendee;

import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import java.util.List;
import java.util.Optional;

import com.limecal.scheduler.Event.Event;
import org.springframework.stereotype.Component;

@Component
public class AttendeeDAO {
    private JdbcTemplate jdbcTemplate;

    public AttendeeDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    RowMapper<Attendee> rowMapper = (rs, rowNum) -> {
        Attendee attendee = new Attendee();
        attendee.setId(rs.getLong("id"));
        attendee.setUsername(rs.getString("username"));
        return attendee;
    };

    @SuppressWarnings("null")
    public Optional<Attendee> getAttendee(Long event_id, String username) {
        String sql = "SELECT id, username FROM attendee WHERE event_id = ? AND username = ?";
        List<Attendee> res = jdbcTemplate.query(sql, rowMapper, event_id, username);
        if (res.isEmpty()) {
            return Optional.ofNullable(null);
        }
        return Optional.ofNullable(res.get(0));
    }

    // requirements: event corresponding to attendee.getEventId() 
    // must not already have an attendee of attendee.getUsername()
    public void create(String attendee_name, Long event_id) {
        String query = "INSERT INTO attendee (username, event_id) VALUES (?, ?)";
        jdbcTemplate.update(query, attendee_name, event_id);
    }

    RowMapper<String> timeIntervalRowMapper = (rs, rowNum) -> {
        String time_interval = "";
        time_interval += (rs.getString("start_time"));
        time_interval += "~";
        time_interval += (rs.getString("end_time"));
        return time_interval;
    };

    @SuppressWarnings("null")
    public List<String> fetchAvailableTimes(Attendee attendee) {
        String sql = "SELECT start_time, end_time FROM time_interval WHERE attendee_id = ?";
        return jdbcTemplate.query(sql, timeIntervalRowMapper, attendee.getId());
    }

    RowMapper<Event> eventRowMapper = (rs, rowNum) -> {
        Event event = new Event();
        event.setId(rs.getLong("id"));
        return event;
    };
    @SuppressWarnings("null")
    public Optional<Event> getByPublicId(String public_id) {
        String sql = "SELECT id FROM event WHERE public_id = ?";
        Event event = null;

        try {
            if (rowMapper != null)
            event = jdbcTemplate.queryForObject(sql, eventRowMapper, public_id);

        }
        catch(DataAccessException ex) {
           // todo: add some logging
        }

        return Optional.ofNullable(event);
    }

    public void deleteTimes(Long attendee_id, List<String> times) {
        String sql = "DELETE FROM time_interval WHERE attendee_id = ? AND start_time = ? AND end_time = ?";
        for (String interval : times) {
            String[] range = interval.split("~");
            jdbcTemplate.update(sql, attendee_id, range[0], range[1]);
        }
    }
    public void addTimes(Long attendee_id, List<String> times) {
        String sql = "INSERT INTO time_interval (attendee_id, start_time, end_time) VALUES (?, ?, ?)";
        for (String interval : times) {
            String[] range = interval.split("~");
            jdbcTemplate.update(sql, attendee_id, range[0], range[1]);
        }
    }
}
