-- ================================================
-- NOMAD LUX - PROPERTY SUBMISSION & APPROVAL FUNCTIONS
-- ================================================

-- ================================================
-- 1. SUBMIT PROPERTY
-- ================================================

create or replace function submit_property(
    p_title text,
    p_description text,
    p_price_per_night decimal,
    p_location jsonb,
    p_amenities text[],
    p_images text[],
    p_video text
) returns jsonb as $$
declare
    v_property_id uuid;
    v_host_id uuid;
begin
    -- Security check: Only authenticated users can submit properties
    if auth.uid() is null then
        raise exception 'Unauthorized: Authentication required';
    end if;

    -- Get host ID
    v_host_id := auth.uid();

    -- Validate inputs
    if array_length(p_images, 1) < 4 then
        raise exception 'Validation error: Minimum 4 images required';
    end if;

    if p_price_per_night <= 0 then
        raise exception 'Validation error: Price must be greater than 0';
    end if;

    -- Insert property
    insert into properties (
        host_id,
        title,
        description,
        price_per_night,
        location,
        amenities,
        images,
        video,
        status
    ) values (
        v_host_id,
        p_title,
        p_description,
        p_price_per_night,
        p_location,
        p_amenities,
        p_images,
        p_video,
        'pending'
    ) returning id into v_property_id;

    -- Return property details
    return jsonb_build_object(
        'id', v_property_id,
        'status', 'pending',
        'created_at', now(),
        'host_id', v_host_id
    );
end;
$$ language plpgsql security definer;

-- ================================================
-- 2. GET PROPERTY DETAILS
-- ================================================

create or replace function get_property_details(
    p_property_id uuid
) returns jsonb as $$
declare
    v_property properties;
    v_is_admin boolean;
    v_is_owner boolean;
begin
    -- Check if user is admin
    v_is_admin := (auth.jwt() ->> 'role') = 'admin';
    
    -- Get property
    select * into v_property
    from properties
    where id = p_property_id;

    if not found then
        raise exception 'Property not found';
    end if;

    -- Check if user is property owner
    v_is_owner := v_property.host_id = auth.uid();

    -- Check access permissions
    if not (v_is_admin or v_is_owner or v_property.status = 'approved') then
        raise exception 'Insufficient permissions';
    end if;

    -- Return property details
    return to_jsonb(v_property);
end;
$$ language plpgsql security definer;

-- ================================================
-- 3. UPDATE PENDING PROPERTY
-- ================================================

create or replace function update_pending_property(
    p_property_id uuid,
    p_updates jsonb
) returns jsonb as $$
declare
    v_property properties;
    v_is_admin boolean;
begin
    -- Check if user is admin
    v_is_admin := (auth.jwt() ->> 'role') = 'admin';

    -- Get property
    select * into v_property
    from properties
    where id = p_property_id;

    if not found then
        raise exception 'Property not found';
    end if;

    -- Check permissions
    if not (v_is_admin or (v_property.host_id = auth.uid() and v_property.status = 'pending')) then
        raise exception 'Insufficient permissions';
    end if;

    -- Update property
    update properties
    set
        title = coalesce((p_updates->>'title')::text, title),
        description = coalesce((p_updates->>'description')::text, description),
        price_per_night = coalesce((p_updates->>'price_per_night')::decimal, price_per_night),
        location = coalesce((p_updates->>'location')::jsonb, location),
        amenities = coalesce((p_updates->>'amenities')::text[], amenities),
        images = coalesce((p_updates->>'images')::text[], images),
        video = coalesce((p_updates->>'video')::text, video),
        updated_at = now()
    where id = p_property_id
    returning to_jsonb(*) into v_property;

    return v_property;
end;
$$ language plpgsql security definer;

-- ================================================
-- 4. APPROVE PROPERTY
-- ================================================

create or replace function approve_property(
    p_property_id uuid
) returns jsonb as $$
declare
    v_property properties;
begin
    -- Security check: Only admins can approve properties
    if (auth.jwt() ->> 'role') != 'admin' then
        raise exception 'Unauthorized: Admin access required';
    end if;

    -- Get property
    select * into v_property
    from properties
    where id = p_property_id;

    if not found then
        raise exception 'Property not found';
    end if;

    -- Check if property is pending
    if v_property.status != 'pending' then
        raise exception 'Invalid status: Only pending properties can be approved';
    end if;

    -- Update property status
    update properties
    set
        status = 'approved',
        approved_at = now(),
        approved_by = auth.uid(),
        updated_at = now()
    where id = p_property_id
    returning to_jsonb(*) into v_property;

    return v_property;
