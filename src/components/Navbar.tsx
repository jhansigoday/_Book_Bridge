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
  const [pendingRequests, setPendingRequests] = useState(0);
  const [lastVisitedRequests, setLastVisitedRequests] = useState<string | null>(null);
  const [newActivityCount, setNewActivityCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchPendingRequests(session.user.id);
        checkForNewActivity(session.user.id);
        
        // Load last visited requests timestamp
        const lastVisited = localStorage.getItem(`lastVisitedRequests_${session.user.id}`);
        setLastVisitedRequests(lastVisited);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchPendingRequests(session.user.id);
        checkForNewActivity(session.user.id);
        
        // Load last visited requests timestamp
        const lastVisited = localStorage.getItem(`lastVisitedRequests_${session.user.id}`);
        setLastVisitedRequests(lastVisited);
      } else {
        setProfile(null);
        setPendingRequests(0);
        setLastVisitedRequests(null);
        setNewActivityCount(0);
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
          fetchPendingRequests(user.id);
          checkForNewActivity(user.id);
        }
      )
      .subscribe();

    const contactExchangesChannel = supabase
      .channel('navbar-contact-exchanges')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contact_exchanges'
        },
        () => {
          checkForNewActivity(user.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(requestsChannel);
      supabase.removeChannel(contactExchangesChannel);
    };
  }, [user]);

  // Track when user visits requests page
  useEffect(() => {
    if (currentPage === 'requests' && user) {
      const now = new Date().toISOString();
      localStorage.setItem(`lastVisitedRequests_${user.id}`, now);
      setLastVisitedRequests(now);
      setNewActivityCount(0);
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

  const fetchPendingRequests = async (userId: string) => {
    try {
      // Get last visited requests timestamp
      const lastVisited = localStorage.getItem(`lastVisitedRequests_${userId}`);
      
      // Count pending requests that I received (for my donated books) created after last visit
      let query = supabase
        .from('book_requests')
        .select('id, created_at')
        .eq('donor_id', userId)
        .eq('status', 'pending');

      // If user has visited requests page before, only count requests created after that visit
      if (lastVisited) {
        query = query.gt('created_at', lastVisited);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching pending requests:', error);
        return;
      }

      setPendingRequests(data?.length || 0);
    } catch (error) {
      console.error('Error in fetchPendingRequests:', error);
    }
  };

  const checkForNewActivity = async (userId: string) => {
    try {
      const lastVisited = localStorage.getItem(`lastVisitedRequests_${userId}`);
      if (!lastVisited) {
        setNewActivityCount(1);
        return;
      }

      let totalCount = 0;

      // Check for new requests (both sent and received)
      const { data: newRequests } = await supabase
        .from('book_requests')
        .select('id')
        .or(`requester_id.eq.${userId},donor_id.eq.${userId}`)
        .gt('created_at', lastVisited);

      totalCount += newRequests?.length || 0;

      // Check for request status updates
      const { data: updatedRequests } = await supabase
        .from('book_requests')
        .select('id')
        .or(`requester_id.eq.${userId},donor_id.eq.${userId}`)
        .gt('updated_at', lastVisited)
        .neq('status', 'pending');

      totalCount += updatedRequests?.length || 0;

      // Check for new contact exchanges
      const { data: contactExchanges } = await supabase
        .from('contact_exchanges')
        .select(`
          id,
          request_id,
          book_requests!inner(
            requester_id,
            donor_id
          )
        `)
        .or(`book_requests.requester_id.eq.${userId},book_requests.donor_id.eq.${userId}`)
        .gt('created_at', lastVisited);

      totalCount += contactExchanges?.length || 0;

      setNewActivityCount(totalCount);
    } catch (error) {
      console.error('Error checking for new activity:', error);
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
    
    // If navigating to requests page, refresh pending count after a short delay
    if (page === 'requests' && user) {
      setTimeout(() => {
        fetchPendingRequests(user.id);
        setNewActivityCount(0);
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
                      {(pendingRequests > 0 || newActivityCount > 0) && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                        >
                          {pendingRequests > 0 ? pendingRequests : newActivityCount}
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
