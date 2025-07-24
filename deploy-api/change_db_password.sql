-- Change Supabase Database Password
-- Run this in the Supabase SQL Editor

-- 1. Change the password for your database user
ALTER USER postgres WITH PASSWORD 'your-new-secure-password-here';

-- 2. If you have a specific app user (recommended), change it too
ALTER USER puo_app_user WITH PASSWORD 'your-new-app-password-here';

-- 3. Verify the change worked by trying to connect with new password
-- You'll need to update your connection strings after this

-- Note: Make sure your new password:
-- - Is at least 16 characters long
-- - Contains uppercase and lowercase letters
-- - Contains numbers and special characters
-- - Is not similar to the exposed password