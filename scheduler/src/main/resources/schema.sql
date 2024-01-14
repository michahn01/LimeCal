CREATE TABLE event (
    id BIGSERIAL PRIMARY KEY,
    title varchar(255) NOT NULL,
    public_id UUID DEFAULT uuid_generate_v4(),
    UNIQUE(public_id)
);
CREATE TABLE date (
    id BIGSERIAL PRIMARY KEY,
    date_value varchar(10) NOT NULL,
    event_id BIGINT REFERENCES event(id),
    UNIQUE(date_value, event_id)
);