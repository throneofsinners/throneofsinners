
-- Submission type + status enums
CREATE TYPE public.submission_type AS ENUM ('confession', 'prayer');
CREATE TYPE public.submission_status AS ENUM ('received', 'in_review', 'being_prayed_for', 'pastor_assigned', 'responded', 'resolved');

CREATE TABLE public.submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_token TEXT NOT NULL UNIQUE,
  type public.submission_type NOT NULL,
  category TEXT,
  content TEXT NOT NULL,
  contact_email TEXT,
  contact_name TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT true,
  status public.submission_status NOT NULL DEFAULT 'received',
  risk_flagged BOOLEAN NOT NULL DEFAULT false,
  risk_keywords TEXT[],
  pastoral_response TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX submissions_token_idx ON public.submissions (tracking_token);
CREATE INDEX submissions_type_status_idx ON public.submissions (type, status);
CREATE INDEX submissions_risk_idx ON public.submissions (risk_flagged) WHERE risk_flagged = true;

GRANT INSERT ON public.submissions TO anon, authenticated;
GRANT ALL ON public.submissions TO service_role;

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Anyone may submit (insert). Reads go only through trusted server functions.
CREATE POLICY "Anyone may submit"
  ON public.submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Crisis alerts
CREATE TABLE public.crisis_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
  severity TEXT NOT NULL DEFAULT 'high',
  matched_keywords TEXT[] NOT NULL DEFAULT '{}',
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.crisis_alerts TO anon, authenticated;
GRANT ALL ON public.crisis_alerts TO service_role;

ALTER TABLE public.crisis_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone may raise an alert"
  ON public.crisis_alerts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Updated-at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER submissions_set_updated_at
  BEFORE UPDATE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
