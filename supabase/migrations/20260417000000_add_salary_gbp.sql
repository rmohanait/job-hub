ALTER TABLE public.applications
  ADD COLUMN salary_gbp integer NULL,
  ADD CONSTRAINT applications_salary_gbp_non_negative CHECK (salary_gbp IS NULL OR salary_gbp >= 0);
