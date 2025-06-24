
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { BookOpen, Heart, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const DonateBook = () => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: '',
    description: '',
    condition: 'good',
    is_free_to_read: false
  });
  const [loading, setLoading] = useState(false);
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

      console.log('Attempting to insert book with data:', {
        title: formData.title.trim(),
        author: formData.author.trim(),
        category: formData.category,
        description: formData.description.trim() || null,
        condition: formData.condition,
        is_free_to_read: formData.is_free_to_read,
        donorid: user.id,
        status: 'available'
      });

      const { data: insertedBook, error } = await supabase
        .from('books')
        .insert([{
          title: formData.title.trim(),
          author: formData.author.trim(),
          category: formData.category,
          description: formData.description.trim() || null,
          condition: formData.condition,
          is_free_to_read: formData.is_free_to_read,
          donorid: user.id,
          status: 'available'
        }])
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
        is_free_to_read: false
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
// BookBridge update