end;
$$ language plpgsql security definer;

-- ================================================
-- 5. REJECT PROPERTY
-- ================================================

create or replace function reject_property(
    p_property_id uuid,
    p_rejection_reason text
) returns jsonb as $$
declare
    v_property properties;
begin
    -- Security check: Only admins can reject properties
    if (auth.jwt() ->> 'role') != 'admin' then
        raise exception 'Unauthorized: Admin access required';
    end if;

    -- Get property
    select * into v_property
    from properties
    where id = p_property_id;

    if not found then
        raise exception 'Property not found';
    end if;

    -- Check if property is pending
    if v_property.status != 'pending' then
        raise exception 'Invalid status: Only pending properties can be rejected';
    end if;

    -- Update property status
    update properties
    set
        status = 'rejected',
        rejected_at = now(),
        rejected_by = auth.uid(),
        rejection_reason = p_rejection_reason,
        updated_at = now()
    where id = p_property_id
    returning to_jsonb(*) into v_property;

    return v_property;
end;
$$ language plpgsql security definer;

-- ================================================
-- 6. LIST PROPERTIES BY STATUS
-- ================================================

create or replace function list_properties_by_status(
    p_status text,
    p_page int default 1,
    p_per_page int default 10
) returns jsonb as $$
declare
    v_total_count int;
    v_properties jsonb;
    v_is_admin boolean;
begin
    -- Check if user is admin
    v_is_admin := (auth.jwt() ->> 'role') = 'admin';

    -- Validate status
    if p_status not in ('pending', 'approved', 'rejected') then
        raise exception 'Invalid status';
    end if;

    -- Check permissions for non-approved properties
    if p_status != 'approved' and not v_is_admin then
        raise exception 'Insufficient permissions';
    end if;

    -- Get total count
    select count(*) into v_total_count
    from properties
    where status = p_status;

    -- Get properties
    select jsonb_agg(to_jsonb(p))
    into v_properties
    from (
        select *
        from properties
        where status = p_status
        order by created_at desc
        limit p_per_page
        offset (p_page - 1) * p_per_page
    ) p;

    return jsonb_build_object(
        'data', coalesce(v_properties, '[]'::jsonb),
        'total_count', v_total_count,
        'page', p_page,
        'per_page', p_per_page
    );
end;
$$ language plpgsql security definer;

-- ================================================
-- 7. GET HOST PROPERTIES
-- ================================================

create or replace function get_host_properties(
    p_host_id uuid default null
) returns jsonb as $$
declare
    v_host_id uuid;
    v_properties jsonb;
    v_is_admin boolean;
begin
    -- Set host ID (use provided ID or current user ID)
    v_host_id := coalesce(p_host_id, auth.uid());
    
    -- Check if user is admin
    v_is_admin := (auth.jwt() ->> 'role') = 'admin';

    -- Check permissions
    if not (v_is_admin or v_host_id = auth.uid()) then
        raise exception 'Insufficient permissions';
    end if;

    -- Get properties
    select jsonb_agg(to_jsonb(p))
    into v_properties
    from (
        select *
        from properties
        where host_id = v_host_id
        order by created_at desc
    ) p;

    return coalesce(v_properties, '[]'::jsonb);
end;
$$ language plpgsql security definer;

-- ================================================
-- 8. GET PROPERTY STATISTICS
-- ================================================

create or replace function get_property_statistics(
    p_days int default 30
) returns jsonb as $$
declare
    v_stats jsonb;
    v_is_admin boolean;
begin
    -- Check if user is admin
    v_is_admin := (auth.jwt() ->> 'role') = 'admin';

    if not v_is_admin then
        raise exception 'Unauthorized: Admin access required';
    end if;

    select jsonb_build_object(
        'total_properties', count(*),
        'pending_properties', count(*) filter (where status = 'pending'),
        'approved_properties', count(*) filter (where status = 'approved'),
        'rejected_properties', count(*) filter (where status = 'rejected'),
        'recent_submissions', count(*) filter (where created_at >= now() - p_days * interval '1 day'),
        'recent_approvals', count(*) filter (where approved_at >= now() - p_days * interval '1 day'),
        'recent_rejections', count(*) filter (where rejected_at >= now() - p_days * interval '1 day')
    )
    into v_stats
    from properties;

    return v_stats;
end;
$$ language plpgsql security definer;

-- ================================================
-- NOMAD LUX - PROPERTY RPC FUNCTIONS FOR COMPLEX QUERIES
-- ================================================

