-- Platform-wide defaults for free-trial duration and subscription pricing.
-- Updating the price updates every tenant's next renewal price, but does not
-- alter existing subscription/trial end dates or charge active tenants early.
CREATE TABLE IF NOT EXISTS public.platform_billing_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  trial_duration_days integer NOT NULL DEFAULT 14 CHECK (trial_duration_days BETWEEN 0 AND 365),
  subscription_price_ksh integer NOT NULL DEFAULT 2500 CHECK (subscription_price_ksh BETWEEN 1 AND 250000),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

INSERT INTO public.platform_billing_settings (id, trial_duration_days, subscription_price_ksh)
VALUES (true, 14, 2500)
ON CONFLICT (id) DO NOTHING;

-- Initialize a single shared renewal price for every existing tenant. This does
-- not touch any trial, subscription, or payment-lock end date/amount.
UPDATE public.shops
SET subscription_price_ksh = (
  SELECT subscription_price_ksh FROM public.platform_billing_settings WHERE id = true
);

ALTER TABLE public.platform_billing_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.platform_billing_settings FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.platform_billing_settings TO service_role;

CREATE OR REPLACE FUNCTION public.admin_get_platform_billing_settings()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE settings public.platform_billing_settings;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF NOT public.is_platform_admin() THEN RAISE EXCEPTION 'forbidden'; END IF;

  SELECT * INTO settings FROM public.platform_billing_settings WHERE id = true;
  IF NOT FOUND THEN RAISE EXCEPTION 'platform_billing_settings_missing'; END IF;
  RETURN jsonb_build_object(
    'trial_duration_days', settings.trial_duration_days,
    'subscription_price_ksh', settings.subscription_price_ksh,
    'updated_at', settings.updated_at
  );
END $$;
REVOKE ALL ON FUNCTION public.admin_get_platform_billing_settings() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_get_platform_billing_settings() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_update_platform_billing_settings(
  p_trial_duration_days integer,
  p_subscription_price_ksh integer
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE settings public.platform_billing_settings;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF NOT public.is_platform_admin() THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF p_trial_duration_days IS NULL OR p_trial_duration_days NOT BETWEEN 0 AND 365 THEN
    RAISE EXCEPTION 'trial_duration_invalid';
  END IF;
  IF p_subscription_price_ksh IS NULL OR p_subscription_price_ksh NOT BETWEEN 1 AND 250000 THEN
    RAISE EXCEPTION 'subscription_price_invalid';
  END IF;

  UPDATE public.platform_billing_settings
  SET trial_duration_days = p_trial_duration_days,
      subscription_price_ksh = p_subscription_price_ksh,
      updated_at = now(),
      updated_by = auth.uid()
  WHERE id = true
  RETURNING * INTO settings;
  IF NOT FOUND THEN RAISE EXCEPTION 'platform_billing_settings_missing'; END IF;

  -- Existing paid terms and trials continue unchanged. The price is refreshed
  -- for every tenant's next renewal, including tenants already past trial.
  UPDATE public.shops
  SET subscription_price_ksh = settings.subscription_price_ksh;

  RETURN jsonb_build_object(
    'trial_duration_days', settings.trial_duration_days,
    'subscription_price_ksh', settings.subscription_price_ksh,
    'updated_at', settings.updated_at
  );
END $$;
REVOKE ALL ON FUNCTION public.admin_update_platform_billing_settings(integer, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_update_platform_billing_settings(integer, integer) TO authenticated;

-- Apply the current platform defaults at the database boundary for every shop
-- creation path (owner signup, Superadmin provisioning, or legacy create_shop).
CREATE OR REPLACE FUNCTION public.apply_platform_billing_defaults_to_new_shop()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE settings public.platform_billing_settings;
BEGIN
  SELECT * INTO settings FROM public.platform_billing_settings WHERE id = true;
  IF NOT FOUND THEN RETURN NEW; END IF;

  NEW.subscription_price_ksh := settings.subscription_price_ksh;
  NEW.trial_ends_at := now() + make_interval(days => settings.trial_duration_days);
  NEW.subscription_status := CASE WHEN settings.trial_duration_days = 0 THEN 'expired' ELSE 'trial' END;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS apply_platform_billing_defaults ON public.shops;
CREATE TRIGGER apply_platform_billing_defaults
BEFORE INSERT ON public.shops
FOR EACH ROW EXECUTE FUNCTION public.apply_platform_billing_defaults_to_new_shop();

NOTIFY pgrst, 'reload schema';
