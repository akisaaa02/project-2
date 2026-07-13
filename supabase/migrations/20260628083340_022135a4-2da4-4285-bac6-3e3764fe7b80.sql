
-- Allow any authenticated user to insert destinations (admins keep full control via existing policy)
CREATE POLICY "Authenticated users can insert destinations"
ON public.destinations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);
