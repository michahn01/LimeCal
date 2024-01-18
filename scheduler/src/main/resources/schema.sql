CREATE TABLE event (
    id BIGSERIAL PRIMARY KEY,
    title varchar(255) NOT NULL,
    public_id varchar(20) NOT NULL,
    UNIQUE(public_id),
    start_time varchar(5) NOT NULL,
    end_time varchar(5) NOT NULL,
    timezone varchar(60) NOT NULL
);
CREATE TABLE date (
    id BIGSERIAL PRIMARY KEY,
    date_value varchar(10) NOT NULL,
    event_id BIGINT REFERENCES event(id),
    UNIQUE(date_value, event_id)
);
CREATE TABLE attendee (
    id BIGSERIAL PRIMARY KEY,
    user_name varchar(150) NOT NULL,
    event_id BIGINT REFERENCES event(id),
    UNIQUE(user_name, event_id)
);