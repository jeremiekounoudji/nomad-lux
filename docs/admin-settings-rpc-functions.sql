-- ================================================
-- NOMAD LUX - ADMIN SETTINGS RPC FUNCTIONS
-- ================================================

-- ================================================
-- 1. GET ALL SETTINGS BY CATEGORY
-- ================================================

CREATE OR REPLACE FUNCTION get_admin_settings(
    category_filter setting_category_enum DEFAULT NULL,
    include_encrypted BOOLEAN DEFAULT FALSE
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Security check: Only admins can access
    IF NOT (auth.jwt() ->> 'role' IN ('admin', 'super_admin')) THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;
    
    WITH settings_data AS (
        SELECT 
            category,
            json_object_agg(
                setting_key,
                CASE 
                    WHEN is_encrypted = true AND include_encrypted = false THEN 
                        json_build_object('encrypted', true, 'hidden', true)
                    ELSE setting_value
                END
            ) as category_settings
        FROM admin_settings 
        WHERE (category_filter IS NULL OR category = category_filter)
        GROUP BY category
    )
    SELECT json_object_agg(category, category_settings) INTO result
    FROM settings_data;
    
    RETURN COALESCE(result, '{}'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- 2. GET SINGLE SETTING
-- ================================================

CREATE OR REPLACE FUNCTION get_admin_setting(
    setting_category setting_category_enum,
    setting_key TEXT,
    decrypt_value BOOLEAN DEFAULT FALSE
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    setting_record admin_settings%ROWTYPE;
BEGIN
    -- Security check
    IF NOT (auth.jwt() ->> 'role' IN ('admin', 'super_admin')) THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;
    
    SELECT * INTO setting_record 
    FROM admin_settings 
    WHERE category = setting_category AND setting_key = setting_key;
    
    IF NOT FOUND THEN
        RETURN json_build_object('error', 'Setting not found');
    END IF;
    
    -- Handle encrypted settings
    IF setting_record.is_encrypted AND decrypt_value THEN
        -- TODO: Implement decryption logic
        RETURN json_build_object('encrypted', true, 'requires_decryption', true);
    END IF;
    
    RETURN json_build_object(
        'category', setting_record.category,
        'key', setting_record.setting_key,
        'value', setting_record.setting_value,
        'type', setting_record.data_type,
        'description', setting_record.description,
        'is_encrypted', setting_record.is_encrypted,
        'updated_at', setting_record.updated_at
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- 3. UPDATE SINGLE SETTING WITH AUDIT TRAIL
-- ================================================

CREATE OR REPLACE FUNCTION update_admin_setting(
    setting_category setting_category_enum,
    setting_key TEXT,
    new_value JSONB,
    setting_description TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    old_value JSONB;
    admin_user_id UUID;
    result JSON;
    setting_exists BOOLEAN := FALSE;
BEGIN
    -- Security check
    IF NOT (auth.jwt() ->> 'role' IN ('admin', 'super_admin')) THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;
    
    -- Get current admin user
    admin_user_id := auth.uid();
    
    -- Check if setting exists and get old value for audit
    SELECT setting_value, true INTO old_value, setting_exists
    FROM admin_settings 
    WHERE category = setting_category AND setting_key = setting_key;
    
    -- Update or insert setting
    INSERT INTO admin_settings (
        category, setting_key, setting_value, data_type, 
        description, updated_by, updated_at, created_by, created_at
    ) VALUES (
        setting_category, setting_key, new_value,
        CASE jsonb_typeof(new_value)
            WHEN 'string' THEN 'string'
            WHEN 'number' THEN 'number'
            WHEN 'boolean' THEN 'boolean'
            WHEN 'array' THEN 'array'
            WHEN 'object' THEN 'object'
            ELSE 'string'
        END,
        COALESCE(setting_description, 'Admin setting'),
        admin_user_id, NOW(), admin_user_id, NOW()
    )
    ON CONFLICT (category, setting_key) 
    DO UPDATE SET 
        setting_value = EXCLUDED.setting_value,
        data_type = EXCLUDED.data_type,
        description = COALESCE(EXCLUDED.description, admin_settings.description),
        updated_by = admin_user_id,
        updated_at = NOW();
    
    -- Create audit entry if setting existed (update) or log creation
    INSERT INTO admin_activities (
        admin_id, activity_type, entity_type, entity_id,
        action_description, old_values, new_values
    ) VALUES (
        admin_user_id, 
        CASE WHEN setting_exists THEN 'update' ELSE 'create' END,
        'admin_setting', 
        gen_random_uuid()::text,
        CASE WHEN setting_exists THEN 
            'Updated setting: ' || setting_category::text || '.' || setting_key
        ELSE
            'Created setting: ' || setting_category::text || '.' || setting_key
        END,
        CASE WHEN setting_exists THEN 
            jsonb_build_object('old_value', old_value)
        ELSE 
            '{}'::jsonb
        END,
        jsonb_build_object('new_value', new_value)
    );
    
    RETURN json_build_object(
        'success', true,
        'category', setting_category,
        'setting_key', setting_key,
        'action', CASE WHEN setting_exists THEN 'updated' ELSE 'created' END,
        'updated_at', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- 4. BULK SETTINGS UPDATE
-- ================================================

CREATE OR REPLACE FUNCTION update_admin_settings_bulk(
    settings_data JSONB
)
RETURNS JSON AS $$
DECLARE
    category_key TEXT;
    setting_key TEXT;
    setting_value JSONB;
    updated_count INTEGER := 0;
    error_count INTEGER := 0;
    errors TEXT[] := '{}';
BEGIN
    -- Security check
    IF NOT (auth.jwt() ->> 'role' IN ('admin', 'super_admin')) THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;
    
    -- Iterate through categories
    FOR category_key IN SELECT jsonb_object_keys(settings_data)
    LOOP
        -- Validate category exists
        BEGIN
            -- Iterate through settings in each category
            FOR setting_key, setting_value IN 
                SELECT * FROM jsonb_each(settings_data -> category_key)
            LOOP
                BEGIN
                    PERFORM update_admin_setting(
                        category_key::setting_category_enum,
                        setting_key,
                        setting_value
                    );
                    updated_count := updated_count + 1;
                EXCEPTION WHEN OTHERS THEN
                    error_count := error_count + 1;
                    errors := array_append(errors, 
                        'Error updating ' || category_key || '.' || setting_key || ': ' || SQLERRM);
                END;
            END LOOP;
        EXCEPTION WHEN OTHERS THEN
            error_count := error_count + 1;
            errors := array_append(errors, 
                'Error processing category ' || category_key || ': ' || SQLERRM);
        END;
    END LOOP;
    
    RETURN json_build_object(
        'success', error_count = 0,
        'updated_count', updated_count,
        'error_count', error_count,
        'errors', errors,
        'timestamp', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- 5. RESET SETTINGS TO DEFAULT
-- ================================================

CREATE OR REPLACE FUNCTION reset_admin_settings(
    category_filter setting_category_enum DEFAULT NULL,
    confirm_reset BOOLEAN DEFAULT FALSE
)
RETURNS JSON AS $$
DECLARE
    reset_count INTEGER := 0;
    admin_user_id UUID;
BEGIN
    -- Security check
    IF NOT (auth.jwt() ->> 'role' IN ('super_admin')) THEN
        RAISE EXCEPTION 'Unauthorized: Super admin access required for reset operations';
    END IF;
    
    -- Safety check
    IF NOT confirm_reset THEN
        RAISE EXCEPTION 'Reset confirmation required. Set confirm_reset to true.';
    END IF;
    
    admin_user_id := auth.uid();
    
    -- Log the reset action
    INSERT INTO admin_activities (
        admin_id, activity_type, entity_type, entity_id,
        action_description, old_values, new_values
    ) VALUES (
        admin_user_id, 'delete', 'admin_setting', gen_random_uuid()::text,
        'Reset settings for category: ' || COALESCE(category_filter::text, 'ALL'),
        jsonb_build_object('category_filter', category_filter),
        jsonb_build_object('reset_timestamp', NOW())
    );
    
    -- Delete non-system settings (will be recreated with defaults)
    DELETE FROM admin_settings 
    WHERE is_system_setting = false
    AND (category_filter IS NULL OR category = category_filter);
    
    GET DIAGNOSTICS reset_count = ROW_COUNT;
    
    RETURN json_build_object(
        'success', true,
        'reset_count', reset_count,
        'message', 'Settings reset to defaults. System settings preserved.',
        'timestamp', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- 6. GET SETTINGS CHANGE HISTORY
-- ================================================

CREATE OR REPLACE FUNCTION get_admin_settings_history(
    category_filter setting_category_enum DEFAULT NULL,
    limit_count INTEGER DEFAULT 50,
    offset_count INTEGER DEFAULT 0
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    total_count INTEGER;
BEGIN
    -- Security check
    IF NOT (auth.jwt() ->> 'role' IN ('admin', 'super_admin')) THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;
    
    -- Get total count
    SELECT COUNT(*) INTO total_count
    FROM admin_activities
    WHERE entity_type = 'admin_setting'
    AND (category_filter IS NULL OR action_description LIKE '%' || category_filter::text || '.%');
    
    -- Get paginated history
    SELECT json_build_object(
        'data', json_agg(
            json_build_object(
                'id', id,
                'admin_id', admin_id,
                'activity_type', activity_type,
                'action_description', action_description,
                'old_values', old_values,
                'new_values', new_values,
                'created_at', created_at
            ) ORDER BY created_at DESC
        ),
        'total_count', total_count,
        'limit', limit_count,
        'offset', offset_count
    ) INTO result
    FROM (
        SELECT *
        FROM admin_activities
        WHERE entity_type = 'admin_setting'
        AND (category_filter IS NULL OR action_description LIKE '%' || category_filter::text || '.%')
        ORDER BY created_at DESC
        LIMIT limit_count OFFSET offset_count
    ) filtered_activities;
    
    RETURN COALESCE(result, json_build_object('data', '[]'::json, 'total_count', 0));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- 7. VALIDATE SETTINGS
-- ================================================

CREATE OR REPLACE FUNCTION validate_admin_settings()
RETURNS JSON AS $$
DECLARE
    validation_errors TEXT[] := '{}';
    result JSON;
    setting_record admin_settings%ROWTYPE;
BEGIN
    -- Security check
    IF NOT (auth.jwt() ->> 'role' IN ('admin', 'super_admin')) THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;
    
    -- Check for required settings
    FOR setting_record IN 
        SELECT * FROM admin_settings WHERE is_system_setting = true
    LOOP
        -- Validate based on setting type and constraints
        CASE setting_record.setting_key
            WHEN 'siteName' THEN
                IF length(setting_record.setting_value #>> '{}') < 1 THEN
                    validation_errors := array_append(validation_errors, 'Site name cannot be empty');
                END IF;
            WHEN 'contactEmail' THEN
                IF NOT (setting_record.setting_value #>> '{}') ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
                    validation_errors := array_append(validation_errors, 'Invalid contact email format');
                END IF;
            WHEN 'commissionRate' THEN
                IF (setting_record.setting_value #>> '{}')::numeric < 0 OR (setting_record.setting_value #>> '{}')::numeric > 50 THEN
                    validation_errors := array_append(validation_errors, 'Commission rate must be between 0 and 50');
                END IF;
            -- Add more validations as needed
        END CASE;
    END LOOP;
    
    RETURN json_build_object(
        'valid', array_length(validation_errors, 1) IS NULL,
        'errors', validation_errors,
        'checked_at', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 