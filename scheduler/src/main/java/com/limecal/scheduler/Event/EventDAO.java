package com.limecal.scheduler.Event;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

import org.springframework.jdbc.core.PreparedStatementCreator;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;

import com.limecal.scheduler.dao.DAO;

import java.util.Map;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.sqids.Sqids;

import com.limecal.scheduler.Attendee.Attendee;


@Component
public class EventDAO implements DAO<Event> {

    private JdbcTemplate jdbcTemplate;
    Sqids sqids;
    Long last_seen_id;

    public EventDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        this.sqids = Sqids.builder()
                    .minLength(5)
                    .build();
        this.last_seen_id = 0L;
    }

    RowMapper<Event> rowMapper = (rs, rowNum) -> {
        Event event = new Event();
        event.setId(rs.getLong("id"));
        event.setPublicId(rs.getString("public_id"));
        event.setTitle(rs.getString("title"));
        event.setStartTime(rs.getString("start_time"));
        event.setEndTime(rs.getString("end_time"));
        event.setTimezone(rs.getString("timezone"));
        return event;
    };

    @Override
    public List<Event> list() {
        String sql = "SELECT title, id, public_id, start_time, end_time, timezone FROM event";
        if (rowMapper != null) {
            List<Event> events = jdbcTemplate.query(sql, rowMapper);
            for (Event event : events) {
                setDatesForEvent(event);
            }
            return events;
        }
        return new ArrayList<Event>();
    }

    @SuppressWarnings("null")
    public void addEventAndGetIDs(Event event) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        String sql = "INSERT INTO event (title, public_id, start_time, end_time, timezone) VALUES (?, ?, ?, ?, ?)";
        String public_id = sqids.encode(Arrays.asList(System.currentTimeMillis(), last_seen_id + 1L));
        jdbcTemplate.update(
            new PreparedStatementCreator() {
                @Override
                public PreparedStatement createPreparedStatement(Connection connection) throws SQLException {
                    PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
                    ps.setString(1, event.getTitle());
                    ps.setString(2, public_id);
                    ps.setString(3, event.getStartTime());
                    ps.setString(4, event.getEndTime());
                    ps.setString(5, event.getTimezone());
                    return ps;
                }
            }, keyHolder);

        Map<String, Object> data = keyHolder.getKeys();
        Object inserted_id = data.getOrDefault("id", -1);
        if (inserted_id instanceof Number) {
            Long id = ((Number) inserted_id).longValue();
            last_seen_id = id;

            event.setId(id);
            event.setPublicId(public_id);
        }        
    }

    @Override
    public void create(Event event) {
        addEventAndGetIDs(event);

        List<String> dates = event.getDates();

        for (String date : dates) {
            String query = "INSERT INTO date (date_value, event_id) VALUES (?, ?)";
            jdbcTemplate.update(query, date, event.getId());
        }
    }

    @Override
    public Optional<Event> get(int id) {
        String sql = "SELECT title, id, public_id, start_time, end_time, timezone FROM event WHERE id = ?";
        Event event = null;
        try {
            if (rowMapper != null)
            event = jdbcTemplate.queryForObject(sql, rowMapper, id);
        }
        catch(DataAccessException ex) {
           // todo: add some logging
        }

        return Optional.ofNullable(event);
    }
    public Optional<Event> getByPublicId(String public_id) {
        String sql = "SELECT title, id, public_id, start_time, end_time, timezone FROM event WHERE public_id = ?";
        Event event = null;
        try {
            if (rowMapper != null)
            event = jdbcTemplate.queryForObject(sql, rowMapper, public_id);

            setDatesForEvent(event);
        }
        catch(DataAccessException ex) {
           // todo: add some logging
        }

        return Optional.ofNullable(event);
    }

    @Override
    public int update(Event event, int id) {
        String sql = "UPDATE event SET title = ? WHERE id = ?";
        int update = jdbcTemplate.update(sql, event.getTitle(), id);
        return update;
    }

    @Override
    public void delete(int id) {
        jdbcTemplate.update("DELETE FROM event WHERE id = ?", id);
    }

    RowMapper<String> dateRowMapper = (rs, rowNum) -> {
        return rs.getString("date_value");
    };
    public void setDatesForEvent(Event event) {
        String query = "SELECT date_value FROM date WHERE event_id = ?";
        Long event_id = event.getId();

        if (dateRowMapper != null) {
            List<String> dates = jdbcTemplate.query(query, dateRowMapper, event_id);
            // System.out.println(dates);
            event.setDates(dates);
        }
    }

    // public List<Attendee> getAllAttendees() {

    // }
}
