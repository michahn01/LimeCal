INSERT INTO event (title, password_hash) VALUES ('Test Event 1', NULL);
INSERT INTO event (title, password_hash) VALUES ('Test Event 2', crypt('new_password', gen_salt('bf')));
