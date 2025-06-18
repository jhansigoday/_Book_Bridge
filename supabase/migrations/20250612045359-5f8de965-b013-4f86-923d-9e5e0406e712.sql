
-- First, let's check and update the specific books more precisely
-- Update books to 'donated' status based on partial title matches
UPDATE books 
SET status = 'donated' 
WHERE (
    title ILIKE '%math%' OR 
    title ILIKE '%phy%' OR 
    title ILIKE '%physics%' OR
    title ILIKE '%ncert%social%' OR
    title ILIKE '%class 10%' OR
    title ILIKE '%iit foundation%'
) AND status = 'available';

-- Also mark any related requests as completed
UPDATE book_requests 
SET status = 'completed' 
WHERE book_id IN (
    SELECT id FROM books 
    WHERE (
        title ILIKE '%math%' OR 
        title ILIKE '%phy%' OR 
        title ILIKE '%physics%' OR
        title ILIKE '%ncert%social%' OR
        title ILIKE '%class 10%' OR
        title ILIKE '%iit foundation%'
    ) AND status = 'donated'
);
