
-- Add CASCADE to the foreign key constraint so that when a book_request is deleted, 
-- all related contact_exchanges are automatically deleted
ALTER TABLE contact_exchanges 
DROP CONSTRAINT IF EXISTS contact_exchanges_request_id_fkey;

ALTER TABLE contact_exchanges 
ADD CONSTRAINT contact_exchanges_request_id_fkey 
FOREIGN KEY (request_id) 
REFERENCES book_requests(id) 
ON DELETE CASCADE;
