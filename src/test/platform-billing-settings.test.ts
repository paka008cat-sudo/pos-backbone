import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync('drizzle/migrations/0049_platform_billing_settings.sql', 'utf8');
const journal = JSON.parse(readFileSync('drizzle/migrations/meta/_journal.json', 'utf8'));
const api = readFileSync('api.md', 'utf8');

describe('platform-wide billing settings', () => {
  it('restricts configuration reads and writes to platform admins', () => {
    expect(migration).toContain('IF NOT public.is_platform_admin() THEN RAISE EXCEPTION \'forbidden\'; END IF;');
    expect(migration).toContain('REVOKE ALL ON public.platform_billing_settings FROM PUBLIC, anon, authenticated');
    expect(migration).toContain('GRANT EXECUTE ON FUNCTION public.admin_update_platform_billing_settings(integer, integer) TO authenticated');
  });

  it('validates trial and price ranges, and lets zero days disable trials for new shops', () => {
    expect(migration).toContain('trial_duration_days BETWEEN 0 AND 365');
    expect(migration).toContain('subscription_price_ksh BETWEEN 1 AND 250000');
    expect(migration).toContain("CASE WHEN settings.trial_duration_days = 0 THEN 'expired' ELSE 'trial' END");
    expect(migration).toContain('NEW.trial_ends_at := now() + make_interval(days => settings.trial_duration_days)');
  });

  it('updates the shared next-payment price without changing existing trial end dates', () => {
    expect(migration).toContain('UPDATE public.shops\n  SET subscription_price_ksh = settings.subscription_price_ksh;');
    expect(migration).toContain('Existing paid terms and trials continue unchanged.');
    expect(migration).not.toMatch(/UPDATE public\.shops\s+SET[^;]*trial_ends_at/is);
  });

  it('documents both admin RPCs and registers the migration after the catalog migration', () => {
    expect(api).toContain('admin_get_platform_billing_settings');
    expect(api).toContain('admin_update_platform_billing_settings');
    const catalog = journal.entries.find((entry: { tag: string }) => entry.tag === '0048_kenya_core_inventory_products');
    const settings = journal.entries.find((entry: { tag: string }) => entry.tag === '0049_platform_billing_settings');
    expect(catalog).toBeDefined();
    expect(settings).toBeDefined();
    expect(catalog.idx).toBeLessThan(settings.idx);
    expect(settings).toBe(journal.entries.at(-1));
  });
});
