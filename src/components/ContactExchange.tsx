import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Phone, MapPin, User, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ContactExchangeProps {
  requestId: string;
  isOpen: boolean;
  onClose: () => void;
  isDonor: boolean;
  onExchangeComplete: () => void;
}

export const ContactExchange: React.FC<ContactExchangeProps> = ({
  requestId,
  isOpen,
  onClose,
  isDonor,
  onExchangeComplete
}) => {
  const [myPhone, setMyPhone] = useState('');
  const [myAddress, setMyAddress] = useState('');
  const [contactExchange, setContactExchange] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [bookRequest, setBookRequest] = useState<any>(null);
  const [fetchingData, setFetchingData] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && requestId) {
      console.log('ContactExchange opened with requestId:', requestId);
      fetchAllData();
    }
  }, [isOpen, requestId]);

  const fetchAllData = async () => {
    setFetchingData(true);
    try {
      await Promise.all([
        fetchContactExchange(),
        fetchBookRequest(),
        loadMyContactInfo()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setFetchingData(false);
    }
  };

  const fetchBookRequest = async () => {
    try {
      console.log('Fetching book request for ID:', requestId);
      
      // First get the book request
      const { data: requestData, error: requestError } = await supabase
        .from('book_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (requestError) {
        console.error('Error fetching book request:', requestError);
        throw requestError;
      }

      console.log('Book request data:', requestData);

      // Then get the book details
      const { data: bookData, error: bookError } = await supabase
        .from('books')
        .select('*')
        .eq('id', requestData.book_id)
        .single();

      if (bookError) {
        console.error('Error fetching book:', bookError);
        throw bookError;
      }

      console.log('Book data:', bookData);

      // Get requester profile
      const { data: requesterProfile, error: requesterError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', requestData.requester_id)
        .single();

      if (requesterError) {
        console.error('Error fetching requester profile:', requesterError);
      }

      // Get donor profile
      const { data: donorProfile, error: donorError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', requestData.donor_id)
        .single();

      if (donorError) {
        console.error('Error fetching donor profile:', donorError);
      }

      // Combine all data
      const combinedData = {
        ...requestData,
        books: bookData,
        requester_profile: requesterProfile,
        donor_profile: donorProfile
      };

      console.log('Combined book request data:', combinedData);
      setBookRequest(combinedData);

    } catch (error) {
      console.error('Error in fetchBookRequest:', error);
      toast({
        title: "Error",
        description: "Failed to load book request details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const loadMyContactInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('phone, address')
          .eq('id', user.id)
          .single();

        if (profile) {
          setMyPhone(profile.phone || '');
          setMyAddress(profile.address || '');
        }
      }
    } catch (error) {
      console.error('Error loading contact info:', error);
    }
  };

  const fetchContactExchange = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_exchanges')
        .select('*')
        .eq('request_id', requestId)
        .maybeSingle();

      if (error) throw error;
      setContactExchange(data);
    } catch (error) {
      console.error('Error fetching contact exchange:', error);
    }
  };

  const shareMyContactInfo = async () => {
    if (!myPhone.trim() && !myAddress.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide at least your phone number or address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const updateData = isDonor 
        ? { donor_phone: myPhone, donor_address: myAddress }
        : { requester_phone: myPhone, requester_address: myAddress };

      if (contactExchange) {
        const { error } = await supabase
          .from('contact_exchanges')
          .update(updateData)
          .eq('id', contactExchange.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('contact_exchanges')
          .insert([{
            request_id: requestId,
            ...updateData
          }]);

        if (error) throw error;
      }

      // Create notification for the other party
      const otherUserId = isDonor ? bookRequest?.requester_id : bookRequest?.donor_id;
      const roleText = isDonor ? 'donor' : 'recipient';
      
      if (otherUserId) {
        try {
          await supabase.rpc('create_book_notification', {
            user_id: otherUserId,
            notification_type: 'contact_shared',
            notification_title: `Contact Details Shared`,
            notification_message: `The book ${roleText} has shared their contact information for "${bookRequest?.books?.title}".`
          });
        } catch (notificationError) {
          console.error('Notification error:', notificationError);
        }
      }

      await fetchContactExchange();
      
      toast({
        title: "Contact information shared",
        description: "Your contact details have been shared successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const completeExchange = async () => {
    console.log('=== STARTING COMPLETE EXCHANGE ===');
    console.log('BookRequest state:', bookRequest);
    
    if (!bookRequest) {
      console.error('BookRequest is null or undefined');
      toast({
        title: "Error",
        description: "Book request data is not available. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }

    if (!bookRequest.books || !bookRequest.books.id) {
      console.error('Book data is missing:', bookRequest.books);
      toast({
        title: "Error",
        description: "Book information is missing. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Starting exchange completion process...');
      console.log('Request ID:', requestId);
      console.log('Book ID:', bookRequest.books.id);
      console.log('Book title:', bookRequest.books.title);

      // Step 1: Update book status to 'donated' FIRST
      console.log('=== Step 1: Updating book status ===');
      const { data: bookUpdateData, error: bookError } = await supabase
        .from('books')
        .update({ 
          status: 'donated'
        })
        .eq('id', bookRequest.books.id)
        .select();

      if (bookError) {
        console.error('Error updating book status:', bookError);
        throw new Error(`Failed to update book status: ${bookError.message}`);
      }
      console.log('Book status updated successfully:', bookUpdateData);

      // Step 2: Update request status to 'completed'
      console.log('=== Step 2: Updating request status ===');
      const { data: requestUpdateData, error: requestError } = await supabase
        .from('book_requests')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select();

      if (requestError) {
        console.error('Error updating request status:', requestError);
        throw new Error(`Failed to update request status: ${requestError.message}`);
      }
      console.log('Request status updated successfully:', requestUpdateData);

      // Step 3: Send notifications (but don't let errors here fail the whole process)
      console.log('=== Step 3: Sending notifications ===');
      const donorId = bookRequest.donor_id;
      const requesterId = bookRequest.requester_id;
      const bookTitle = bookRequest.books?.title || 'Unknown Book';

      try {
        // Simplified notification creation - just insert directly into the table
        await supabase
          .from('notifications')
          .insert([
            {
              userid: donorId,
              type: 'exchange_completed',
              title: 'Book Exchange Completed! 🎉',
              message: `Congratulations! Your book "${bookTitle}" has been successfully donated. Thank you for contributing to our community!`
            },
            {
              userid: requesterId,
              type: 'exchange_completed',
              title: 'Book Received! 📖',
              message: `You have successfully received "${bookTitle}". Happy reading! Don't forget to consider donating books when you're done.`
            }
          ]);
        console.log('Notifications sent successfully');
      } catch (notificationError) {
        console.error('Failed to send notifications (but continuing):', notificationError);
        // Don't fail the whole process for notification errors
      }

      console.log('=== EXCHANGE COMPLETED SUCCESSFULLY ===');

      toast({
        title: "Exchange completed! 🎊",
        description: "The book has been successfully donated and will be removed from available listings.",
      });

      onExchangeComplete();
      onClose();
    } catch (error: any) {
      console.error('=== ERROR IN COMPLETE EXCHANGE ===', error);
      toast({
        title: "Error",
        description: error.message || "Failed to complete exchange. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const hasSharedMyInfo = contactExchange && (isDonor 
    ? (contactExchange.donor_phone || contactExchange.donor_address)
    : (contactExchange.requester_phone || contactExchange.requester_address));

  const hasReceivedOtherInfo = contactExchange && (isDonor 
    ? (contactExchange.requester_phone || contactExchange.requester_address)
    : (contactExchange.donor_phone || contactExchange.donor_address));

  const canCompleteExchange = hasSharedMyInfo && hasReceivedOtherInfo;

  if (fetchingData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <div className="text-center py-8">
            <div className="text-lg">Loading exchange details...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Exchange Contact Information
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[75vh] pr-4">
          {bookRequest && (
            <div className="mb-4 p-3 bg-muted rounded">
              <h4 className="font-semibold">{bookRequest.books?.title}</h4>
              <p className="text-sm text-muted-foreground">by {bookRequest.books?.author}</p>
              <p className="text-sm text-muted-foreground">
                {isDonor ? 'Requested by' : 'Donated by'}: {
                  isDonor 
                    ? bookRequest.requester_profile?.full_name || 'Anonymous'
                    : bookRequest.donor_profile?.full_name || 'Anonymous'
                }
              </p>
            </div>
          )}

          <div className="space-y-6">
            {/* My Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Your Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="myPhone">Phone Number</Label>
                  <Input
                    id="myPhone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={myPhone}
                    onChange={(e) => setMyPhone(e.target.value)}
                    disabled={hasSharedMyInfo}
                  />
                </div>
                <div>
                  <Label htmlFor="myAddress">Address</Label>
                  <Textarea
                    id="myAddress"
                    placeholder="Enter your address for book pickup/delivery"
                    value={myAddress}
                    onChange={(e) => setMyAddress(e.target.value)}
                    disabled={hasSharedMyInfo}
                    rows={3}
                  />
                </div>
                {!hasSharedMyInfo && (
                  <Button onClick={shareMyContactInfo} disabled={loading}>
                    {loading ? 'Sharing...' : 'Share My Contact Info'}
                  </Button>
                )}
                {hasSharedMyInfo && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Your contact information has been shared</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Other Party's Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {isDonor ? "Book Recipient's Details" : "Book Donor's Details"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hasReceivedOtherInfo ? (
                  <div className="space-y-3">
                    {(isDonor ? contactExchange?.requester_phone : contactExchange?.donor_phone) && (
                      <div>
                        <Label>Phone Number</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{isDonor ? contactExchange.requester_phone : contactExchange.donor_phone}</span>
                        </div>
                      </div>
                    )}
                    {(isDonor ? contactExchange?.requester_address : contactExchange?.donor_address) && (
                      <div>
                        <Label>Address</Label>
                        <div className="flex items-start gap-2 mt-1">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <span>{isDonor ? contactExchange.requester_address : contactExchange.donor_address}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Waiting for the {isDonor ? 'book recipient' : 'book donor'} to share their contact information...
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Complete Exchange */}
            {canCompleteExchange && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-green-800">Ready to Complete Exchange</h4>
                      <p className="text-sm text-green-600">
                        Both parties have shared contact information. You can now arrange the book handover.
                      </p>
                    </div>
                    <Button 
                      onClick={completeExchange} 
                      disabled={loading || !bookRequest || !bookRequest.books?.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {loading ? 'Completing...' : 'Mark as Completed'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
