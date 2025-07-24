-- Row Level Security (RLS) policies for multi-tenant data isolation

-- Enable RLS on all relevant tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_entities ENABLE ROW LEVEL SECURITY;

-- Create a function to get current user_id from JWT or API key
CREATE OR REPLACE FUNCTION auth.user_id() 
RETURNS UUID AS $$
BEGIN
    -- This will be set by the application when authenticating
    RETURN current_setting('app.current_user_id', true)::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users table policies
-- Users can only see and update their own record
CREATE POLICY users_select_policy ON users
    FOR SELECT USING (id = auth.user_id());

CREATE POLICY users_update_policy ON users
    FOR UPDATE USING (id = auth.user_id());

-- API keys policies
-- Users can only manage their own API keys
CREATE POLICY api_keys_select_policy ON api_keys
    FOR SELECT USING (user_id = auth.user_id());

CREATE POLICY api_keys_insert_policy ON api_keys
    FOR INSERT WITH CHECK (user_id = auth.user_id());

CREATE POLICY api_keys_update_policy ON api_keys
    FOR UPDATE USING (user_id = auth.user_id());

CREATE POLICY api_keys_delete_policy ON api_keys
    FOR DELETE USING (user_id = auth.user_id());

-- Usage logs policies
-- Users can only see their own usage logs
CREATE POLICY usage_logs_select_policy ON usage_logs
    FOR SELECT USING (user_id = auth.user_id());

CREATE POLICY usage_logs_insert_policy ON usage_logs
    FOR INSERT WITH CHECK (user_id = auth.user_id());

-- Memory entities policies
-- Users can only access their own memories
CREATE POLICY memory_entities_select_policy ON memory_entities
    FOR SELECT USING (user_id = auth.user_id());

CREATE POLICY memory_entities_insert_policy ON memory_entities
    FOR INSERT WITH CHECK (user_id = auth.user_id());

CREATE POLICY memory_entities_update_policy ON memory_entities
    FOR UPDATE USING (user_id = auth.user_id());

CREATE POLICY memory_entities_delete_policy ON memory_entities
    FOR DELETE USING (user_id = auth.user_id());

-- Create service role that bypasses RLS for admin operations
CREATE ROLE puo_memo_service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO puo_memo_service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO puo_memo_service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO puo_memo_service_role;

-- Create application role with RLS enforcement
CREATE ROLE puo_memo_app_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO puo_memo_app_role;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO puo_memo_app_role;

-- Function to set the current user context for RLS
CREATE OR REPLACE FUNCTION set_current_user_id(user_id UUID)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_user_id', user_id::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Subscription tier limits
CREATE OR REPLACE FUNCTION check_memory_limit()
RETURNS TRIGGER AS $$
DECLARE
    user_tier VARCHAR(50);
    user_memory_count INTEGER;
    monthly_limit INTEGER;
BEGIN
    -- Get user's subscription tier and current count
    SELECT subscription_tier, monthly_memory_count 
    INTO user_tier, user_memory_count
    FROM users 
    WHERE id = NEW.user_id;
    
    -- Set limits based on tier
    CASE user_tier
        WHEN 'free' THEN monthly_limit := 1000;
        WHEN 'pro' THEN monthly_limit := 10000;
        WHEN 'enterprise' THEN monthly_limit := 100000;
        ELSE monthly_limit := 1000;
    END CASE;
    
    -- Check if user exceeds limit
    IF user_memory_count >= monthly_limit THEN
        RAISE EXCEPTION 'Monthly memory limit exceeded. Current tier: %, Limit: %', user_tier, monthly_limit;
    END IF;
    
    -- Increment counters
    UPDATE users 
    SET memory_count = memory_count + 1,
        monthly_memory_count = monthly_memory_count + 1
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce memory limits
CREATE TRIGGER enforce_memory_limit
    BEFORE INSERT ON memory_entities
    FOR EACH ROW
    EXECUTE FUNCTION check_memory_limit();