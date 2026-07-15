-- Run once after adding accountant_expenses.collegeEducationId.
-- Existing expenses are assigned to the creator's primary education type, or
-- to the first active mapped education when the primary field is empty.
update public.accountant_expenses expense
set
  "collegeEducationId" = coalesce(
    accountant."collegeEducationId",
    (
      select min(assignment."collegeEducationId")
      from public.accountant_education_types assignment
      where assignment."accountantId" = accountant."accountantId"
        and assignment."isActive" = true
        and assignment.is_deleted = false
        and assignment."deletedAt" is null
    )
  ),
  "updatedAt" = now()
from public.accountants accountant
where expense."collegeEducationId" is null
  and expense."createdBy" = accountant."userId"
  and expense."collegeId" = accountant."collegeId"
  and accountant."isActive" = true
  and accountant.is_deleted = false
  and accountant."deletedAt" is null;
