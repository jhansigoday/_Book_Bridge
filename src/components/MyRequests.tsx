import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, MessageSquare, CheckCircle, XCircle, Trash2, User, Phone, MapPin, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ContactExchange } from '@/components/ContactExchange';

interface BookRequest {
  id: string;
  message: string | null;
  status: string;
  created_at: string;
  book_id: string;
  requester_id: string;
  donor_id: string;
  books: {
    title: string;
    author: string;
    category: string;
    condition: string;
    description: string;
  };
  requester_profile?: {
    full_name: string;
    username: string;
  };
  donor_profile?: {
    full_name: string;
    username: string;
  };
}

export const MyRequests = () => {
  const [sentRequests, setSentRequests] = useState<BookRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<BookRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [contactExchangeRequestId, setContactExchangeRequestId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserAndRequests();
  }, []);

  const fetchUserAndRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await fetchRequests(user.id);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
    setLoading(false);
  };

  const fetchRequests = async (userId: string) => {
    try {
      // Fetch sent requests (requests I made)
      const { data: sentData, error: sentError } = await supabase
        .from('book_requests')
        .select(`
          *,
          books!inner(title, author, category, condition, description)
        `)
        .eq('requester_id', userId)
        .order('created_at', { ascending: false });

      if (sentError) throw sentError;

      // Fetch received requests (requests for my books)
      const { data: receivedData, error: receivedError } = await supabase
        .from('book_requests')
        .select(`
          *,
          books!inner(title, author, category, condition, description)
        `)
        .eq('donor_id', userId)
        .order('created_at', { ascending: false });

      if (receivedError) throw receivedError;

      // Fetch requester profiles for received requests
      if (receivedData && receivedData.length > 0) {
        const requesterIds = receivedData.map(req => req.requester_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, username')
          .in('id', requesterIds);

        const requestsWithProfiles = receivedData.map(req => ({
          ...req,
          requester_profile: profiles?.find(p => p.id === req.requester_id)
        }));
        setReceivedRequests(requestsWithProfiles);
      } else {
        setReceivedRequests([]);
      }

      // Fetch donor profiles for sent requests
      if (sentData && sentData.length > 0) {
        const donorIds = sentData.map(req => req.donor_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, username')
          .in('id', donorIds);

        const requestsWithProfiles = sentData.map(req => ({
          ...req,
          donor_profile: profiles?.find(p => p.id === req.donor_id)
        }));
        setSentRequests(requestsWithProfiles);
      } else {
        setSentRequests([]);
      }

    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch book requests.",
        variant: "destructive",
      });
    }
  };

  const handleAcceptRequest = async (requestId: string, bookTitle: string, requesterId: string) => {
    try {
      console.log('Accepting request:', requestId);
      
      // Update request status to accepted
      const { error: updateError } = await supabase
        .from('book_requests')
        .update({ 
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (updateError) {
        console.error('Error updating request status:', updateError);
        throw updateError;
      }

      console.log('Request status updated successfully');

      // Create notification for requester about acceptance
      try {
        const { error: notificationError } = await supabase.rpc('create_book_notification', {
          user_id: requesterId,
          notification_type: 'request_accepted',
          notification_title: 'Book Request Accepted! 📚',
          notification_message: `Great news! Your request for "${bookTitle}" has been accepted. You can now exchange contact information with the donor to arrange pickup.`
        });

        if (notificationError) {
          console.error('Notification error:', notificationError);
        } else {
          console.log('Acceptance notification sent successfully');
        }
      } catch (notificationError) {
        console.error('Failed to send acceptance notification:', notificationError);
      }

      // Update local state
      setReceivedRequests(prev => 
        prev.map(req => 
          req.id === requestId ? { ...req, status: 'accepted' } : req
        )
      );

      toast({
        title: "Request accepted! 🎉",
        description: "The book request has been accepted. You can now exchange contact information.",
      });

      // Open contact exchange modal
      setContactExchangeRequestId(requestId);
    } catch (error: any) {
      console.error('Error in handleAcceptRequest:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to accept request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (requestId: string, bookTitle: string, requesterId: string) => {
    try {
      const { error } = await supabase
        .from('book_requests')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      // Create notification for requester about rejection
      try {
        await supabase.rpc('create_book_notification', {
          user_id: requesterId,
          notification_type: 'request_rejected',
          notification_title: 'Book Request Declined',
          notification_message: `Unfortunately, your request for "${bookTitle}" has been declined by the donor. Don't worry, there are many other books available!`
        });
      } catch (notificationError) {
        console.error('Notification error:', notificationError);
      }

      setReceivedRequests(prev => 
        prev.map(req => 
          req.id === requestId ? { ...req, status: 'rejected' } : req
        )
      );

      toast({
        title: "Request declined",
        description: "The book request has been declined.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteRequest = async (requestId: string, isSent: boolean) => {
    try {
      console.log('Attempting to delete request:', requestId);
      
      // Delete the request directly - contact exchanges should cascade delete if properly set up
      const { error } = await supabase
        .from('book_requests')
        .delete()
        .eq('id', requestId);

      if (error) {
        console.error('Error deleting request:', error);
        throw error;
      }

      console.log('Book request deleted successfully');

      // Update local state immediately
      if (isSent) {
        setSentRequests(prev => prev.filter(req => req.id !== requestId));
      } else {
        setReceivedRequests(prev => prev.filter(req => req.id !== requestId));
      }

      toast({
        title: "Request deleted",
        description: "The request has been successfully deleted.",
      });
    } catch (error: any) {
      console.error('Error in handleDeleteRequest:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleContactExchangeComplete = async () => {
    try {
      console.log('Exchange completed - refreshing data...');
      
      // Refresh all requests data to reflect the completed status
      if (user) {
        await fetchRequests(user.id);
      }
      
      // Close the contact exchange modal
      setContactExchangeRequestId(null);

      toast({
        title: "Exchange completed! 🎊",
        description: "The book has been successfully donated and removed from available listings.",
      });
    } catch (error: any) {
      console.error('Error refreshing data after exchange completion:', error);
      toast({
        title: "Error",
        description: "Exchange completed but failed to refresh data. Please refresh the page.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading your requests...</div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingReceivedCount = receivedRequests.filter(req => req.status === 'pending').length;
  const pendingSentCount = sentRequests.filter(req => req.status === 'pending').length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <MessageSquare className="h-8 w-8 mr-2 text-primary" />
          My Book Requests
        </h1>
        <p className="text-muted-foreground">
          Manage your book requests and donations.
        </p>
      </div>

      <Tabs defaultValue="sent" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sent">
            Requests I Sent 
            {sentRequests.length > 0 && ` (${sentRequests.length})`}
            {pendingSentCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingSentCount} pending
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="received">
            Requests I Received 
            {receivedRequests.length > 0 && ` (${receivedRequests.length})`}
            {pendingReceivedCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingReceivedCount} new
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="sent" className="space-y-4">
          {sentRequests.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No requests sent</h3>
              <p className="text-muted-foreground">
                You haven't sent any book requests yet. Browse available books to make your first request.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {sentRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{request.books.title}</CardTitle>
                        <div className="flex items-center text-muted-foreground mb-2">
                          <User className="h-4 w-4 mr-1" />
                          <span className="text-sm">by {request.books.author}</span>
                          <span className="mx-2">•</span>
                          <span className="text-sm">Donor: {request.donor_profile?.full_name || 'Anonymous'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{request.books.category}</Badge>
                          <Badge variant="outline" className="capitalize">{request.books.condition}</Badge>
                          {getStatusBadge(request.status)}
                        </div>
                      </div>
                      {(request.status === 'pending' || request.status === 'rejected') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRequest(request.id, true)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {request.message && (
                      <div className="bg-muted p-3 rounded mb-3">
                        <p className="text-sm"><strong>Your message:</strong> {request.message}</p>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Requested on {new Date(request.created_at).toLocaleDateString()}
                    </p>
                    {request.status === 'accepted' && (
                      <Button
                        className="mt-3"
                        onClick={() => setContactExchangeRequestId(request.id)}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Exchange Contact Info
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="received" className="space-y-4">
          {receivedRequests.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No requests received</h3>
              <p className="text-muted-foreground">
                You haven't received any requests for your donated books yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {receivedRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{request.books.title}</CardTitle>
                        <div className="flex items-center text-muted-foreground mb-2">
                          <User className="h-4 w-4 mr-1" />
                          <span className="text-sm">by {request.books.author}</span>
                          <span className="mx-2">•</span>
                          <span className="text-sm">Requested by: {request.requester_profile?.full_name || 'Anonymous'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{request.books.category}</Badge>
                          <Badge variant="outline" className="capitalize">{request.books.condition}</Badge>
                          {getStatusBadge(request.status)}
                        </div>
                      </div>
                      {(request.status === 'pending' || request.status === 'rejected') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRequest(request.id, false)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {request.message && (
                      <div className="bg-muted p-3 rounded mb-3">
                        <p className="text-sm"><strong>Message from requester:</strong> {request.message}</p>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground mb-3">
                      Requested on {new Date(request.created_at).toLocaleDateString()}
                    </p>
                    
                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAcceptRequest(request.id, request.books.title, request.requester_id)}
                          size="sm"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleRejectRequest(request.id, request.books.title, request.requester_id)}
                          size="sm"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}
                    
                    {request.status === 'accepted' && (
                      <Button
                        onClick={() => setContactExchangeRequestId(request.id)}
                        size="sm"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Exchange Contact Info
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Contact Exchange Modal */}
      {contactExchangeRequestId && (
        <ContactExchange
          requestId={contactExchangeRequestId}
          isOpen={true}
          onClose={() => setContactExchangeRequestId(null)}
          isDonor={receivedRequests.some(req => req.id === contactExchangeRequestId)}
          onExchangeComplete={handleContactExchangeComplete}
        />
      )}
    </div>
  );
};
// BookBridge update
