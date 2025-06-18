
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, Maximize, Minimize, Bookmark, Share, Sun, Moon, Plus, Minus, ArrowLeft, ArrowRight } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  author: string;
  content?: { page: number; text: string }[];
}

interface BookReaderProps {
  book: Book;
  isOpen: boolean;
  onClose: () => void;
  fullscreen?: boolean;
}

export const BookReader: React.FC<BookReaderProps> = ({ 
  book, 
  isOpen, 
  onClose, 
  fullscreen = false 
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(fullscreen);
  const [fontSize, setFontSize] = useState(16);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [bookmarks, setBookmarks] = useState<number[]>([]);

  useEffect(() => {
    // Load saved preferences from localStorage
    const savedFontSize = localStorage.getItem('reader-font-size');
    const savedDarkMode = localStorage.getItem('reader-dark-mode');
    const savedBookmarks = localStorage.getItem(`bookmarks-${book.id}`);

    if (savedFontSize) setFontSize(parseInt(savedFontSize));
    if (savedDarkMode) setIsDarkMode(savedDarkMode === 'true');
    if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
  }, [book.id]);

  const content = book.content || [];
  const totalPages = content.length;

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const increaseFontSize = () => {
    const newSize = Math.min(fontSize + 2, 24);
    setFontSize(newSize);
    localStorage.setItem('reader-font-size', newSize.toString());
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(fontSize - 2, 12);
    setFontSize(newSize);
    localStorage.setItem('reader-font-size', newSize.toString());
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('reader-dark-mode', newMode.toString());
  };

  const toggleBookmark = () => {
    const newBookmarks = bookmarks.includes(currentPage)
      ? bookmarks.filter(page => page !== currentPage)
      : [...bookmarks, currentPage];
    
    setBookmarks(newBookmarks);
    localStorage.setItem(`bookmarks-${book.id}`, JSON.stringify(newBookmarks));
  };

  const shareBook = () => {
    if (navigator.share) {
      navigator.share({
        title: book.title,
        text: `Check out this book: ${book.title} by ${book.author}`,
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(`Check out this book: ${book.title} by ${book.author} - ${window.location.href}`);
      alert('Book link copied to clipboard!');
    }
  };

  const handleClose = () => {
    setCurrentPage(0);
    setIsFullscreen(false);
    onClose();
  };

  const readerTheme = isDarkMode 
    ? 'bg-gray-900 text-gray-100' 
    : 'bg-white text-gray-900';

  const controlsTheme = isDarkMode
    ? 'bg-gray-800 border-gray-600 text-gray-100'
    : 'bg-background border-border text-foreground';

  const buttonTheme = isDarkMode
    ? 'border-gray-600 bg-gray-700 text-gray-100 hover:bg-gray-600 hover:text-white'
    : 'border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground';

  if (isFullscreen) {
    return (
      <div className={`fixed inset-0 z-50 ${readerTheme} ${isOpen ? 'block' : 'hidden'}`}>
        <div className="h-full flex flex-col">
          {/* Fullscreen Header */}
          <div className={`flex items-center justify-between p-4 border-b ${controlsTheme} sticky top-0 z-10`}>
            <div>
              <h2 className="text-xl font-bold">{book.title}</h2>
              <p className="text-sm text-muted-foreground">by {book.author}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={decreaseFontSize} className={buttonTheme}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className={`text-sm px-2 ${isDarkMode ? 'text-gray-100' : 'text-foreground'}`}>{fontSize}px</span>
              <Button variant="outline" size="sm" onClick={increaseFontSize} className={buttonTheme}>
                <Plus className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={toggleDarkMode} className={buttonTheme}>
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleBookmark}
                className={`${buttonTheme} ${bookmarks.includes(currentPage) ? 'bg-yellow-500 border-yellow-400 text-yellow-900 hover:bg-yellow-400' : ''}`}
              >
                <Bookmark className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={shareBook} className={buttonTheme}>
                <Share className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={toggleFullscreen} className={buttonTheme}>
                <Minimize className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleClose} className={buttonTheme}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Fullscreen Content */}
          <div className="flex-1 overflow-auto relative">
            <div className="max-w-4xl mx-auto p-8">
              <div className={`${readerTheme} border rounded-lg p-8 min-h-[600px] flex flex-col relative`}>
                <div className="flex-1 overflow-auto">
                  {content[currentPage] && (
                    <div className="prose prose-lg max-w-none">
                      <pre 
                        className="whitespace-pre-wrap font-serif leading-relaxed"
                        style={{ fontSize: `${fontSize}px` }}
                      >
                        {content[currentPage].text}
                      </pre>
                    </div>
                  )}
                </div>
                
                {/* Fixed bottom navigation */}
                <div className={`sticky bottom-4 mt-8 flex items-center justify-between backdrop-blur-sm p-4 rounded-lg border ${controlsTheme}`}>
                  <Button
                    variant="outline"
                    onClick={prevPage}
                    disabled={currentPage === 0}
                    className={buttonTheme}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-muted-foreground'}`}>
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    onClick={nextPage}
                    disabled={currentPage === totalPages - 1}
                    className={buttonTheme}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden">
        <div className={`flex flex-col h-[85vh] ${readerTheme}`}>
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b ${controlsTheme} flex-shrink-0`}>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold truncate">{book.title}</h2>
              <p className="text-sm text-muted-foreground truncate">by {book.author}</p>
            </div>
            <div className="flex items-center gap-1 ml-4">
              <Button variant="outline" size="sm" onClick={decreaseFontSize} className={buttonTheme}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className={`text-xs px-1 min-w-[40px] text-center ${isDarkMode ? 'text-gray-100' : 'text-foreground'}`}>{fontSize}px</span>
              <Button variant="outline" size="sm" onClick={increaseFontSize} className={buttonTheme}>
                <Plus className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={toggleDarkMode} className={buttonTheme}>
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleBookmark}
                className={`${buttonTheme} ${bookmarks.includes(currentPage) ? 'bg-yellow-500 border-yellow-400 text-yellow-900 hover:bg-yellow-400' : ''}`}
              >
                <Bookmark className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={shareBook} className={buttonTheme}>
                <Share className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={toggleFullscreen} className={buttonTheme}>
                <Maximize className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleClose} className={buttonTheme}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Content with proper scrolling */}
          <div className="flex-1 overflow-auto p-6">
            {content[currentPage] && (
              <div className="max-w-none">
                <div 
                  className="whitespace-pre-wrap font-serif leading-relaxed text-justify"
                  style={{ 
                    fontSize: `${fontSize}px`,
                    lineHeight: '1.6',
                    maxWidth: '100%',
                    wordWrap: 'break-word'
                  }}
                >
                  {content[currentPage].text}
                </div>
              </div>
            )}
          </div>
          
          {/* Navigation */}
          <div className={`flex items-center justify-between p-4 border-t ${controlsTheme} flex-shrink-0`}>
            <Button
              variant="outline"
              onClick={prevPage}
              disabled={currentPage === 0}
              size="sm"
              className={buttonTheme}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-muted-foreground'}`}>
              Page {currentPage + 1} of {totalPages}
            </span>
            
            <Button
              variant="outline"
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
              size="sm"
              className={buttonTheme}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
