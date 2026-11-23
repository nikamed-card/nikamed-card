-- NIKAMED employee-card data boundary
-- Applied directly to the connected Supabase project on 2026-11-23.
-- Safe to re-run: no rows are deleted or modified.

begin;

-- Public visitors must never read the full employee table.
drop policy if exists "Public can read employees" on public.employees;

-- Keep authenticated CRUD privileges; RLS limits them to the designated admin UUID.
revoke all privileges on table public.employees from anon, authenticated;
grant select, insert, update, delete on table public.employees to authenticated;

-- Public branch/salon information remains readable; mutations remain admin-only through RLS.
revoke all privileges on table public.salons from anon, authenticated;
grant select on table public.salons to anon;
grant select, insert, update, delete on table public.salons to authenticated;

-- This SECURITY DEFINER event-trigger handler is for internal DDL automation, not RPC callers.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- A deliberately narrow public projection for active QR cards only.
-- The view owner is postgres; base-table access remains denied to anon.
create or replace view public.employee_cards
with (security_barrier = true)
as
select
  e.id,
  e.name,
  e.role,
  e.salon_id,
  s.name as salon_name,
  s.city as salon_city,
  s.address as salon_address,
  e.phone,
  e.whatsapp,
  e.telegram,
  e.work_phone,
  e.work_ext,
  e.email,
  e.photo,
  e.experience,
  e.tags
from public.employees e
left join public.salons s on s.id = e.salon_id
where e.status = 'active';

revoke all on table public.employee_cards from public, anon, authenticated;
grant select on table public.employee_cards to anon, authenticated;

commit;
