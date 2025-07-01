
-- Add new columns to the books table for sharing options and location
ALTER TABLE books 
ADD COLUMN sharing_type TEXT CHECK (sharing_type IN ('free_donation', 'sell_book', 'donate_period')) DEFAULT 'free_donation',
ADD COLUMN price DECIMAL(10,2),
ADD COLUMN time_span_days INTEGER,
ADD COLUMN donor_location TEXT;

-- Update the existing books to have the default sharing type
UPDATE books SET sharing_type = 'free_donation' WHERE sharing_type IS NULL;