-- Note: All insert/update/delete operations are handled through direct Supabase client calls
-- Only complex GET queries are implemented as RPC functions

-- ================================================
-- 1. LIST PROPERTIES BY STATUS WITH FILTERS
-- ================================================

create or replace function list_properties_by_status(
    p_status text,
    p_filters jsonb default null,
    p_page int default 1,
    p_per_page int default 10,
    p_sort_by text default 'created_at',
    p_sort_order text default 'desc'
) returns jsonb as $$
declare
    v_query text;
    v_result jsonb;
    v_total_count int;
    v_offset int;
begin
    -- Calculate offset
    v_offset := (p_page - 1) * p_per_page;

    -- Build base query
    v_query := 'select * from properties where status = $1';

    -- Apply filters if provided
    if p_filters is not null then
        -- Price range filter
        if p_filters->>'priceRange' is not null then
            v_query := v_query || format(
                ' and price_per_night between %s and %s',
                (p_filters->'priceRange'->>'min')::numeric,
                (p_filters->'priceRange'->>'max')::numeric
            );
        end if;

        -- Location filter (within radius)
        if p_filters->>'location' is not null then
            v_query := v_query || format(
                ' and ST_DWithin(
                    ST_MakePoint((location->''coordinates''->>''lng'')::float, (location->''coordinates''->>''lat'')::float)::geography,
                    ST_MakePoint(%s, %s)::geography,
                    %s * 1000
                )',
                (p_filters->'location'->>'lng')::float,
                (p_filters->'location'->>'lat')::float,
                (p_filters->'location'->>'radius')::float
            );
        end if;

        -- Amenities filter
        if p_filters->>'amenities' is not null and jsonb_array_length(p_filters->'amenities') > 0 then
            v_query := v_query || format(
                ' and amenities @> %L::text[]',
                (select array_agg(x.value) from jsonb_array_elements_text(p_filters->'amenities') x)
            );
        end if;

        -- Date range filter
        if p_filters->>'dateRange' is not null then
            v_query := v_query || format(
                ' and not exists (
                    select 1 from bookings
                    where property_id = properties.id
                    and (
                        (start_date, end_date) overlaps (%L::date, %L::date)
                    )
                )',
                (p_filters->'dateRange'->>'start')::date,
                (p_filters->'dateRange'->>'end')::date
            );
        end if;
    end if;

    -- Get total count
    execute format('select count(*) from (%s) as count_query', v_query)
    using p_status
    into v_total_count;

    -- Apply sorting and pagination
    v_query := v_query || format(
        ' order by %I %s limit %s offset %s',
        p_sort_by,
        p_sort_order,
        p_per_page,
        v_offset
    );

    -- Execute final query
    execute format('select jsonb_build_object(
        ''data'', coalesce(jsonb_agg(row_to_json(t)), ''[]''::jsonb),
        ''total_count'', %s,
        ''page'', %s,
        ''per_page'', %s
    ) from (%s) t', v_total_count, p_page, p_per_page, v_query)
    using p_status
    into v_result;

    return v_result;
end;
$$ language plpgsql security definer;

-- ================================================
-- 2. SEARCH PROPERTIES
-- ================================================

create or replace function search_properties(
    p_search_term text default null,
    p_filters jsonb default null,
    p_sort_by text default 'created_at',
    p_sort_order text default 'desc',
    p_page int default 1,
    p_per_page int default 20
) returns jsonb as $$
declare
    v_query text;
    v_result jsonb;
    v_total_count int;
    v_offset int;
