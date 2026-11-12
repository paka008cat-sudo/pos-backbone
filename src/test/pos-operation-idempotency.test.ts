import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import postgres from 'postgres';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

const migrationPath = 'drizzle/migrations/0026_client_operation_idempotency.sql';
const migration = readFileSync(migrationPath, 'utf8');
const bulkUnitsMigration = readFileSync('drizzle/migrations/0044_bulk_product_sale_units.sql', 'utf8');
const journal = JSON.parse(readFileSync('drizzle/migrations/meta/_journal.json', 'utf8'));
const kinds = [
  'create_dining_table', 'sale', 'table_sale', 'receive_stock', 'add_catalog_product',
  'register_product', 'adjust_stock', 'undo_sale', 'transfer_stock', 'update_product',
] as const;
type Kind = typeof kinds[number];
type Payload = Record<string, unknown>;

describe('POS operation migration contract', () => {
  it('adds only a new RPC, leaving existing function definitions and grants untouched', () => {
    expect([...migration.matchAll(/CREATE (?:OR REPLACE )?FUNCTION public\.(\w+)/g)].map(m => m[1]))
      .toEqual(['apply_pos_operation']);
    expect(migration).toMatch(/SECURITY DEFINER\s+SET search_path = pg_catalog, public, pg_temp/);
    expect(migration).toContain('PRIMARY KEY (shop_id, operation_id)');
    expect(migration).toContain('FROM PUBLIC, anon');
    expect(migration).toContain('TO authenticated');
    expect(migration).toContain('REVOKE ALL ON public.client_operations FROM PUBLIC, anon, authenticated');
    expect(migration).not.toMatch(/DROP (?:FUNCTION|TABLE)/);
    for (const kind of kinds) expect(migration).toContain(`WHEN '${kind}' THEN`);
  });
  it('keeps POS idempotency, bill settlement, bulk sale-unit, Daraja, and catalog migrations ordered', () => {
    const operationMigration = journal.entries.find((entry: { tag: string }) =>
      entry.tag === '0026_client_operation_idempotency');
    const billMigration = journal.entries.find((entry: { tag: string }) =>
      entry.tag === '0027_table_bill_settlement');
    const bulkMigration = journal.entries.find((entry: { tag: string }) =>
      entry.tag === '0044_bulk_product_sale_units');
    const darajaMigration = journal.entries.find((entry: { tag: string }) =>
      entry.tag === '0046_daraja_subscription_payments');
    const catalogMigration = journal.entries.find((entry: { tag: string }) =>
      entry.tag === '0048_kenya_core_inventory_products');
    const billingMigration = journal.entries.find((entry: { tag: string }) =>
      entry.tag === '0049_platform_billing_settings');
    const last = journal.entries.at(-1);
    expect(operationMigration).toBeDefined();
    expect(billMigration).toBeDefined();
    expect(bulkMigration).toBeDefined();
    expect(darajaMigration).toBeDefined();
    expect(catalogMigration).toBeDefined();
    expect(billingMigration).toBeDefined();
    expect(operationMigration.idx).toBeLessThan(billMigration.idx);
    expect(billMigration.idx).toBeLessThan(bulkMigration.idx);
    expect(bulkMigration.idx).toBeLessThan(darajaMigration.idx);
    expect(darajaMigration.idx).toBeLessThan(catalogMigration.idx);
    expect(catalogMigration.idx).toBeLessThan(billingMigration.idx);
    expect(billingMigration.tag).toBe(last.tag);
    expect(billingMigration.idx).toBe(journal.entries.at(-2).idx + 1);
    expect(billingMigration.when).toBeGreaterThan(journal.entries.at(-2).when);
  });
  it('adds cross-device units and permits manual-depletion bulk sales in the backend contract', () => {
    expect(bulkUnitsMigration).toContain('ADD COLUMN IF NOT EXISTS sale_units jsonb');
    expect(bulkUnitsMigration).toContain('CREATE OR REPLACE FUNCTION public.register_product_with_units');
    expect(bulkUnitsMigration).toContain('CREATE OR REPLACE FUNCTION public.register_product_at_counter_with_units');
    expect(bulkUnitsMigration).toContain('stock_used := _qty * units_per_sale');
    expect(bulkUnitsMigration).toContain('IF NEW.stock_qty <> 0 THEN');
    expect(bulkUnitsMigration).toContain('sale_units = product.sale_units');
    expect(bulkUnitsMigration).toContain('ELSIF s.stock_qty > 0 THEN');
    expect(bulkUnitsMigration).toContain('CREATE OR REPLACE FUNCTION public.apply_pos_operation_legacy');
    expect(bulkUnitsMigration).not.toMatch(/CREATE OR REPLACE FUNCTION public\.apply_pos_operation\(/);
  });
});

// Opt-in only. Never read application .env or a Supabase migration URL.
// Requires a disposable LOCAL PostgreSQL superuser connection to /postgres.
// The suite creates and drops its own uniquely named database, not existing data.
const localUrl = process.env.POS_IDEMPOTENCY_TEST_URL;
if (localUrl) {
  const url = new URL(localUrl);
  if (!['postgres:', 'postgresql:'].includes(url.protocol)
    || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)
    || url.pathname !== '/postgres'
    || url.search || url.hash) {
    throw new Error('POS_IDEMPOTENCY_TEST_URL must be a loopback PostgreSQL URL to /postgres without query overrides');
  }
}

