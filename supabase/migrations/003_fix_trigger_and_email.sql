-- Fix the handle_new_user function and ensure proper profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, telegram_username, telegram_id, daily_credits)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username', 
      NEW.raw_user_meta_data->>'telegram_username', 
      'user_' || substr(NEW.id::text, 1, 8)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url', 
      'https://ui-avatars.com/api/?name=' || 
      REPLACE(
        REPLACE(
          REPLACE(
            COALESCE(
              NEW.raw_user_meta_data->>'username', 
              NEW.raw_user_meta_data->>'telegram_username', 
              'User'
            ),
            ' ', '+'
          ),
          '#', '%23'
        ),
        '&', '%26'
      ) || 
      '&background=random'
    ),
    NEW.raw_user_meta_data->>'telegram_username',
    NEW.raw_user_meta_data->>'telegram_id',
    6
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also, let's check if we need to add any missing columns
DO $$
BEGIN
  -- Check if telegram_username column exists, add if not
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'telegram_username'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN telegram_username TEXT;
  END IF;
  
  -- Check if telegram_id column exists, add if not  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'telegram_id'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN telegram_id TEXT;
  END IF;
  
  -- Create indexes if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'profiles' AND indexname = 'idx_profiles_telegram_id'
  ) THEN
    CREATE INDEX idx_profiles_telegram_id ON public.profiles(telegram_id);
  END IF;
END $$;