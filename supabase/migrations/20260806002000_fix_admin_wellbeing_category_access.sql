-- Use the authoritative admins registration when determining college access.
-- The Admin UI already resolves its context through this same users -> admins
-- relationship, so category visibility stays consistent with the application.

drop policy if exists "Admins can view wellbeing categories for their college"
  on public.wellbeing_categories;

create policy "Admins can view wellbeing categories for their college"
  on public.wellbeing_categories
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.users as app_user
      inner join public.admins as app_admin
        on app_admin."userId" = app_user."userId"
      where app_user.auth_id = (select auth.uid())
        and app_admin."collegeId" = wellbeing_categories."collegeId"
        and app_admin.is_deleted is not true
        and app_admin."deletedAt" is null
    )
  );

