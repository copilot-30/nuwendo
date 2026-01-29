-- Seed data for development

-- Insert sample users
INSERT INTO users (username, email, password_hash) VALUES
    ('testuser1', 'user1@example.com', '$2b$10$example_hash_here'),
    ('testuser2', 'user2@example.com', '$2b$10$example_hash_here')
ON CONFLICT DO NOTHING;

-- Insert sample posts
INSERT INTO posts (user_id, title, content) VALUES
    (1, 'First Post', 'This is the first post content'),
    (1, 'Second Post', 'This is the second post content'),
    (2, 'Hello World', 'Hello from user 2')
ON CONFLICT DO NOTHING;
