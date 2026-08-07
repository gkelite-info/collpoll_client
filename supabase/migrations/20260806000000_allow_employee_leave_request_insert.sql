-- Employees submit leave requests from the authenticated browser client.
-- Tie the numeric application user/college values to the Supabase auth user so
-- callers cannot create requests on behalf of another employee or college.

drop policy if exists "Employees can create their own leave requests"
  on public.employee_leave_requests;

create policy "Employees can create their own leave requests"
  on public.employee_leave_requests
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.users as app_user
      where app_user.auth_id = (select auth.uid())
        and app_user."userId" = employee_leave_requests."userId"
        and app_user."collegeId" = employee_leave_requests."collegeId"
    )
    and exists (
      select 1
      from public.employee_ids as employee
      where employee."employeeIdPk" = employee_leave_requests."employeeId"
        and employee."userId" = employee_leave_requests."userId"
        and employee."collegeId" = employee_leave_requests."collegeId"
        and employee."isActive" = true
        and employee."deletedAt" is null
    )
    and employee_leave_requests.status = 'pending'
    and employee_leave_requests."isActive" = true
    and employee_leave_requests.is_deleted = false
  );

