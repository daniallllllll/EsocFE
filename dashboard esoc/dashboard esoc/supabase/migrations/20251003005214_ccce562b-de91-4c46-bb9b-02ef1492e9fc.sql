-- Add source column to security_events table
ALTER TABLE public.security_events
ADD COLUMN source text;