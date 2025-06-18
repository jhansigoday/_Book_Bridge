
-- First, let's see what categories currently exist in the books table
SELECT DISTINCT category FROM books WHERE category IS NOT NULL;

-- Drop the existing constraint completely for now
ALTER TABLE books DROP CONSTRAINT IF EXISTS books_category_check;

-- Update any problematic categories to valid ones
UPDATE books SET category = 'other' WHERE category NOT IN (
    'fiction', 'non-fiction', 'science', 'technology', 'history', 
    'biography', 'self-help', 'education', 'business', 'arts', 
    'health', 'religion', 'philosophy', 'mystery', 'romance', 
    'fantasy', 'science-fiction', 'academic', 'competitive', 'other'
);

-- Now add the constraint back with all valid categories
ALTER TABLE books ADD CONSTRAINT books_category_check 
CHECK (category IN (
    'fiction', 'non-fiction', 'science', 'technology', 'history', 
    'biography', 'self-help', 'education', 'business', 'arts', 
    'health', 'religion', 'philosophy', 'mystery', 'romance', 
    'fantasy', 'science-fiction', 'academic', 'competitive', 'other'
));
