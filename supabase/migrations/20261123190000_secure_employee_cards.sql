-- NIKAMED employee-card data boundary
-- Applied to the connected Supabase project.
-- No employee, salon, or auth rows are deleted or modified.

begin;

drop policy if exists "Public can read employees" on public.employees;
drop policy if exists "Public can read active employee card fields" on public.employees;

revoke all privileges on table public.employees from anon, authenticated;
grant select, insert, update, delete on table public.employees to authenticated;

-- Anonymous QR visitors see active profiles only.
create policy "Public can read active employee card fields"
on public.employees for select to anon
using (status = 'active');

-- Remove any earlier column grants, then expose only the fields used on QR cards.
revoke all (id,name,first_name,middle_name,last_name,role,salon_id,phone,whatsapp,telegram,work_phone,work_ext,email,photo,experience,tags,status,scans,spark,staff,created_at,updated_at)
on public.employees from anon;
grant select (id,name,role,salon_id,work_phone,work_ext,email,photo,experience,tags)
on public.employees to anon;

revoke all privileges on table public.salons from anon, authenticated;
grant select on table public.salons to anon;
grant select, insert, update, delete on table public.salons to authenticated;

revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

drop view if exists public.employee_cards;
create view public.employee_cards
with (security_invoker = true, security_barrier = true)
as
select
  e.id, e.name, e.role, e.salon_id,
  s.name as salon_name, s.city as salon_city, s.address as salon_address,
  s.hours as salon_hours,
  e.work_phone, e.work_ext, e.email, e.photo, e.experience, e.tags
from public.employees e
left join public.salons s on s.id=e.salon_id;

revoke all on table public.employee_cards from public, anon, authenticated;
grant select on table public.employee_cards to anon, authenticated;

commit;
