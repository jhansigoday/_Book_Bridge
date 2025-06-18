
-- Mark the specific books as donated since contact details have been exchanged
UPDATE books 
SET status = 'donated' 
WHERE title IN ('Physics', 'Mathematics', 'NCERT Social Science', 'Mathematics IIT Foundation')
AND status = 'available';

-- Also update any completed book requests to ensure consistency
UPDATE book_requests 
SET status = 'completed' 
WHERE book_id IN (
    SELECT id FROM books 
    WHERE title IN ('Physics', 'Mathematics', 'NCERT Social Science', 'Mathematics IIT Foundation')
);
