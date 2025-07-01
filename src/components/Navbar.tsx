
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
  Library,
  Menu,
  X
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newPendingRequestsCount, setNewPendingRequestsCount] = useState(0);
  const [lastVisitedRequests, setLastVisitedRequests] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        
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
        
        // Load last visited requests timestamp
        const lastVisited = localStorage.getItem(`lastVisitedRequests_${session.user.id}`);
        setLastVisitedRequests(lastVisited);
        checkForNewPendingRequests(session.user.id, lastVisited);
      } else {
        setProfile(null);
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
    setMobileMenuOpen(false);
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
    onPageChange('free-books');
  };

  const handlePageChange = (page: string) => {
    onPageChange(page);
    setMobileMenuOpen(false);
    
    // If navigating to requests page, clear notifications
    if (page === 'requests' && user) {
      setTimeout(() => {
        setNewPendingRequestsCount(0);
      }, 100);
    }
  };

  const NavButton = ({ page, icon: Icon, children, className = "" }: { 
    page: string; 
    icon: any; 
    children: React.ReactNode; 
    className?: string;
  }) => (
    <Button
      variant={currentPage === page ? 'default' : 'ghost'}
      onClick={() => handlePageChange(page)}
      className={`relative justify-start ${className}`}
    >
      <Icon className="h-4 w-4 mr-2" />
      {children}
      {page === 'requests' && newPendingRequestsCount > 0 && (
        <Badge 
          variant="destructive" 
          className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
        >
          {newPendingRequestsCount}
        </Badge>
      )}
    </Button>
  );

  return (
    <>
      <nav className="bg-background border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => handlePageChange('free-books')}
              className="flex items-center space-x-2 text-xl font-bold text-primary"
            >
              <BookOpen className="h-6 w-6" />
              <span className="hidden sm:block">BookBridge</span>
            </button>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex space-x-1">
              <NavButton page="free-books" icon={Library}>
                Free Books
              </NavButton>
              
              <NavButton page="browse" icon={BookOpen}>
                Browse Books
              </NavButton>
              
              {user && (
                <>
                  <NavButton page="donate" icon={Plus}>
                    Donate Book
                  </NavButton>
                  
                  <NavButton page="requests" icon={MessageSquare}>
                    My Requests
                  </NavButton>
                  
                  <NavButton page="donated" icon={Heart}>
                    My Donations
                  </NavButton>
                </>
              )}
            </div>
            
            {/* Desktop User Section */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <NotificationBadge onClick={() => handlePageChange('notifications')} />
                  
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span className="text-sm truncate max-w-32">
                      {profile?.full_name || user.email}
                    </span>
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

            {/* Mobile Menu Button */}
            <div className="flex items-center space-x-2 md:hidden">
              {user && <NotificationBadge onClick={() => handlePageChange('notifications')} />}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t bg-background">
              <div className="py-4 space-y-2">
                <NavButton page="free-books" icon={Library} className="w-full">
                  Free Books
                </NavButton>
                
                <NavButton page="browse" icon={BookOpen} className="w-full">
                  Browse Books
                </NavButton>
                
                {user ? (
                  <>
                    <NavButton page="donate" icon={Plus} className="w-full">
                      Donate Book
                    </NavButton>
                    
                    <NavButton page="requests" icon={MessageSquare} className="w-full">
                      My Requests
                    </NavButton>
                    
                    <NavButton page="donated" icon={Heart} className="w-full">
                      My Donations
                    </NavButton>

                    <div className="border-t pt-4 mt-4">
                      <div className="flex items-center space-x-2 px-4 py-2">
                        <User className="h-5 w-5" />
                        <span className="text-sm truncate">
                          {profile?.full_name || user.email}
                        </span>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        onClick={handleSignOut}
                        className="w-full mt-2"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button 
                    onClick={() => {
                      setAuthOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full"
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          )}
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
