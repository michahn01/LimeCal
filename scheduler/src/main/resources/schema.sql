CREATE TABLE event (
    title varchar(255) NOT NULL,
    id BIGSERIAL PRIMARY KEY,
    public_id UUID DEFAULT uuid_generate_v4(),
    UNIQUE(public_id)
);

-- passwords for event links are *optional*