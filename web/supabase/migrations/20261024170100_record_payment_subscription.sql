-- record_payment now also activates the cohort pass, in the same transaction.
-- Adding p_cohort changes the signature, so the old function is dropped first
-- (create or replace would add an overload instead of replacing it).
drop function public.record_payment(text, integer, text, boolean, jsonb, uuid);

create function public.record_payment(
  p_transaction_id text,
  p_amount_cents integer,
  p_plan text,
  p_success boolean,
  p_raw jsonb default null,
  p_user_id uuid default null,
  p_cohort text default null
) returns public.payments
language plpgsql
set search_path = ''
as $$
declare
  result public.payments;
  period_end timestamptz;
begin
  -- First notification inserts the row. A repeat only changes it once, from failed to success
  -- (e.g. pending then success for the same transaction); any other repeat changes nothing.
  insert into public.payments (user_id, paymob_transaction_id, amount_cents, plan, success, raw)
  values (p_user_id, p_transaction_id, p_amount_cents, p_plan, p_success, p_raw)
  on conflict (paymob_transaction_id) do update
    set success = true,
        raw = excluded.raw,
        user_id = coalesce(public.payments.user_id, excluded.user_id)
    where not public.payments.success and excluded.success
  returning * into result;

  if result.id is null then
    -- Already recorded: return it untouched, so the pass is never activated twice.
    select * into result from public.payments where paymob_transaction_id = p_transaction_id;
    return result;
  end if;

  -- The stored row decides who gets the pass, not the caller's arguments.
  if result.success and result.user_id is not null and p_cohort is not null then
    period_end := case p_cohort
      when '2027' then '2027-08-31 23:59:59 Africa/Cairo'::timestamptz
    end;
    if period_end is null then
      raise exception 'Unknown cohort %', p_cohort;
    end if;

    insert into public.subscriptions (user_id, cohort, plan, status, current_period_end, payment_id)
    values (result.user_id, p_cohort, result.plan, 'active', period_end, result.id)
    on conflict (user_id, cohort) do update
      set plan = excluded.plan,
          status = 'active',
          current_period_end = excluded.current_period_end,
          payment_id = excluded.payment_id;
  end if;

  return result;
end;
$$;

revoke execute on function public.record_payment from public, anon, authenticated;
grant execute on function public.record_payment to service_role;
