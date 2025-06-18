import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BookOpen, User, Search, Filter, MessageSquare } from 'lucide-react';
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
  profiles: {
    full_name: string;
  } | null;
}

export const AvailableBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [conditionFilter, setConditionFilter] = useState('All');
  const [user, setUser] = useState<any>(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchUserAndBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [books, searchTerm, categoryFilter, conditionFilter]);

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
      // First fetch books that are available and not free to read
      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select('*')
        .eq('status', 'available')
        .eq('is_free_to_read', false)
        .order('createdat', { ascending: false });

      if (booksError) throw booksError;

      // Then fetch profiles for the donors
      const donorIds = [...new Set(booksData?.map(book => book.donorid).filter(Boolean))];
      
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

      // Combine books with profile data
      const booksWithProfiles = booksData?.map(book => ({
        ...book,
        profiles: profilesData.find(profile => profile.id === book.donorid) || null
      })) || [];

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
      const { error } = await supabase
        .from('book_requests')
        .insert([{
          book_id: selectedBook.id,
          requester_id: user.id,
          donor_id: selectedBook.donorid,
          message: requestMessage,
          status: 'pending'
        }]);

      if (error) throw error;

      // Create notification for donor
      try {
        await supabase.rpc('create_book_notification', {
          user_id: selectedBook.donorid,
          notification_type: 'book_request',
          notification_title: 'New Book Request',
          notification_message: `Someone has requested your book "${selectedBook.title}".`
        });
      } catch (notificationError) {
        console.error('Notification error:', notificationError);
      }

      toast({
        title: "Request sent!",
        description: "Your book request has been sent to the donor.",
      });

      setRequestDialogOpen(false);
      setRequestMessage('');
      setSelectedBook(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const categories = ['All', ...Array.from(new Set(books.map(book => book.category)))];
  const conditions = ['All', 'excellent', 'good', 'fair', 'poor'];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading available books...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <BookOpen className="h-8 w-8 mr-2 text-primary" />
          Available Books for Request
        </h1>
        <p className="text-muted-foreground">
          Browse and request books donated by our community members.
        </p>
      </div>

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
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBooks.map((book) => (
          <Card key={book.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg mb-2 line-clamp-2">{book.title}</CardTitle>
              </div>
              <div className="flex items-center text-muted-foreground mb-2">
                <User className="h-4 w-4 mr-1" />
                <span className="text-sm">{book.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {book.category}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {book.condition}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                {book.description}
              </p>
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
        ))}
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
