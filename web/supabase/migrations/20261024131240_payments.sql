-- Payments recorded per transaction. The unique transaction id keeps
-- a repeated notification from being recorded twice.
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  paymob_transaction_id text not null unique,
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'EGP',
  plan text not null,
  success boolean not null,
  raw jsonb,
  created_at timestamptz not null default now()
);

-- Only the server (service role) touches this table.
alter table public.payments enable row level security;

-- Idempotent insert: a repeated notification returns the existing row
-- instead of recording the payment twice.
create function public.record_payment(
  p_transaction_id text,
  p_amount_cents integer,
  p_plan text,
  p_success boolean,
  p_raw jsonb default null,
  p_user_id uuid default null
) returns public.payments
language plpgsql
as $$
declare
  result public.payments;
begin
  insert into public.payments (user_id, paymob_transaction_id, amount_cents, plan, success, raw)
  values (p_user_id, p_transaction_id, p_amount_cents, p_plan, p_success, p_raw)
  on conflict (paymob_transaction_id) do nothing
  returning * into result;

  if result.id is null then
    select * into result from public.payments where paymob_transaction_id = p_transaction_id;
  end if;

  return result;
end;
$$;

revoke execute on function public.record_payment from public, anon, authenticated;
grant execute on function public.record_payment to service_role;