begin
    -- Calculate offset
    v_offset := (p_page - 1) * p_per_page;

    -- Build base query with full text search if search term provided
    v_query := 'select * from properties where true';
    
    if p_search_term is not null then
        v_query := v_query || format(
            ' and (
                to_tsvector(''english'', title) @@ plainto_tsquery(''english'', %L)
                or to_tsvector(''english'', description) @@ plainto_tsquery(''english'', %L)
                or to_tsvector(''english'', location->''address'') @@ plainto_tsquery(''english'', %L)
                or to_tsvector(''english'', location->''city'') @@ plainto_tsquery(''english'', %L)
            )',
            p_search_term, p_search_term, p_search_term, p_search_term
        );
    end if;

    -- Apply filters if provided
    if p_filters is not null then
        -- Price range filter
        if p_filters->>'priceRange' is not null then
            v_query := v_query || format(
                ' and price_per_night between %s and %s',
                (p_filters->'priceRange'->>'min')::numeric,
                (p_filters->'priceRange'->>'max')::numeric
            );
        end if;

        -- Location filter (within radius)
        if p_filters->>'location' is not null then
            v_query := v_query || format(
                ' and ST_DWithin(
                    ST_MakePoint((location->''coordinates''->>''lng'')::float, (location->''coordinates''->>''lat'')::float)::geography,
                    ST_MakePoint(%s, %s)::geography,
                    %s * 1000
                )',
                (p_filters->'location'->>'lng')::float,
                (p_filters->'location'->>'lat')::float,
                (p_filters->'location'->>'radius')::float
            );
        end if;

        -- Amenities filter
        if p_filters->>'amenities' is not null and jsonb_array_length(p_filters->'amenities') > 0 then
            v_query := v_query || format(
                ' and amenities @> %L::text[]',
                (select array_agg(x.value) from jsonb_array_elements_text(p_filters->'amenities') x)
            );
        end if;

        -- Date availability filter
        if p_filters->>'dates' is not null then
            v_query := v_query || format(
                ' and not exists (
                    select 1 from bookings
                    where property_id = properties.id
                    and (
                        (start_date, end_date) overlaps (%L::date, %L::date)
                    )
                )',
                (p_filters->'dates'->>'checkIn')::date,
                (p_filters->'dates'->>'checkOut')::date
            );
        end if;

        -- Status filter
        if p_filters->>'status' is not null and jsonb_array_length(p_filters->'status') > 0 then
            v_query := v_query || format(
                ' and status = any(%L::text[])',
                (select array_agg(x.value) from jsonb_array_elements_text(p_filters->'status') x)
            );
        end if;

        -- Rating filter
        if p_filters->>'rating' is not null then
            v_query := v_query || format(
                ' and (
                    select coalesce(avg(rating), 0)
                    from reviews
                    where property_id = properties.id
                ) >= %s',
                (p_filters->>'rating')::numeric
            );
        end if;
    end if;

    -- Get total count
    execute format('select count(*) from (%s) as count_query', v_query)
    into v_total_count;

    -- Apply sorting and pagination
    v_query := v_query || format(
        ' order by %I %s limit %s offset %s',
        p_sort_by,
        p_sort_order,
        p_per_page,
        v_offset
    );

    -- Execute final query
    execute format('select jsonb_build_object(
        ''data'', coalesce(jsonb_agg(row_to_json(t)), ''[]''::jsonb),
        ''total_count'', %s,
        ''page'', %s,
        ''per_page'', %s
    ) from (%s) t', v_total_count, p_page, p_per_page, v_query)
    into v_result;

    return v_result;
end;
$$ language plpgsql security definer;

-- Function to toggle property like status
CREATE OR REPLACE FUNCTION toggle_property_like(
  property_id UUID,
  user_id UUID DEFAULT auth.uid()
) RETURNS BOOLEAN AS $$
DECLARE
  is_liked BOOLEAN;
BEGIN
  -- Check if user exists in saved_properties
  IF NOT EXISTS (SELECT 1 FROM saved_properties WHERE user_id = user_id) THEN
    INSERT INTO saved_properties (user_id, property_ids) VALUES (user_id, ARRAY[property_id]);
    RETURN true;
  END IF;

  -- Check if property is already liked
  SELECT property_id = ANY(property_ids) INTO is_liked
  FROM saved_properties
  WHERE user_id = user_id;

  IF is_liked THEN
    -- Remove property from liked array
    UPDATE saved_properties
    SET 
      property_ids = array_remove(property_ids, property_id),
      updated_at = NOW()
    WHERE user_id = user_id;
    RETURN false;
  ELSE
    -- Add property to liked array
    UPDATE saved_properties
    SET 
      property_ids = array_append(property_ids, property_id),
      updated_at = NOW()
    WHERE user_id = user_id;
    RETURN true;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's liked properties
CREATE OR REPLACE FUNCTION get_user_liked_properties(
  user_id UUID DEFAULT auth.uid()
) RETURNS TABLE (
  property_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT UNNEST(property_ids)::UUID
  FROM saved_properties
  WHERE user_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a property is liked by user
CREATE OR REPLACE FUNCTION check_property_like_status(
  property_id UUID,
  user_id UUID DEFAULT auth.uid()
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM saved_properties
    WHERE user_id = user_id
    AND property_id = ANY(property_ids)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies for saved_properties table
ALTER TABLE saved_properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved properties"
  ON saved_properties FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved properties"
  ON saved_properties FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved properties"
  ON saved_properties FOR INSERT
  WITH CHECK (auth.uid() = user_id); 