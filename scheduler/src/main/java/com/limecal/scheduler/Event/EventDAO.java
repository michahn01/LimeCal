package com.limecal.scheduler.Event;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

import com.limecal.scheduler.dao.DAO;

import java.util.List;
import java.util.Optional;

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
        return jdbcTemplate.query(sql, rowMapper);
    }

    @Override
    public void create(Event event) {
        String sql = "INSERT INTO event (title, password_hash) VALUES (?, crypt(?, gen_salt('bf')))";
        jdbcTemplate.update(sql, event.getTitle(), event.getPassword());
    }

    @Override
    public Optional<Event> get(int id) {
        String sql = "SELECT title, id, public_id FROM event WHERE id = ?";
        Event event = null;
        try {
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
            event = jdbcTemplate.queryForObject(sql, rowMapper, public_id);
        }
        catch(DataAccessException ex) {
           // todo: add some logging
        }

        return Optional.ofNullable(event);
    }

    @Override
    public int update(Event event, int id) {
        String sql = "UPDATE event SET title = ?, password_hash = crypt(?, gen_salt('bf')) WHERE id = ?";
        int update = jdbcTemplate.update(sql, event.getTitle(), event.getPassword(), id);
        return update;
    }

    @Override
    public void delete(int id) {
        jdbcTemplate.update("DELETE FROM event WHERE id = ?", id);
    }
}
