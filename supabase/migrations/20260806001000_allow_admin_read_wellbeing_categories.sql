-- Admins need the same category list when registering Wellbeing Executives.
-- Restrict visibility to categories belonging to the authenticated admin's
-- college instead of granting a broad authenticated read policy.

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
      where app_user.auth_id = (select auth.uid())
        and app_user.role = 'Admin'
        and app_user."collegeId" = wellbeing_categories."collegeId"
    )
  );

