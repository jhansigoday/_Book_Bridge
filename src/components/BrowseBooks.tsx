
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BookOpen, User, Search, MessageSquare, RefreshCw, MapPin, IndianRupee, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  description: string;
  condition: string;
  donorid: string;
  status: string;
  sharing_type: string;
  price: number | null;
  time_span_days: number | null;
  donor_location: string | null;
  profiles: {
    full_name: string;
  } | null;
}

export const BrowseBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [conditionFilter, setConditionFilter] = useState('All');
  const [sharingTypeFilter, setSharingTypeFilter] = useState('All');
  const [user, setUser] = useState<any>(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchUserAndBooks();
    
    // Set up real-time subscription for books table changes
    const booksChannel = supabase
      .channel('books-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'books'
        },
        (payload) => {
          console.log('Books table changed:', payload);
          
          // Handle different types of changes
          if (payload.eventType === 'DELETE') {
            // Remove the deleted book from the local state immediately
            setBooks(prevBooks => prevBooks.filter(book => book.id !== payload.old?.id));
          } else if (payload.eventType === 'UPDATE') {
            // Check if the book status changed to something that should remove it from browse
            const updatedBook = payload.new;
            if (updatedBook && (updatedBook.status !== 'available' || updatedBook.is_free_to_read === true)) {
              console.log('Book status changed, removing from browse list:', updatedBook);
              // Remove the book immediately from local state since it's no longer browsable
              setBooks(prevBooks => prevBooks.filter(book => book.id !== updatedBook.id));
            } else {
              // For other updates, refresh the entire list to ensure accuracy
              fetchBooks();
            }
          } else {
            // For INSERT, refresh the entire list
            fetchBooks();
          }
        }
      )
      .subscribe();

    // Also listen for book_requests changes as they might affect availability
    const requestsChannel = supabase
      .channel('book-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'book_requests'
        },
        (payload) => {
          console.log('Book requests table changed:', payload);
          // Refresh books when requests change (completed exchanges affect availability)
          fetchBooks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(booksChannel);
      supabase.removeChannel(requestsChannel);
    };
  }, []);

  useEffect(() => {
    filterBooks();
  }, [books, searchTerm, categoryFilter, conditionFilter, sharingTypeFilter]);

  const fetchUserAndBooks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      await fetchBooks();
    } catch (error) {
      console.error('Error fetching user:', error);
    }
    setLoading(false);
  };

  const fetchBooks = async () => {
    try {
      console.log('=== FETCHING AVAILABLE BOOKS ===');
      
      // Fetch books that are truly available for browsing and requesting
      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select('*')
        .eq('status', 'available')
        .eq('is_free_to_read', false)
        .order('createdat', { ascending: false });

      if (booksError) {
        console.error('Error fetching books:', booksError);
        throw booksError;
      }

      console.log('Books fetched from database:', booksData);

      // Additional filter to ensure we only show truly available books
      const availableBooks = booksData?.filter(book => {
        console.log(`Checking book "${book.title}": status=${book.status}, is_free_to_read=${book.is_free_to_read}`);
        return book.status === 'available' && book.is_free_to_read === false;
      }) || [];

      console.log('Final available books:', availableBooks);
      console.log('Available books count:', availableBooks.length);

      // Get donor profiles
      const donorIds = [...new Set(availableBooks.map(book => book.donorid).filter(Boolean))];
      
      let profilesData: any[] = [];
      if (donorIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', donorIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        } else {
          profilesData = profiles || [];
        }
      }

      const booksWithProfiles = availableBooks.map(book => ({
        ...book,
        profiles: profilesData.find(profile => profile.id === book.donorid) || null
      }));

      console.log('Final books with profiles:', booksWithProfiles);
      setBooks(booksWithProfiles);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast({
        title: "Error",
        description: "Failed to fetch available books.",
        variant: "destructive",
      });
    }
  };

  const refreshBooks = async () => {
    setRefreshing(true);
    await fetchBooks();
    setRefreshing(false);
    toast({
      title: "Books refreshed",
      description: "The book list has been updated with the latest available books.",
    });
  };

  const filterBooks = () => {
    let filtered = books;

    if (searchTerm) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'All') {
      filtered = filtered.filter(book => book.category === categoryFilter);
    }

    if (conditionFilter !== 'All') {
      filtered = filtered.filter(book => book.condition === conditionFilter);
    }

    if (sharingTypeFilter !== 'All') {
      filtered = filtered.filter(book => book.sharing_type === sharingTypeFilter);
    }

    setFilteredBooks(filtered);
  };

  const handleRequestBook = (book: Book) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to request a book.",
        variant: "destructive",
      });
      return;
    }

    if (book.donorid === user.id) {
      toast({
        title: "Cannot request",
        description: "You cannot request your own book.",
        variant: "destructive",
      });
      return;
    }

    setSelectedBook(book);
    setRequestDialogOpen(true);
  };

  const submitBookRequest = async () => {
    if (!selectedBook) return;

    try {
      console.log('Submitting book request:', {
        book_id: selectedBook.id,
        requester_id: user.id,
        donor_id: selectedBook.donorid,
        message: requestMessage,
        status: 'pending'
      });

      const { error } = await supabase
        .from('book_requests')
        .insert([{
          book_id: selectedBook.id,
          requester_id: user.id,
          donor_id: selectedBook.donorid,
          message: requestMessage,
          status: 'pending'
        }]);

      if (error) {
        console.error('Error inserting book request:', error);
        throw error;
      }

      // Create notification for the donor
      try {
        await supabase.rpc('create_book_notification', {
          user_id: selectedBook.donorid,
          notification_type: 'book_request',
          notification_title: 'New Book Request! 📚',
          notification_message: `Someone has requested your book "${selectedBook.title}". Check your requests to accept or decline.`
        });
      } catch (notificationError) {
        console.error('Notification error:', notificationError);
      }

      // Create notification for the requester (confirmation)
      try {
        await supabase.rpc('create_book_notification', {
          user_id: user.id,
          notification_type: 'request_sent',
          notification_title: 'Request Sent! 📤',
          notification_message: `Your request for "${selectedBook.title}" has been sent to the donor. You'll be notified when they respond.`
        });
      } catch (notificationError) {
        console.error('Notification error:', notificationError);
      }

      toast({
        title: "Request sent! 📬",
        description: "Your book request has been sent to the donor. You'll be notified when they respond.",
      });

      setRequestDialogOpen(false);
      setRequestMessage('');
      setSelectedBook(null);
    } catch (error: any) {
      console.error('Error in submitBookRequest:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getSharingTypeDisplay = (book: Book) => {
    switch (book.sharing_type) {
      case 'free_donation':
        return { label: 'Free Donation', color: 'bg-green-500' };
      case 'sell_book':
        return { label: `₹${book.price}`, color: 'bg-blue-500' };
      case 'donate_period':
        return { label: `${book.time_span_days} days`, color: 'bg-orange-500' };
      default:
        return { label: 'Free Donation', color: 'bg-green-500' };
    }
  };

  const categories = ['All', ...Array.from(new Set(books.map(book => book.category)))];
  const conditions = ['All', 'excellent', 'good', 'fair', 'poor'];
  const sharingTypes = ['All', 'free_donation', 'sell_book', 'donate_period'];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading available books...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2 flex items-center justify-center">
              <BookOpen className="h-10 w-10 mr-3" />
              Browse Books
            </h1>
            <p className="text-xl opacity-90">Request Books from Our Community</p>
            <p className="mt-2 opacity-75">Browse and request physical books donated by our generous community members</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-6 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by title or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={conditionFilter} onValueChange={setConditionFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent>
                {conditions.map((condition) => (
                  <SelectItem key={condition} value={condition}>
                    {condition === 'All' ? 'All' : condition.charAt(0).toUpperCase() + condition.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sharingTypeFilter} onValueChange={setSharingTypeFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Sharing Type" />
              </SelectTrigger>
              <SelectContent>
                {sharingTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === 'All' ? 'All' : 
                     type === 'free_donation' ? 'Free' :
                     type === 'sell_book' ? 'For Sale' :
                     type === 'donate_period' ? 'Period' : type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="default"
              onClick={refreshBooks}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map((book) => {
            const sharingDisplay = getSharingTypeDisplay(book);
            return (
              <Card key={book.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg mb-2 line-clamp-2">{book.title}</CardTitle>
                  <div className="flex items-center text-muted-foreground mb-2">
                    <User className="h-4 w-4 mr-1" />
                    <span className="text-sm">{book.author}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">
                      {book.category}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {book.condition}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-white ${sharingDisplay.color}`}>
                      {book.sharing_type === 'sell_book' && <IndianRupee className="h-3 w-3 mr-1" />}
                      {book.sharing_type === 'donate_period' && <Calendar className="h-3 w-3 mr-1" />}
                      {sharingDisplay.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-3">
                    {book.description}
                  </p>
                  {book.donor_location && (
                    <div className="flex items-center text-muted-foreground text-xs mb-3">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="line-clamp-1">{book.donor_location}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      <span>Donated by: {book.profiles?.full_name || 'Anonymous'}</span>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => handleRequestBook(book)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Request
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredBooks.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No books found</h3>
            <p className="text-muted-foreground">
              {books.length === 0 
                ? "No books are currently available for request."
                : "Try adjusting your search criteria to find more books."
              }
            </p>
          </div>
        )}
      </div>

      {/* Request Dialog */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Book</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedBook && (
              <div className="p-4 bg-muted rounded">
                <h4 className="font-semibold">{selectedBook.title}</h4>
                <p className="text-sm text-muted-foreground">by {selectedBook.author}</p>
                <p className="text-sm text-muted-foreground">
                  Condition: {selectedBook.condition}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {(() => {
                    const display = getSharingTypeDisplay(selectedBook);
                    return (
                      <Badge className={`text-white ${display.color}`}>
                        {selectedBook.sharing_type === 'sell_book' && <IndianRupee className="h-3 w-3 mr-1" />}
                        {selectedBook.sharing_type === 'donate_period' && <Calendar className="h-3 w-3 mr-1" />}
                        {display.label}
                      </Badge>
                    );
                  })()}
                </div>
                {selectedBook.donor_location && (
                  <div className="flex items-center text-muted-foreground text-sm mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{selectedBook.donor_location}</span>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Donor: {selectedBook.profiles?.full_name || 'Anonymous'}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="message">Message (optional)</Label>
              <Textarea
                id="message"
                placeholder="Write a message to the book donor..."
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setRequestDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitBookRequest}>
                Send Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