describe.skipIf(!localUrl)('POS operation PostgreSQL integration (local only)', () => {
  let admin: ReturnType<typeof postgres>;
  let db: ReturnType<typeof postgres>;
  let databaseName: string;
  let functionsBeforeBulkMigration: Array<{ signature: string; definition: string }> = [];
  const owner = randomUUID();
  const otherOwner = randomUUID();
  const cashier = randomUUID();
  const manager = randomUUID();
  const clerk = randomUUID();
  const outsider = randomUUID();
  const catalog = randomUUID();
  let shop: string;
  let otherShop: string;
  let product: string;
  let otherProduct: string;
  let counter: string;
  let destination: string;
  let otherCounter: string;
  let table: string;
  let otherTable: string;
  let targetSale: string;
  let latestSale: string;

  async function call(kind: string, payload: Payload, operation = randomUUID(), actor = owner, tenant = shop) {
    return db.begin(async tx => {
      await tx.unsafe('SET LOCAL ROLE authenticated');
      await tx`SELECT set_config('request.jwt.claim.sub', ${actor}, true)`;
      const [row] = await tx`SELECT public.apply_pos_operation(${tenant}::uuid, ${operation}::uuid, ${kind}, ${tx.json(payload)}) AS result`;
      return row.result;
    });
  }

  function payload(kind: Kind): Payload {
    switch (kind) {
      case 'create_dining_table': return { name: 'Queued table' };
      case 'sale': return { product_id: product, counter_id: counter, qty: 2 };
      case 'table_sale': return { table_id: table, product_id: product, counter_id: counter, qty: 2, unit_name: 'Bottle', unit_price: 200 };
      case 'receive_stock': return { product_id: product, counter_id: counter, qty: 3, unit_cost: 120 };
      case 'add_catalog_product': return { catalog_id: catalog, counter_id: counter, qty: 3, price: 200, unit_cost: 100 };
      case 'register_product': return { code: 'NEW', name: 'New product', price: 200, qty: 4, counter_id: counter, photo_path: null, unit_cost: 100 };
      case 'adjust_stock': return { product_id: product, counter_id: counter, new_stock: 12, reason: 'Count' };
      case 'undo_sale': return { sale_id: targetSale };
      case 'transfer_stock': return { product_id: product, from_counter_id: counter, to_counter_id: destination, qty: 3 };
      case 'update_product': return { product_id: product, patch: {
        name: 'Renamed', price: 250, barcode: '1234567890123',
        sale_units: [{ name: 'Shot', priceKsh: 120, stockUnitsPerSale: 0 }],
      } };
    }
  }

  async function snapshot() {
    const tables = ['products', 'sales', 'stock_receipts', 'stock_batches', 'sale_batch_allocations',
      'dining_tables', 'table_orders', 'counter_stock_balances', 'counter_stock_movements', 'audit_events', 'client_operations'];
    const values = await Promise.all(tables.map(async name => {
      const [row] = await db.unsafe(`SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY to_jsonb(t)::text), '[]'::jsonb) AS rows FROM public.${name} AS t`);
      return [name, row.rows];
    }));
    return Object.fromEntries(values);
  }

  async function functions() {
    return [...await db`SELECT p.oid::regprocedure::text AS signature, pg_get_functiondef(p.oid) AS definition
      FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND p.prokind = 'f' AND p.proname <> 'apply_pos_operation'
      ORDER BY p.oid::regprocedure::text`];
  }

  beforeAll(async () => {
    admin = postgres(localUrl!, { max: 1, onnotice: () => {} });
    // These are cluster roles only in the explicitly supplied local test cluster.
    await admin.unsafe(`DO $$ BEGIN
      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN CREATE ROLE anon NOLOGIN; END IF;
      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN CREATE ROLE authenticated NOLOGIN; END IF;
      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN CREATE ROLE service_role NOLOGIN BYPASSRLS; END IF;
    END $$;`);
    databaseName = `pos_idempotency_test_${randomUUID().replaceAll('-', '')}`;
    await admin.unsafe(`CREATE DATABASE "${databaseName}"`);
    const url = new URL(localUrl!);
    url.pathname = `/${databaseName}`;
    db = postgres(url.toString(), { max: 10, onnotice: () => {} });
    await db.unsafe(`CREATE SCHEMA auth; CREATE SCHEMA storage;
      CREATE TABLE auth.users (id uuid PRIMARY KEY, email text);
      CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
        SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
      $$;
      CREATE TABLE storage.objects (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), bucket_id text, name text);
      CREATE FUNCTION storage.foldername(text) RETURNS text[] LANGUAGE sql IMMUTABLE AS $$
        SELECT string_to_array($1, '/')
      $$;
      GRANT USAGE ON SCHEMA public, auth, storage TO anon, authenticated, service_role;`);
    for (const entry of journal.entries) {
      if (entry.tag === '0044_bulk_product_sale_units') {
        functionsBeforeBulkMigration = await functions() as Array<{ signature: string; definition: string }>;
      }
      await db.unsafe(readFileSync(`drizzle/migrations/${entry.tag}.sql`, 'utf8'));
    }
    await db`INSERT INTO auth.users(id, email) VALUES
      (${owner}, 'owner@test.invalid'), (${otherOwner}, 'other-owner@test.invalid'),
      (${cashier}, 'cashier@test.invalid'), (${manager}, 'manager@test.invalid'),
      (${clerk}, 'clerk@test.invalid'), (${outsider}, 'outsider@test.invalid')`;
    await db`INSERT INTO public.catalog_items(id, code, name, suggested_price) VALUES (${catalog}, 'IDEMPOTENCY_TEST', 'Test catalog', 200)`;
  }, 60_000);

  afterAll(async () => {
    if (db) await db.end();
    if (admin) {
      if (databaseName) await admin.unsafe(`DROP DATABASE IF EXISTS "${databaseName}" WITH (FORCE)`);
      await admin.end();
    }
  });

  beforeEach(async () => {
    await db.unsafe('TRUNCATE public.shops CASCADE');
    shop = randomUUID(); otherShop = randomUUID(); product = randomUUID(); otherProduct = randomUUID();
    for (const [tenant, pid, inventoryMode] of [[shop, product, 'per_counter'], [otherShop, otherProduct, 'shared']]) {
      await db`INSERT INTO public.shops(id, name, created_by, counter_inventory_mode) VALUES (${tenant}, 'Test tenant', ${owner}, ${inventoryMode})`;
      await db`INSERT INTO public.shop_members(shop_id, user_id, role) VALUES
        (${tenant}, ${owner}, 'owner'), (${tenant}, ${otherOwner}, 'owner'),
        (${tenant}, ${cashier}, 'cashier'), (${tenant}, ${manager}, 'manager'), (${tenant}, ${clerk}, 'inventory_clerk')`;
      const [c] = await db`SELECT id FROM public.service_counters WHERE shop_id = ${tenant} AND name = 'Counter 1'`;
      const [d] = await db`INSERT INTO public.service_counters(shop_id, name) VALUES (${tenant}, 'Counter 2') RETURNING id`;
      const [t] = await db`INSERT INTO public.dining_tables(shop_id, name) VALUES (${tenant}, 'Base table') RETURNING id`;
      await db`INSERT INTO public.products(id, shop_id, code, name, price, stock, average_cost)
        VALUES (${pid}, ${tenant}, 'BASE', 'Base product', 200, 20, 100)`;
      await db`INSERT INTO public.stock_batches(shop_id, product_id, received_qty, remaining_qty, unit_cost, received_by)
        VALUES (${tenant}, ${pid}, 20, 20, 100, ${owner})`;
      if (tenant === shop) {
        counter = c.id; destination = d.id; table = t.id;
        await db`INSERT INTO public.counter_stock_balances(shop_id, service_counter_id, product_id, quantity)
          VALUES (${tenant}, ${c.id}, ${pid}, 15), (${tenant}, ${d.id}, ${pid}, 5)`;
      } else { otherCounter = c.id; otherTable = t.id; }
    }
    targetSale = ''; latestSale = '';
  });

  it('leaves unrelated existing SQL functions unchanged in the bulk-unit migration', async () => {
    const changed = /public\.(validate_product_sale_units|record_sale_unit|undo_sale|enforce_counter_stock_on_sale|apply_pos_operation_legacy|register_product_with_units|register_product_at_counter_with_units)\(/;
    const before = functionsBeforeBulkMigration.filter(row => !changed.test(row.signature));
    const after = (await functions() as Array<{ signature: string; definition: string }>).filter(row => !changed.test(row.signature));
    expect(after).toEqual(before);
  });

  it.each(kinds)('executes %s exactly once and replays the frozen result', async kind => {
    if (kind === 'undo_sale') {
      targetSale = (await call('sale', payload('sale'))).id;
      latestSale = (await call('sale', { ...payload('sale'), qty: 1 })).id;
    }
    const op = randomUUID();
    const first = await call(kind, payload(kind), op);
    const afterFirst = await snapshot();
    expect(await call(kind, payload(kind), op)).toEqual(first);
    expect(await snapshot()).toEqual(afterFirst);
    const [ledger] = await db`SELECT result, completed_at FROM public.client_operations WHERE operation_id = ${op}`;
    expect(ledger.result).toEqual(first);
    expect(ledger.completed_at).not.toBeNull();
    if (kind === 'transfer_stock') {
      expect(first).toBeNull();
      const balances = await db`SELECT quantity FROM public.counter_stock_balances WHERE product_id = ${product} ORDER BY quantity`;
      expect(balances.map(b => b.quantity)).toEqual([8, 12]);
    } else expect(first.id).toBeTruthy();
    if (kind === 'undo_sale') {
      expect(first.id).toBe(targetSale);
      const [latest] = await db`SELECT undone_at FROM public.sales WHERE id = ${latestSale}`;
      expect(latest.undone_at).toBeNull();
    }
    const [p] = await db`SELECT stock, average_cost FROM public.products WHERE id = ${product}`;
    const expectedStock: Partial<Record<Kind, number>> = { sale: 18, table_sale: 18, receive_stock: 23, adjust_stock: 17, undo_sale: 19, transfer_stock: 20, update_product: 20 };
    if (kind in expectedStock) expect(p.stock).toBe(expectedStock[kind]);
    if (kind === 'update_product') expect(p.average_cost).toBe(100);
  });

  it('registers and sells a zero-opening bulk product without moving or restoring phantom stock', async () => {
    const saleUnits = [
      { name: 'Cup', priceKsh: 100, stockUnitsPerSale: 0 },
      { name: 'Jug', priceKsh: 450, stockUnitsPerSale: 0 },
    ];
    const registered = await call('register_product', {
      code: 'BULK_ZERO', name: 'Local Liquor', price: 100, qty: 0,
      counter_id: counter, photo_path: null, unit_cost: 4500, category: 'Local Liquor',
      sale_units: saleUnits,
    });
    const bulkProductId = registered.id as string;
    expect(registered.stock).toBe(0);
    expect(registered.average_cost).toBe(4500);
    expect(registered.sale_units).toEqual(saleUnits);

    const firstSale = await call('sale', {
      product_id: bulkProductId, counter_id: counter, qty: 2,
      unit_name: 'Cup', unit_price: 100,
    });
    expect(firstSale.stock_qty).toBe(0);

    const [balanceAfterSale] = await db`SELECT quantity FROM public.counter_stock_balances
      WHERE service_counter_id = ${counter} AND product_id = ${bulkProductId}`;
    expect(balanceAfterSale.quantity).toBe(0);

    const undone = await call('undo_sale', { sale_id: firstSale.id });
    expect(undone.stock_qty).toBe(0);
    const [productAfterUndo] = await db`SELECT stock, average_cost FROM public.products WHERE id = ${bulkProductId}`;
    expect(productAfterUndo.stock).toBe(0);
    expect(productAfterUndo.average_cost).toBe(4500);
    const [batchCount] = await db`SELECT count(*)::int AS count FROM public.stock_batches WHERE product_id = ${bulkProductId}`;
    expect(batchCount.count).toBe(0);

    const tableSale = await call('table_sale', {
      table_id: table, product_id: bulkProductId, counter_id: counter,
      qty: 1, unit_name: 'Jug', unit_price: 450,
    });
    const [tableSaleRow] = await db`SELECT stock_qty FROM public.sales WHERE id = ${tableSale.sale_id}`;
    expect(tableSaleRow.stock_qty).toBe(0);
    const [movementCount] = await db`SELECT count(*)::int AS count FROM public.counter_stock_movements
      WHERE product_id = ${bulkProductId}`;
    expect(movementCount.count).toBe(0);
  });

  it('canonicalizes object order, UUID casing and omitted defaults', async () => {
    const op = randomUUID();
    const first = await call('sale', { product_id: product, counter_id: counter }, op);
    const second = await call('sale', { unit_price: null, unit_name: 'Bottle', qty: 1, counter_id: counter.toUpperCase(), product_id: product.toUpperCase() }, op);
    expect(second).toEqual(first);
  });

  it.each(['actor', 'payload', 'kind'])('rejects operation UUID reuse with different %s', async difference => {
    const op = randomUUID();
    await call('sale', payload('sale'), op);
    const state = await snapshot();
    const action = difference === 'actor' ? call('sale', payload('sale'), op, otherOwner)
      : difference === 'payload' ? call('sale', { ...payload('sale'), qty: 3 }, op)
      : call('receive_stock', payload('receive_stock'), op);
    await expect(action).rejects.toThrow('operation_id_reused');
    expect(await snapshot()).toEqual(state);
  });

  it('scopes operation UUID uniqueness to the tenant', async () => {
    const op = randomUUID();
    const first = await call('create_dining_table', { name: 'Same UUID' }, op);
    const second = await call('create_dining_table', { name: 'Same UUID' }, op, owner, otherShop);
    expect(first.shop_id).toBe(shop);
    expect(second.shop_id).toBe(otherShop);
    expect(first.id).not.toBe(second.id);
  });

  it.each(['sale', 'receive_stock', 'adjust_stock', 'update_product'] as const)('blocks a cross-tenant product in %s', async kind => {
    const state = await snapshot();
    await expect(call(kind, { ...payload(kind), product_id: otherProduct })).rejects.toThrow('product_not_found');
    expect(await snapshot()).toEqual(state);
  });

  it.each(['sale', 'table_sale', 'receive_stock', 'add_catalog_product', 'register_product', 'adjust_stock'] as const)('blocks a cross-tenant counter in %s', async kind => {
    const state = await snapshot();
    await expect(call(kind, { ...payload(kind), counter_id: otherCounter })).rejects.toThrow('counter_not_found_or_inactive');
    expect(await snapshot()).toEqual(state);
  });

  it('blocks cross-tenant table sales, transfers and undo targets', async () => {
    await expect(call('table_sale', { ...payload('table_sale'), table_id: otherTable })).rejects.toThrow('table_not_found');
    await expect(call('table_sale', { ...payload('table_sale'), product_id: otherProduct })).rejects.toThrow('product_not_found');
    await expect(call('transfer_stock', { ...payload('transfer_stock'), to_counter_id: otherCounter })).rejects.toThrow('counter_not_found_or_inactive');
    await expect(call('transfer_stock', { ...payload('transfer_stock'), product_id: otherProduct })).rejects.toThrow('product_not_found');
    const foreignSale = await call('sale', { product_id: otherProduct, counter_id: otherCounter }, randomUUID(), owner, otherShop);
    await expect(call('undo_sale', { sale_id: foreignSale.id })).rejects.toThrow('nothing_to_undo');
  });

  it.each(kinds.filter(k => k !== 'sale' && k !== 'table_sale'))('denies cashier authorization for %s', async kind => {
    await expect(call(kind, payload(kind), randomUUID(), cashier)).rejects.toThrow('forbidden');
  });
  it('keeps owner-only product updates and inventory/sales role separation', async () => {
    await expect(call('update_product', payload('update_product'), randomUUID(), manager)).rejects.toThrow('forbidden');
    await expect(call('sale', payload('sale'), randomUUID(), clerk)).rejects.toThrow('forbidden');
    await expect(call('receive_stock', payload('receive_stock'), randomUUID(), clerk)).resolves.toHaveProperty('stock', 23);
    await expect(call('sale', payload('sale'), randomUUID(), cashier)).resolves.toHaveProperty('sold_by', cashier);
  });

  it.each(['suspended', 'closed'])('denies replay for a %s tenant', async status => {
    const op = randomUUID(); await call('sale', payload('sale'), op);
    await db`UPDATE public.shops SET status = ${status} WHERE id = ${shop}`;
    await expect(call('sale', payload('sale'), op)).rejects.toThrow('forbidden');
  });
  it.each(['suspended', 'terminated'])('denies replay for a %s actor', async status => {
    const op = randomUUID(); await call('sale', payload('sale'), op);
    await db`UPDATE public.shop_members SET employment_status = ${status} WHERE shop_id = ${shop} AND user_id = ${owner}`;
    await expect(call('sale', payload('sale'), op)).rejects.toThrow('forbidden');
  });
  it('rechecks owner role and selling schedule on replay', async () => {
    const op = randomUUID(); await call('update_product', payload('update_product'), op);
    await db`UPDATE public.shop_members SET role = 'cashier' WHERE shop_id = ${shop} AND user_id = ${owner}`;
    await expect(call('update_product', payload('update_product'), op)).rejects.toThrow('forbidden');
    const saleOp = randomUUID(); await call('sale', payload('sale'), saleOp);
    await db`INSERT INTO public.employee_working_hours(shop_id, user_id, weekday, start_time, end_time)
      VALUES (${shop}, ${owner}, ((extract(dow FROM now() AT TIME ZONE 'Africa/Nairobi')::int + 1) % 7)::smallint, '00:00', '23:59')`;
    await expect(call('sale', payload('sale'), saleOp)).rejects.toThrow('seller_not_allowed_now');
  });
  it('denies anonymous calls, missing actor claims, outsiders and direct ledger access', async () => {
    await expect(db.begin(async tx => {
      await tx.unsafe('SET LOCAL ROLE anon');
      await tx`SELECT public.apply_pos_operation(${shop}::uuid, ${randomUUID()}::uuid, 'sale', '{}'::jsonb)`;
    })).rejects.toThrow('permission denied');
    await expect(call('sale', payload('sale'), randomUUID(), '')).rejects.toThrow('not_authenticated');
    await expect(call('sale', payload('sale'), randomUUID(), outsider)).rejects.toThrow('forbidden');
    await expect(db.begin(async tx => {
      await tx.unsafe('SET LOCAL ROLE authenticated');
      await tx.unsafe('SELECT * FROM public.client_operations');
    })).rejects.toThrow('permission denied');
  });

  it('requires an explicit non-null undo UUID, never choosing the latest sale', async () => {
    const sale = await call('sale', payload('sale'));
    await expect(call('undo_sale', {})).rejects.toThrow('missing_operation_payload_field');
    await expect(call('undo_sale', { sale_id: null })).rejects.toThrow('operation_uuid_field_required');
    const [row] = await db`SELECT undone_at FROM public.sales WHERE id = ${sale.id}`;
    expect(row.undone_at).toBeNull();
    await call('undo_sale', { sale_id: sale.id });
    const state = await snapshot();
    await expect(call('undo_sale', { sale_id: sale.id })).rejects.toThrow('nothing_to_undo');
    expect(await snapshot()).toEqual(state);
  });

  it('rolls back a failed mutation AND its claim, permitting a corrected-state retry', async () => {
    const op = randomUUID();
    await db`UPDATE public.stock_batches SET remaining_qty = 0 WHERE product_id = ${product}`;
    const state = await snapshot();
    // Failure occurs after sales insertion and the per-counter stock trigger.
    await expect(call('sale', payload('sale'), op)).rejects.toThrow('stock_ledger_out_of_sync');
    expect(await snapshot()).toEqual(state);
    await db`UPDATE public.stock_batches SET remaining_qty = 20 WHERE product_id = ${product}`;
    expect(await call('sale', payload('sale'), op)).toHaveProperty('id');
  });

  it('rolls back legacy no-counter undo instead of partially restoring stock', async () => {
    const sale = await call('sale', payload('sale'));
    await db`UPDATE public.sales SET source_counter_id = NULL WHERE id = ${sale.id}`;
    const state = await snapshot();
    await expect(call('undo_sale', { sale_id: sale.id })).rejects.toThrow('legacy_sale_has_no_counter');
    expect(await snapshot()).toEqual(state);
  });

  it.each(['stock', 'average_cost', 'shop_id', 'id', 'code', 'product_type', 'updated_at'])('rejects forbidden product patch field %s', async field => {
    const state = await snapshot();
    await expect(call('update_product', { product_id: product, patch: { [field]: 1 } })).rejects.toThrow('unsupported_product_patch_field');
    expect(await snapshot()).toEqual(state);
  });
  it('supports nullable barcode clearing, while omitted fields stay unchanged', async () => {
    await call('update_product', { product_id: product, patch: { barcode: '123', brand: 'Brand' } });
    const updated = await call('update_product', { product_id: product, patch: { barcode: null } });
    expect(updated.barcode).toBeNull(); expect(updated.brand).toBe('Brand'); expect(updated.stock).toBe(20);
  });
  it('retains database constraints and validates JSON payload types', async () => {
    const state = await snapshot();
    await expect(call('unknown', {})).rejects.toThrow('invalid_operation_kind');
    await expect(call('sale', { ...payload('sale'), ignored: true })).rejects.toThrow('unknown_operation_payload_field');
    await expect(call('sale', { ...payload('sale'), qty: '2' })).rejects.toThrow('operation_integer_field_required');
    await expect(call('update_product', { product_id: product, patch: { price: -1 } })).rejects.toThrow('check constraint');
    await expect(call('update_product', { product_id: product, patch: { name: null } })).rejects.toThrow('not-null constraint');
    await expect(call('update_product', { product_id: product, patch: { archived: 'false' } })).rejects.toThrow('product_archived_must_be_boolean');
    expect(await snapshot()).toEqual(state);
  });

  it('replays the original response after product edits, archival and counter deactivation', async () => {
    const op = randomUUID(); const first = await call('sale', payload('sale'), op);
    await db`UPDATE public.products SET archived = true, price = 999 WHERE id = ${product}`;
    await db`UPDATE public.service_counters SET active = false WHERE id = ${counter}`;
    expect(await call('sale', payload('sale'), op)).toEqual(first);
  });
  it('replays a completed result even after the referenced product was deleted', async () => {
    const op = randomUUID(); const first = await call('update_product', payload('update_product'), op);
    await db`DELETE FROM public.products WHERE id = ${product}`;
    expect(await call('update_product', payload('update_product'), op)).toEqual(first);
  });
  it('supports shared inventory without introducing counter balances', async () => {
    const op = randomUUID();
    const first = await call('sale', { product_id: otherProduct, counter_id: otherCounter, qty: 2 }, op, owner, otherShop);
    await call('undo_sale', { sale_id: first.id }, randomUUID(), owner, otherShop);
    const [p] = await db`SELECT stock FROM public.products WHERE id = ${otherProduct}`;
    expect(p.stock).toBe(20);
    const [b] = await db`SELECT count(*)::int AS count FROM public.counter_stock_balances WHERE shop_id = ${otherShop}`;
    expect(b.count).toBe(0);
  });

  it('serializes concurrent replays while the first transaction is still uncommitted', async () => {
    const op = randomUUID();
    let release!: () => void; let claimed!: () => void;
    const hold = new Promise<void>(resolve => { release = resolve; });
    const ready = new Promise<void>(resolve => { claimed = resolve; });
    const first = db.begin(async tx => {
      await tx.unsafe('SET LOCAL ROLE authenticated');
      await tx`SELECT set_config('request.jwt.claim.sub', ${owner}, true)`;
      const [row] = await tx`SELECT public.apply_pos_operation(${shop}::uuid, ${op}::uuid, 'sale', ${tx.json(payload('sale'))}) AS result`;
      claimed(); await hold; return row.result;
    });
    await ready;
    let finished = false;
    const duplicates = Promise.all(Array.from({ length: 6 }, () => call('sale', payload('sale'), op))).then(rows => { finished = true; return rows; });
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(finished).toBe(false);
    } finally { release(); }
    const result = await first;
    for (const replay of await duplicates) expect(replay).toEqual(result);
    const [s] = await db`SELECT count(*)::int AS count FROM public.sales WHERE shop_id = ${shop}`;
    expect(s.count).toBe(1);
    const [p] = await db`SELECT stock FROM public.products WHERE id = ${product}`;
    expect(p.stock).toBe(18);
  });

  it('rejects a concurrent conflicting payload without applying a second mutation', async () => {
    const op = randomUUID();
    const results = await Promise.allSettled([
      call('sale', payload('sale'), op), call('sale', { ...payload('sale'), qty: 3 }, op),
    ]);
    expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1);
    const failed = results.find(r => r.status === 'rejected') as PromiseRejectedResult;
    expect(failed.reason.message).toContain('operation_id_reused');
    const [s] = await db`SELECT count(*)::int AS count FROM public.sales WHERE shop_id = ${shop}`;
    expect(s.count).toBe(1);
  });

  it('keeps the mutation and operation ledger inside the caller transaction', async () => {
    const op = randomUUID(); const state = await snapshot();
    await expect(db.begin(async tx => {
      await tx.unsafe('SET LOCAL ROLE authenticated');
      await tx`SELECT set_config('request.jwt.claim.sub', ${owner}, true)`;
      await tx`SELECT public.apply_pos_operation(${shop}::uuid, ${op}::uuid, 'sale', ${tx.json(payload('sale'))})`;
      throw new Error('caller abort');
    })).rejects.toThrow('caller abort');
    expect(await snapshot()).toEqual(state);
    expect(await call('sale', payload('sale'), op)).toHaveProperty('id');
  });
});
