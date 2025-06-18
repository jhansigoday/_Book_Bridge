
-- Create a trigger function that deletes books when they are allocated
CREATE OR REPLACE FUNCTION delete_allocated_books()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the book status has changed to 'donated' or 'completed'
  IF NEW.status IN ('donated', 'completed') AND OLD.status != NEW.status THEN
    -- Delete the book record
    DELETE FROM public.books WHERE id = NEW.id;
    -- Return NULL since the row is being deleted
    RETURN NULL;
  END IF;
  -- Return the new row if no deletion occurred
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger that fires after any update on the books table
CREATE TRIGGER trigger_delete_allocated_books
  AFTER UPDATE ON public.books
  FOR EACH ROW
  EXECUTE FUNCTION delete_allocated_books();
