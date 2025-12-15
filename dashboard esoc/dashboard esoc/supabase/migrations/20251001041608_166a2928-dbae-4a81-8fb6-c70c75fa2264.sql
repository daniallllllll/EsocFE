-- Create enum types for monitoring tools and severity levels
CREATE TYPE monitoring_tool AS ENUM ('splunk', 'qradar', 'cortex', 'trendmicro');
CREATE TYPE severity_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE event_status AS ENUM ('open', 'investigating', 'resolved', 'closed');

-- Create security events table
CREATE TABLE public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  domain_name TEXT NOT NULL,
  tunnel_detector TEXT,
  monitoring_tool monitoring_tool NOT NULL,
  event_type TEXT NOT NULL,
  severity severity_level NOT NULL,
  risk_level TEXT,
  description TEXT,
  status event_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_security_events_timestamp ON public.security_events(timestamp DESC);
CREATE INDEX idx_security_events_tool ON public.security_events(monitoring_tool);
CREATE INDEX idx_security_events_severity ON public.security_events(severity);
CREATE INDEX idx_security_events_status ON public.security_events(status);

-- Enable Row Level Security
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access (monitoring dashboard)
CREATE POLICY "Allow public read access to security events"
ON public.security_events
FOR SELECT
TO anon, authenticated
USING (true);

-- Create policy to allow authenticated users to insert events
CREATE POLICY "Allow authenticated users to insert events"
ON public.security_events
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create policy to allow authenticated users to update events
CREATE POLICY "Allow authenticated users to update events"
ON public.security_events
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_security_events_updated_at
BEFORE UPDATE ON public.security_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for demonstration
INSERT INTO public.security_events (timestamp, domain_name, tunnel_detector, monitoring_tool, event_type, severity, risk_level, description, status) VALUES
(NOW() - INTERVAL '5 minutes', 'api.example.com', 'TUN-001', 'splunk', 'Notable Event', 'critical', 'High Risk', 'Multiple failed authentication attempts detected', 'open'),
(NOW() - INTERVAL '15 minutes', 'db.example.com', 'TUN-002', 'qradar', 'Security Incident', 'high', 'Medium Risk', 'Suspicious database query pattern', 'investigating'),
(NOW() - INTERVAL '30 minutes', 'web.example.com', 'TUN-003', 'cortex', 'Threat Detection', 'medium', 'Low Risk', 'Unusual traffic pattern detected', 'open'),
(NOW() - INTERVAL '1 hour', 'mail.example.com', 'TUN-004', 'trendmicro', 'Notable Event', 'critical', 'High Risk', 'Potential malware detected in email attachment', 'resolved'),
(NOW() - INTERVAL '2 hours', 'vpn.example.com', 'TUN-005', 'splunk', 'Access Violation', 'high', 'Medium Risk', 'Unauthorized access attempt', 'investigating'),
(NOW() - INTERVAL '3 hours', 'api.example.com', 'TUN-001', 'qradar', 'Notable Event', 'low', 'Low Risk', 'API rate limit exceeded', 'closed'),
(NOW() - INTERVAL '4 hours', 'storage.example.com', 'TUN-006', 'cortex', 'Data Exfiltration', 'critical', 'High Risk', 'Large data transfer to unknown IP', 'open'),
(NOW() - INTERVAL '5 hours', 'admin.example.com', 'TUN-007', 'trendmicro', 'Privilege Escalation', 'high', 'High Risk', 'Unauthorized privilege elevation attempt', 'resolved');