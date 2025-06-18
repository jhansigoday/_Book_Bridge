
-- First, let's see what status values actually exist in the table
SELECT status, COUNT(*) as count 
FROM book_requests 
GROUP BY status 
ORDER BY count DESC;

-- Update any rows with NULL or invalid status values to 'pending'
UPDATE book_requests 
SET status = 'pending' 
WHERE status IS NULL OR status NOT IN ('pending', 'accepted', 'rejected', 'completed');

-- Now try to add the constraint again
ALTER TABLE book_requests DROP CONSTRAINT IF EXISTS book_requests_status_check;
ALTER TABLE book_requests ADD CONSTRAINT book_requests_status_check 
CHECK (status IN ('pending', 'accepted', 'rejected', 'completed'));

-- Also fix the books table constraint
ALTER TABLE books DROP CONSTRAINT IF EXISTS books_status_check;
ALTER TABLE books ADD CONSTRAINT books_status_check 
CHECK (status IN ('available', 'donated', 'requested'));
