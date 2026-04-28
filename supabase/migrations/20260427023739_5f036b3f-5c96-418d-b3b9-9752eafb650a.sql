-- profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  city TEXT DEFAULT 'Bengaluru',
  avatar_url TEXT,
  coins INTEGER NOT NULL DEFAULT 0,
  total_kg NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "view own profile" ON public.profiles;
DROP POLICY IF EXISTS "update own profile" ON public.profiles;
DROP POLICY IF EXISTS "insert own profile" ON public.profiles;

CREATE POLICY "view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);


-- auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();


-- scans
CREATE TABLE IF NOT EXISTS public.scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  device_name TEXT NOT NULL,
  weight_kg NUMERIC(6,2) NOT NULL,
  condition_pct INTEGER NOT NULL,
  condition_label TEXT NOT NULL,
  coins_earned INTEGER NOT NULL,
  ai_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "view own scans" ON public.scans;
DROP POLICY IF EXISTS "insert own scans" ON public.scans;

CREATE POLICY "view own scans"
ON public.scans
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "insert own scans"
ON public.scans
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);


-- redemptions
CREATE TABLE IF NOT EXISTS public.redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_name TEXT NOT NULL,
  cost INTEGER NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "view own redemptions" ON public.redemptions;
DROP POLICY IF EXISTS "insert own redemptions" ON public.redemptions;

CREATE POLICY "view own redemptions"
ON public.redemptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "insert own redemptions"
ON public.redemptions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);


-- pickups
CREATE TABLE IF NOT EXISTS public.pickups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  slot TEXT,
  status TEXT NOT NULL DEFAULT 'requested',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pickups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "view own pickups" ON public.pickups;
DROP POLICY IF EXISTS "insert own pickups" ON public.pickups;
DROP POLICY IF EXISTS "update own pickups" ON public.pickups;

CREATE POLICY "view own pickups"
ON public.pickups
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "insert own pickups"
ON public.pickups
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update own pickups"
ON public.pickups
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);