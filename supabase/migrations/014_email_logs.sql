-- 014_email_logs.sql
-- Audit log for every transactional email the system attempts to send via
-- Resend. Inserts come from the service-role client inside api/_lib/email.js;
-- failures to log are non-blocking (a missing log must not prevent the email
-- from being sent or the original request from completing).
--
-- Read access is restricted to admins. Customers should not be able to see
-- which emails were sent to other accounts.

CREATE TABLE IF NOT EXISTS public.email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL DEFAULT 'resend',
  template text NOT NULL,
  recipient_email text NOT NULL,
  status text NOT NULL CHECK (status IN ('queued', 'sent', 'failed', 'skipped', 'bounced')),
  error_message text,
  provider_message_id text,
  related_order_id text REFERENCES public.orders(id) ON DELETE SET NULL,
  related_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  sent_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_recipient_sent_at
  ON public.email_logs(recipient_email, sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_logs_related_order
  ON public.email_logs(related_order_id)
  WHERE related_order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_email_logs_status_sent_at
  ON public.email_logs(status, sent_at DESC);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read email logs" ON public.email_logs;
CREATE POLICY "Admins read email logs"
  ON public.email_logs FOR SELECT
  USING (public.is_admin());
