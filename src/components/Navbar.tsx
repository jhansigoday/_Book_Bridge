
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Heart, 
  MessageSquare, 
  User, 
  LogOut,
  Plus,
  Library
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AuthDialog } from './AuthDialog';
import { NotificationBadge } from './NotificationBadge';

interface NavbarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

interface UserProfile {
  id: string;
  full_name: string;
  username: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onPageChange }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [totalRequestsCount, setTotalRequestsCount] = useState(0);
  const [newPendingRequestsCount, setNewPendingRequestsCount] = useState(0);
  const [lastVisitedRequests, setLastVisitedRequests] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchRequestCounts(session.user.id);
        
        // Load last visited requests timestamp
        const lastVisited = localStorage.getItem(`lastVisitedRequests_${session.user.id}`);
        setLastVisitedRequests(lastVisited);
        checkForNewPendingRequests(session.user.id, lastVisited);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchRequestCounts(session.user.id);
        
        // Load last visited requests timestamp
        const lastVisited = localStorage.getItem(`lastVisitedRequests_${session.user.id}`);
        setLastVisitedRequests(lastVisited);
        checkForNewPendingRequests(session.user.id, lastVisited);
      } else {
        setProfile(null);
        setTotalRequestsCount(0);
        setNewPendingRequestsCount(0);
        setLastVisitedRequests(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Set up real-time subscriptions for request updates
  useEffect(() => {
    if (!user) return;

    const requestsChannel = supabase
      .channel('navbar-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'book_requests'
        },
        () => {
          fetchRequestCounts(user.id);
          checkForNewPendingRequests(user.id, lastVisitedRequests);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(requestsChannel);
    };
  }, [user, lastVisitedRequests]);

  // Track when user visits requests page
  useEffect(() => {
    if (currentPage === 'requests' && user) {
      const now = new Date().toISOString();
      localStorage.setItem(`lastVisitedRequests_${user.id}`, now);
      setLastVisitedRequests(now);
      setNewPendingRequestsCount(0);
    }
  }, [currentPage, user]);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data);
  };

  const fetchRequestCounts = async (userId: string) => {
    try {
      // Get total count of all requests (sent + received)
      const { data: sentRequests } = await supabase
        .from('book_requests')
        .select('id')
        .eq('requester_id', userId);

      const { data: receivedRequests } = await supabase
        .from('book_requests')
        .select('id')
        .eq('donor_id', userId);

      const totalCount = (sentRequests?.length || 0) + (receivedRequests?.length || 0);
      setTotalRequestsCount(totalCount);

    } catch (error) {
      console.error('Error fetching request counts:', error);
    }
  };

  const checkForNewPendingRequests = async (userId: string, lastVisited: string | null) => {
    try {
      if (!lastVisited) {
        // If never visited, check for any pending requests
        const { data: pendingRequests } = await supabase
          .from('book_requests')
          .select('id')
          .eq('donor_id', userId)
          .eq('status', 'pending');

        setNewPendingRequestsCount(pendingRequests?.length || 0);
        return;
      }

      // Check for new pending requests since last visit
      const { data: newPendingRequests } = await supabase
        .from('book_requests')
        .select('id')
        .eq('donor_id', userId)
        .eq('status', 'pending')
        .gt('created_at', lastVisited);

      setNewPendingRequestsCount(newPendingRequests?.length || 0);
    } catch (error) {
      console.error('Error checking for new pending requests:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
    onPageChange('free-books');
  };

  const handlePageChange = (page: string) => {
    onPageChange(page);
    
    // If navigating to requests page, refresh counts after a short delay
    if (page === 'requests' && user) {
      setTimeout(() => {
        fetchRequestCounts(user.id);
        setNewPendingRequestsCount(0);
      }, 100);
    }
  };

  return (
    <>
      <nav className="bg-background border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <button
                onClick={() => handlePageChange('free-books')}
                className="flex items-center space-x-2 text-xl font-bold text-primary"
              >
                <BookOpen className="h-6 w-6" />
                <span>BookBridge</span>
              </button>
              
              <div className="hidden md:flex space-x-1">
                <Button
                  variant={currentPage === 'free-books' ? 'default' : 'ghost'}
                  onClick={() => handlePageChange('free-books')}
                >
                  <Library className="h-4 w-4 mr-2" />
                  Free Books
                </Button>
                
                <Button
                  variant={currentPage === 'browse' ? 'default' : 'ghost'}
                  onClick={() => handlePageChange('browse')}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse Books
                </Button>
                
                {user && (
                  <>
                    <Button
                      variant={currentPage === 'donate' ? 'default' : 'ghost'}
                      onClick={() => handlePageChange('donate')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Donate Book
                    </Button>
                    
                    <Button
                      variant={currentPage === 'requests' ? 'default' : 'ghost'}
                      onClick={() => handlePageChange('requests')}
                      className="relative"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      My Requests
                      {totalRequestsCount > 0 && (
                        <Badge 
                          variant="secondary" 
                          className="ml-1 h-5 px-1.5 text-xs"
                        >
                          {totalRequestsCount}
                        </Badge>
                      )}
                      {newPendingRequestsCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                        >
                          {newPendingRequestsCount}
                        </Badge>
                      )}
                    </Button>
                    
                    <Button
                      variant={currentPage === 'donated' ? 'default' : 'ghost'}
                      onClick={() => handlePageChange('donated')}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      My Donations
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <NotificationBadge onClick={() => handlePageChange('notifications')} />
                  
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span className="text-sm">{profile?.full_name || user.email}</span>
                  </div>
                  
                  <Button variant="outline" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button onClick={() => setAuthOpen(true)}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <AuthDialog
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthSuccess={() => setAuthOpen(false)}
      />
    </>
  );
};
