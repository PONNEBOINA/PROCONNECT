-- Fix search_path for get_week_start function
CREATE OR REPLACE FUNCTION public.get_week_start()
RETURNS DATE
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CURRENT_DATE - (EXTRACT(DOW FROM CURRENT_DATE)::INTEGER - 1);
$$;

-- Fix search_path for get_week_end function
CREATE OR REPLACE FUNCTION public.get_week_end()
RETURNS DATE
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CURRENT_DATE + (7 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER);
$$;