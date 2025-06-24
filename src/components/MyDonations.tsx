import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, BookOpen, User, Calendar, Eye, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DonatedBook {
  id: string;
  title: string;
  author: string;
  category: string;
  description: string;
  status: string;
  createdat: string;
  condition: string;
  is_free_to_read: boolean;
}

export const MyDonations = () => {
  const [donatedBooks, setDonatedBooks] = useState<DonatedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingBooks, setDeletingBooks] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetchDonatedBooks();
    
    // Set up real-time subscription to listen for book changes
    const booksChannel = supabase
      .channel('donations-books-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'books'
        },
        (payload) => {
          console.log('Book change detected:', payload);
          // Refresh the donations list when any book changes
          fetchDonatedBooks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(booksChannel);
    };
  }, []);

  const fetchDonatedBooks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('donorid', user.id)
        .order('createdat', { ascending: false });

      if (error) throw error;

      setDonatedBooks(data || []);
    } catch (error) {
      console.error('Error fetching donated books:', error);
    }
    setLoading(false);
  };

  const handleDeleteBook = async (bookId: string) => {
    try {
      setDeletingBooks(prev => new Set([...prev, bookId]));

      console.log('Starting deletion process for book:', bookId);

      // Step 1: Delete all book requests for this book (CASCADE will automatically delete contact_exchanges)
      console.log('Step 1: Deleting book requests for book:', bookId);
      
      const { error: deleteRequestsError } = await supabase
        .from('book_requests')
        .delete()
        .eq('book_id', bookId);

      if (deleteRequestsError) {
        console.error('Error deleting book requests:', deleteRequestsError);
        throw new Error(`Failed to delete book requests: ${deleteRequestsError.message}`);
      }

      console.log('Successfully deleted book requests and their contact exchanges');

      // Step 2: Delete the book
      console.log('Step 2: Deleting book:', bookId);
      const { error: bookError } = await supabase
        .from('books')
        .delete()
        .eq('id', bookId);

      if (bookError) {
        console.error('Error deleting book:', bookError);
        throw new Error(`Failed to delete book: ${bookError.message}`);
      }

      console.log('Successfully deleted book');

      // Update local state
      setDonatedBooks(prev => prev.filter(book => book.id !== bookId));

      toast({
        title: "Book removed successfully! 🗑️",
        description: "The book and all its requests have been removed from your donations.",
      });

    } catch (error: any) {
      console.error('Error in handleDeleteBook:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove the book. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingBooks(prev => {
        const newSet = new Set(prev);
        newSet.delete(bookId);
        return newSet;
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-500">Available</Badge>;
      case 'requested':
        return <Badge variant="outline">Requested</Badge>;
      case 'donated':
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <Heart className="h-8 w-8 mr-2 text-primary" />
          My Donations
        </h1>
        <p className="text-muted-foreground">
          Track and manage the books you've donated to the community. You can remove any book at any time.
        </p>
      </div>

      {donatedBooks.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No donations yet</h3>
            <p className="text-muted-foreground mb-4">
              You haven't donated any books yet. Start sharing your books with the community!
            </p>
            <Button>
              <BookOpen className="h-4 w-4 mr-2" />
              Donate Your First Book
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donatedBooks.map((book) => (
            <Card key={book.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{book.title}</CardTitle>
                    <div className="flex items-center text-muted-foreground mb-2">
                      <User className="h-4 w-4 mr-1" />
                      <span className="text-sm">by {book.author}</span>
                    </div>
                    <Badge variant="secondary" className="mb-2">
                      {book.category}
                    </Badge>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(book.status)}
                    {book.is_free_to_read && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <Eye className="h-3 w-3 mr-1" />
                        Free Read
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  {book.description}
                </p>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(book.createdat).toLocaleDateString()}
                  </div>
                  <span>Condition: {book.condition}</span>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteBook(book.id)}
                    disabled={deletingBooks.has(book.id)}
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {deletingBooks.has(book.id) ? 'Removing...' : 'Remove Book'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
// BookBridge update
