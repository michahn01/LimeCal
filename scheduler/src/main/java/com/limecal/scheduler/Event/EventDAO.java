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
import java.util.List;
import java.util.Optional;

import javax.swing.text.html.Option;

@Component
public class EventDAO implements DAO<Event> {

    private JdbcTemplate jdbcTemplate;

    public EventDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    RowMapper<Event> rowMapper = (rs, rowNum) -> {
        Event event = new Event();
        event.setId(rs.getLong("id"));
        event.setPublicId(rs.getString("public_id"));
        event.setTitle(rs.getString("title"));
        return event;
    };

    @Override
    public List<Event> list() {
        String sql = "SELECT title, id, public_id FROM event";
        if (rowMapper != null) {
            List<Event> events = jdbcTemplate.query(sql, rowMapper);
            for (Event event : events) {
                setDatesForEvent(event);
            }
            return events;
        }
        return new ArrayList<Event>();
    }

    public Long addEventAndGetId(Event event) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        String sql = "INSERT INTO event (title) VALUES (?)";

        jdbcTemplate.update(
            new PreparedStatementCreator() {
                @Override
                public PreparedStatement createPreparedStatement(Connection connection) throws SQLException {
                    PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
                    ps.setString(1, event.getTitle());
                    return ps;
                }
            }, keyHolder);

        Map<String, Object> data = keyHolder.getKeys();
        Object inserted_id = data.getOrDefault("id", -1);
        if (inserted_id instanceof Number)
        return ((Number) inserted_id).longValue();
        return null;
        
    }

    @Override
    public void create(Event event) {
        Long event_id = addEventAndGetId(event);

        List<String> dates = event.getDates();

        for (String date : dates) {
            String query = "INSERT INTO date (date_value, event_id) VALUES (?, ?)";
            jdbcTemplate.update(query, date, event_id);
        }
    }

    @Override
    public Optional<Event> get(int id) {
        String sql = "SELECT title, id, public_id FROM event WHERE id = ?";
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
        String sql = "SELECT title, id, public_id FROM event WHERE public_id = ?";
        Event event = null;
        try {
            if (rowMapper != null)
            event = jdbcTemplate.queryForObject(sql, rowMapper, public_id);
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
}
