-- Add telegram_id column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS telegram_id TEXT;

-- Create index for telegram_id
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_id ON public.profiles(telegram_id);

-- Update the handle_new_user function to include telegram_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, telegram_username, telegram_id, daily_credits)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'telegram_username', 'user_' || NEW.id::text),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://ui-avatars.com/api/?name=' || encode_uri_component(COALESCE(NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'telegram_username', 'User')) || '&background=random'),
    NEW.raw_user_meta_data->>'telegram_username',
    NEW.raw_user_meta_data->>'telegram_id',
    6
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;