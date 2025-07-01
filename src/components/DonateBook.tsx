import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { BookOpen, Heart, Upload, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const DonateBook = () => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: '',
    description: '',
    condition: 'good',
    is_free_to_read: false,
    sharing_type: 'free_donation',
    price: '',
    time_span_days: '',
    donor_location: ''
  });
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const { toast } = useToast();

  // Valid categories that match the database constraint
  const categories = [
    'fiction',
    'non-fiction', 
    'science',
    'technology',
    'history',
    'biography',
    'self-help',
    'education',
    'business',
    'arts',
    'health',
    'religion',
    'philosophy',
    'mystery',
    'romance',
    'fantasy',
    'science-fiction',
    'academic',
    'competitive',
    'other'
  ];

  const conditions = [
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' }
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationDetection = () => {
    setLocationLoading(true);
    
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          console.log('Detected coordinates:', { latitude, longitude });
          
          // Use OpenStreetMap Nominatim with better parameters for accuracy
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=12&addressdetails=1&accept-language=en&extratags=1&namedetails=1`
          );
          
          if (!response.ok) {
            throw new Error('Failed to get location details');
          }
          
          const data = await response.json();
          console.log('Location response:', data);
          
          if (!data || !data.address) {
            throw new Error('No address data received');
          }
          
          const address = data.address;
          
          // Build location string with proper hierarchy in English
          const locationParts = [];
          
          // Add neighborhood/area (most specific)
          if (address.neighbourhood) {
            locationParts.push(address.neighbourhood);
          } else if (address.suburb) {
            locationParts.push(address.suburb);
          } else if (address.residential) {
            locationParts.push(address.residential);
          } else if (address.hamlet) {
            locationParts.push(address.hamlet);
          }
          
          // Add city/town (medium specificity)
          if (address.city) {
            locationParts.push(address.city);
          } else if (address.town) {
            locationParts.push(address.town);
          } else if (address.village) {
            locationParts.push(address.village);
          }
          
          // Add district if different from city
          if (address.state_district && !locationParts.includes(address.state_district)) {
            locationParts.push(address.state_district);
          } else if (address.county && !locationParts.includes(address.county)) {
            locationParts.push(address.county);
          }
          
          // Add state (least specific)
          if (address.state) {
            locationParts.push(address.state);
          }
          
          // Ensure we have at least some location data
          if (locationParts.length === 0) {
            // Fallback to display_name parsing
            const displayName = data.display_name || '';
            const parts = displayName.split(',').map(part => part.trim());
            if (parts.length >= 2) {
              locationParts.push(parts[0], parts[1]); // Take first two parts
            } else {
              locationParts.push('Location detected');
            }
          }
          
          const locationString = locationParts.join(', ');
          console.log('Final location string:', locationString);
          
          handleInputChange('donor_location', locationString);
          
          toast({
            title: "Location detected successfully",
            description: `Location set to: ${locationString}`,
          });
        } catch (error) {
          console.error('Error getting location details:', error);
          toast({
            title: "Location detection failed",
            description: "Could not get location information. Please enter your location manually.",
            variant: "destructive",
          });
        }
        setLocationLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = "Please allow location access or enter your location manually.";
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access was denied. Please allow location access and try again.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable. Please enter your location manually.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
        }
        
        toast({
          title: "Location access failed",
          description: errorMessage,
          variant: "destructive",
        });
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.author.trim() || !formData.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (title, author, and category).",
        variant: "destructive",
      });
      return;
    }

    if (formData.sharing_type === 'sell_book' && (!formData.price || parseFloat(formData.price) <= 0)) {
      toast({
        title: "Missing Price",
        description: "Please enter a valid price for the book.",
        variant: "destructive",
      });
      return;
    }

    if (formData.sharing_type === 'donate_period' && (!formData.time_span_days || parseInt(formData.time_span_days) <= 0)) {
      toast({
        title: "Missing Time Span",
        description: "Please enter a valid time span in days.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be signed in to donate books.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const bookData = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        category: formData.category,
        description: formData.description.trim() || null,
        condition: formData.condition,
        is_free_to_read: formData.is_free_to_read,
        sharing_type: formData.sharing_type,
        price: formData.sharing_type === 'sell_book' ? parseFloat(formData.price) : null,
        time_span_days: formData.sharing_type === 'donate_period' ? parseInt(formData.time_span_days) : null,
        donor_location: formData.donor_location.trim() || null,
        donorid: user.id,
        status: 'available'
      };

      console.log('Attempting to insert book with data:', bookData);

      const { data: insertedBook, error } = await supabase
        .from('books')
        .insert([bookData])
        .select();

      if (error) {
        console.error('Database insert error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to donate book. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Create notification for the donor
      try {
        await supabase.rpc('create_book_notification', {
          user_id: user.id,
          notification_type: 'book_donated',
          notification_title: 'Book Donated Successfully',
          notification_message: `Your book "${formData.title}" has been added to the platform and is now available for requests.`
        });
      } catch (notificationError) {
        console.error('Notification error:', notificationError);
        // Don't fail the whole operation if notification fails
      }

      toast({
        title: "Book donated successfully!",
        description: "Your book has been added to the platform and is now available for others to request.",
      });

      // Reset form
      setFormData({
        title: '',
        author: '',
        category: '',
        description: '',
        condition: 'good',
        is_free_to_read: false,
        sharing_type: 'free_donation',
        price: '',
        time_span_days: '',
        donor_location: ''
      });

    } catch (error: any) {
      console.error('Error donating book:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to donate book. Please try again.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <Heart className="h-8 w-8 mr-2 text-primary" />
          Donate a Book
        </h1>
        <p className="text-muted-foreground">
          Share your books with the community and help spread knowledge.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-6 w-6 mr-2" />
              Book Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter book title"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="author">Author *</Label>
                  <Input
                    id="author"
                    type="text"
                    value={formData.author}
                    onChange={(e) => handleInputChange('author', e.target.value)}
                    placeholder="Enter author name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="condition">Condition</Label>
                  <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((condition) => (
                        <SelectItem key={condition.value} value={condition.value}>
                          {condition.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>How would you like to share this book? *</Label>
                <RadioGroup 
                  value={formData.sharing_type} 
                  onValueChange={(value) => handleInputChange('sharing_type', value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="free_donation" id="free_donation" />
                    <Label htmlFor="free_donation">Free Donation</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sell_book" id="sell_book" />
                    <Label htmlFor="sell_book">Sell Book</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="donate_period" id="donate_period" />
                    <Label htmlFor="donate_period">Donate for a Period of Time</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.sharing_type === 'sell_book' && (
                <div>
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="Enter price in rupees"
                    required
                  />
                </div>
              )}

              {formData.sharing_type === 'donate_period' && (
                <div>
                  <Label htmlFor="time_span">Time Span (Days) *</Label>
                  <Input
                    id="time_span"
                    type="number"
                    min="1"
                    value={formData.time_span_days}
                    onChange={(e) => handleInputChange('time_span_days', e.target.value)}
                    placeholder="Enter number of days"
                    required
                  />
                </div>
              )}

              <div>
                <Label htmlFor="location">Location</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="location"
                    type="text"
                    value={formData.donor_location}
                    onChange={(e) => handleInputChange('donor_location', e.target.value)}
                    placeholder="Enter your location (area, city, state)"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleLocationDetection}
                    disabled={locationLoading}
                    className="whitespace-nowrap"
                  >
                    {locationLoading ? (
                      <>
                        <MapPin className="h-4 w-4 mr-2 animate-spin" />
                        Detecting...
                      </>
                    ) : (
                      <>
                        <MapPin className="h-4 w-4 mr-2" />
                        Detect Location
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the book's content, any special features, or why you're donating it..."
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="free_read"
                  checked={formData.is_free_to_read}
                  onCheckedChange={(checked) => handleInputChange('is_free_to_read', checked as boolean)}
                />
                <Label htmlFor="free_read" className="text-sm">
                  Allow free reading online (book will be available for immediate reading)
                </Label>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">What happens after donation?</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Your book will be listed on the platform for others to request</li>
                  <li>• You'll receive notifications when someone requests your book</li>
                  <li>• You can accept or reject requests based on your preference</li>
                  <li>• Once accepted, you'll coordinate pickup/delivery with the requester</li>
                  {formData.is_free_to_read && (
                    <li>• Readers can also access your book online for free reading</li>
                  )}
                  {formData.sharing_type === 'sell_book' && (
                    <li>• Buyers will pay the specified price for your book</li>
                  )}
                  {formData.sharing_type === 'donate_period' && (
                    <li>• The book will be returned to you after the specified time period</li>
                  )}
                </ul>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Donating Book...
                  </>
                ) : (
                  <>
                    <Heart className="h-4 w-4 mr-2" />
                    Donate Book
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
