
import { supabase } from '@/integrations/supabase/client';

export const removeSpecificBooks = async () => {
  const booksToRemove = [
    'harry potter',
    'MATHS IIT FOUNDATION CLASS 10', 
    'Engineering Mathematics',
    'Database System Concepts'
  ];

  try {
    console.log('=== REMOVING SPECIFIC BOOKS ===');
    console.log('Books to remove:', booksToRemove);
    
    // Get all books that match these titles (case insensitive)
    const { data: existingBooks, error: fetchError } = await supabase
      .from('books')
      .select('*');

    if (fetchError) {
      console.error('Error fetching books:', fetchError);
      throw fetchError;
    }

    console.log('All existing books:', existingBooks);

    // Find books that match any of the titles to remove (case insensitive)
    const booksToUpdate = existingBooks?.filter(book => 
      booksToRemove.some(titleToRemove => 
        book.title.toLowerCase().includes(titleToRemove.toLowerCase()) ||
        titleToRemove.toLowerCase().includes(book.title.toLowerCase())
      )
    ) || [];

    console.log('Books found to update:', booksToUpdate);

    if (booksToUpdate.length === 0) {
      console.log('No books found to remove');
      return [];
    }

    // Update each book individually with detailed logging
    const updatePromises = booksToUpdate.map(async (book) => {
      console.log(`Updating book "${book.title}" (ID: ${book.id}) status to 'donated'`);
      
      const { data, error } = await supabase
        .from('books')
        .update({ status: 'donated' })
        .eq('id', book.id)
        .select();

      if (error) {
        console.error(`Error updating book ${book.title}:`, error);
        throw error;
      }

      console.log(`Successfully updated book "${book.title}":`, data);
      return data;
    });

    const results = await Promise.all(updatePromises);
    const flatResults = results.flat();
    
    console.log('All update results:', flatResults);
    return flatResults;
  } catch (error) {
    console.error('Failed to remove books:', error);
    throw error;
  }
};
// BookBridge update
