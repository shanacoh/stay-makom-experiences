CREATE OR REPLACE FUNCTION public.export_schema_info()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public' AS $$
DECLARE
  cols jsonb;
  enums jsonb;
BEGIN
  SELECT jsonb_agg(row_to_json(t)) INTO cols
  FROM (
    SELECT table_name, column_name, data_type, is_nullable, column_default, udt_name
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    ORDER BY table_name, ordinal_position
  ) t;

  SELECT jsonb_agg(row_to_json(t)) INTO enums
  FROM (
    SELECT typname, enumlabel 
    FROM pg_enum 
    JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
    ORDER BY typname, enumsortorder
  ) t;

  RETURN jsonb_build_object('columns', cols, 'enums', enums);
END;
$$;