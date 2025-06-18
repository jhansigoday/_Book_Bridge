
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, User, Maximize, Library } from 'lucide-react';
import { booksData } from '@/data/booksData';
import { BookReader } from '@/components/BookReader';

interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  description: string;
  isfeatured: boolean;
  is_free_to_read: boolean;
  content?: { page: number; text: string }[];
}

const additionalFreeBooks: Book[] = [
  {
    id: 'free-4',
    title: 'The Art of Programming',
    author: 'Sarah Chen',
    category: 'Technology',
    description: 'A comprehensive guide to programming principles and best practices. Learn the fundamentals that every developer should know.',
    isfeatured: true,
    is_free_to_read: true,
    content: [
      { page: 1, text: 'Chapter 1: Introduction to Programming\n\nProgramming is both an art and a science. It requires logical thinking, creativity, and attention to detail. In this book, we will explore the fundamental concepts that make great programmers.\n\nThe journey of learning to program is like learning a new language. At first, the syntax may seem foreign and the concepts abstract. However, with practice and patience, you will begin to see patterns and develop an intuitive understanding of how computers think.\n\nProgramming is not just about writing code; it\'s about solving problems. Every program you write should address a specific need or challenge. The best programmers are those who can break down complex problems into smaller, manageable pieces and then implement elegant solutions.\n\nIn the modern world, programming skills are becoming increasingly valuable across all industries. From healthcare to finance, from entertainment to education, software is transforming how we work and live.' },
      { page: 2, text: 'The first principle of good programming is clarity. Your code should tell a story that other developers can easily understand and follow. This means using meaningful variable names, writing clear comments, and organizing your code in a logical structure.\n\nConsider the following example:\n\n// Poor naming\nint x = 5;\nint y = 10;\nint z = x * y;\n\n// Clear naming\nint length = 5;\nint width = 10;\nint area = length * width;\n\nThe second example immediately tells us what the code is doing - calculating the area of a rectangle. Good code is self-documenting and requires minimal explanation.\n\nAnother important aspect of clarity is consistency. Choose a coding style and stick to it throughout your project. This includes consistent indentation, naming conventions, and code organization.' },
      { page: 3, text: 'Chapter 2: Data Structures\n\nData structures are the building blocks of efficient algorithms. Understanding how to organize and manipulate data is crucial for any programmer. Different data structures are optimized for different types of operations.\n\nArrays are the most basic data structure. They store elements in contiguous memory locations, allowing for fast random access. However, inserting or deleting elements in the middle of an array can be expensive because all subsequent elements must be shifted.\n\nLinked lists solve the insertion and deletion problem by using pointers to connect elements. Each element (or node) contains data and a reference to the next element. This makes insertion and deletion at any position very efficient, but random access becomes slower.\n\nStacks follow the Last-In-First-Out (LIFO) principle. Think of a stack of plates - you can only add or remove plates from the top. Stacks are essential for function calls, expression evaluation, and backtracking algorithms.' },
      { page: 4, text: 'Queues implement the First-In-First-Out (FIFO) principle, like a line at a coffee shop. The first person in line is the first to be served. Queues are fundamental in breadth-first search algorithms, task scheduling, and handling requests in web servers.\n\nTrees are hierarchical data structures with a root node and child nodes. Binary search trees maintain a specific ordering that allows for efficient searching, insertion, and deletion operations. The average time complexity for these operations is O(log n).\n\nHash tables (or hash maps) provide near-constant time complexity for insertion, deletion, and lookup operations. They use a hash function to map keys to array indices, making them incredibly efficient for key-value storage.\n\nGraphs represent relationships between entities. They consist of vertices (nodes) and edges (connections). Graphs can model social networks, transportation systems, and many other real-world scenarios.' },
      { page: 5, text: 'Chapter 3: Algorithms\n\nAn algorithm is a step-by-step procedure for solving a problem. Good algorithms are efficient, correct, and elegant. Understanding algorithm complexity helps you choose the right approach for your specific problem.\n\nTime complexity measures how the running time of an algorithm changes as the input size grows. Common time complexities include:\n\n• O(1) - Constant time: The algorithm takes the same amount of time regardless of input size\n• O(log n) - Logarithmic time: Time increases slowly as input size grows\n• O(n) - Linear time: Time increases proportionally with input size\n• O(n²) - Quadratic time: Time increases with the square of input size\n\nSorting algorithms demonstrate these concepts well. Bubble sort has O(n²) time complexity, while merge sort achieves O(n log n). For large datasets, this difference can mean the difference between seconds and hours of computation time.\n\nThe key to mastering algorithms is understanding when to apply each one and recognizing the trade-offs between time and space complexity.' }
    ]
  },
  {
    id: 'free-5',
    title: 'Mindful Living',
    author: 'Dr. Maya Patel',
    category: 'Self-Help',
    description: 'Discover the power of mindfulness and how it can transform your daily life. Practical techniques for stress reduction and mental clarity.',
    isfeatured: true,
    is_free_to_read: true,
    content: [
      { page: 1, text: 'Chapter 1: What is Mindfulness?\n\nMindfulness is the practice of being present in the moment, aware of your thoughts and feelings without judgment. It\'s about observing your experience as it unfolds, rather than getting caught up in the stories your mind creates about that experience.\n\nThe roots of mindfulness can be traced back thousands of years to Buddhist meditation practices. However, in recent decades, scientific research has validated many of the benefits that practitioners have long known. Studies show that regular mindfulness practice can reduce stress, improve focus, enhance emotional regulation, and even boost immune function.\n\nAt its core, mindfulness is about waking up to your life. How often do we go through our days on autopilot, barely noticing what we\'re doing or how we\'re feeling? Mindfulness invites us to step out of this unconscious state and engage fully with our present moment experience.\n\nThe practice doesn\'t require any special equipment or beliefs. It\'s simply about paying attention in a particular way - with intention and without judgment.' },
      { page: 2, text: 'In our fast-paced world, mindfulness offers a refuge from stress and anxiety. It teaches us to respond rather than react to life\'s challenges. When we\'re mindful, we create a space between stimulus and response, allowing us to choose our actions more wisely.\n\nMany people think mindfulness means emptying the mind or stopping thoughts altogether. This is a common misconception. The mind\'s job is to think, and trying to stop thoughts is like trying to stop the ocean from having waves. Instead, mindfulness teaches us to observe our thoughts without getting swept away by them.\n\nImagine your thoughts as clouds passing through the sky of your awareness. Some clouds are light and fluffy (pleasant thoughts), others are dark and stormy (difficult thoughts). In mindfulness, you\'re the sky - vast, open, and unchanging - while the clouds are temporary visitors.\n\nThis perspective can be incredibly liberating. You begin to realize that you are not your thoughts, and that difficult emotions and sensations are temporary experiences rather than permanent fixtures of your identity.' },
      { page: 3, text: 'Chapter 2: Basic Breathing Techniques\n\nBreathing is the foundation of mindfulness practice. It\'s always available to us, and it connects the mind and body in a direct way. When we focus on our breath, we anchor ourselves in the present moment.\n\nThe breath is unique because it operates both automatically and under conscious control. This dual nature makes it an ideal bridge between the unconscious and conscious aspects of our experience.\n\nHere\'s a simple breathing exercise to get started:\n\n1. Find a comfortable sitting position with your back straight but not rigid\n2. Close your eyes or soften your gaze downward\n3. Bring your attention to your natural breath without trying to change it\n4. Notice the sensation of air entering and leaving your nostrils\n5. When your mind wanders (and it will), gently return your attention to the breath\n\nStart with just 5 minutes of this practice. As you become more comfortable, you can gradually increase the duration.' },
      { page: 4, text: 'Here\'s a more structured breathing technique called the 4-7-8 breath:\n\n1. Exhale completely through your mouth\n2. Close your mouth and inhale through your nose for 4 counts\n3. Hold your breath for 7 counts\n4. Exhale through your mouth for 8 counts\n5. Repeat this cycle 3-4 times\n\nThis technique is particularly helpful for reducing anxiety and promoting relaxation. The extended exhale activates the parasympathetic nervous system, which is responsible for the body\'s rest and digest response.\n\nAnother powerful technique is belly breathing or diaphragmatic breathing. Place one hand on your chest and another on your belly. As you breathe, try to keep the hand on your chest relatively still while the hand on your belly rises and falls. This type of breathing is more efficient and calming than shallow chest breathing.\n\nRemember, the goal isn\'t to breathe perfectly, but to use the breath as an anchor for your attention. Each time you notice your mind has wandered and you bring it back to the breath, you\'re strengthening your mindfulness muscle.' },
      { page: 5, text: 'Chapter 3: Daily Mindfulness Practices\n\nIncorporating mindfulness into your daily routine doesn\'t require hours of meditation. Small moments of awareness throughout the day can make a significant difference in your overall well-being and quality of life.\n\nMindful eating is one of the most accessible practices. The next time you eat, try to engage all your senses. Notice the colors, textures, and aromas of your food. Chew slowly and pay attention to the flavors. This not only enhances your enjoyment of the meal but can also improve digestion and help you recognize when you\'re full.\n\nWalking meditation is another excellent way to practice mindfulness. As you walk, focus on the sensation of your feet touching the ground. Notice the rhythm of your steps and the movement of your body through space. You can do this whether you\'re walking in nature or simply moving from one room to another.\n\nMindful listening can transform your relationships. When someone is speaking to you, try to give them your full attention. Notice any urge to interrupt or formulate your response while they\'re still talking. Simply listen with an open heart and mind.\n\nEven routine activities like washing dishes or brushing your teeth can become opportunities for mindfulness. Focus on the sensations, sounds, and movements involved in these activities rather than letting your mind wander to your to-do list.' }
    ]
  },
  {
    id: 'free-6',
    title: 'Climate Change Solutions',
    author: 'Prof. James Green',
    category: 'Science',
    description: 'An accessible guide to understanding climate change and the innovative solutions being developed to address this global challenge.',
    isfeatured: true,
    is_free_to_read: true,
    content: [
      { page: 1, text: 'Chapter 1: Understanding Climate Change\n\nClimate change refers to long-term shifts in global temperatures and weather patterns. While climate variations are natural, human activities have accelerated these changes dramatically since the Industrial Revolution began in the late 18th century.\n\nThe Earth\'s climate system is incredibly complex, involving interactions between the atmosphere, oceans, land surfaces, ice sheets, and living organisms. Small changes in one component can have cascading effects throughout the entire system.\n\nThe greenhouse effect is central to understanding climate change. Certain gases in our atmosphere trap heat from the sun, keeping our planet warm enough to support life. Without this natural greenhouse effect, Earth would be about 33°C colder and largely uninhabitable.\n\nHowever, human activities have significantly increased the concentration of greenhouse gases, intensifying this warming effect. Carbon dioxide levels have increased by over 40% since pre-industrial times, primarily due to burning fossil fuels, deforestation, and industrial processes.\n\nThe consequences of this enhanced greenhouse effect are already visible around the world: rising global temperatures, melting ice caps, rising sea levels, changing precipitation patterns, and more frequent extreme weather events.' },
      { page: 2, text: 'The primary cause of recent climate change is the increase in greenhouse gases in our atmosphere, particularly carbon dioxide from burning fossil fuels. Every year, human activities release over 40 billion tons of CO2 into the atmosphere.\n\nFossil fuels - coal, oil, and natural gas - are formed from ancient organic matter that stored carbon underground for millions of years. When we burn these fuels for energy, we rapidly release this stored carbon as CO2, disrupting the natural carbon cycle.\n\nDeforestation is another significant contributor. Forests act as carbon sinks, absorbing CO2 from the atmosphere during photosynthesis. When forests are cleared for agriculture or development, not only do we lose these carbon sinks, but the stored carbon in trees is also released back to the atmosphere.\n\nIndustrial processes, agriculture, and transportation all contribute to greenhouse gas emissions. Methane from livestock and rice cultivation, nitrous oxide from fertilizers, and fluorinated gases from refrigeration all add to the problem.\n\nThe warming we\'ve observed is unequivocal. The last decade included nine of the ten warmest years on record. Arctic sea ice is declining at a rate of about 13% per decade, and global sea levels have risen about 20 centimeters since 1900.' },
      { page: 3, text: 'Chapter 2: Renewable Energy Solutions\n\nRenewable energy sources like solar, wind, and hydroelectric power offer clean alternatives to fossil fuels. These technologies have advanced rapidly in recent years, becoming increasingly efficient and cost-effective.\n\nSolar photovoltaic (PV) technology converts sunlight directly into electricity using semiconductor materials. The cost of solar panels has dropped by over 90% in the past decade, making solar power competitive with fossil fuels in many regions. Large-scale solar farms can now generate electricity at costs below 3 cents per kilowatt-hour.\n\nWind energy harnesses the kinetic energy of moving air to generate electricity. Modern wind turbines are marvels of engineering, with rotors spanning over 150 meters and towers reaching heights of 100 meters or more. Offshore wind farms can access stronger, more consistent winds, further increasing efficiency.\n\nHydroelectric power has been used for over a century and remains the world\'s largest source of renewable electricity. Modern hydroelectric facilities range from massive dams to small run-of-river systems that have minimal environmental impact.\n\nGeothermal energy taps into the Earth\'s internal heat, providing both electricity generation and direct heating applications. Enhanced geothermal systems are expanding the potential for this technology to new regions.' },
      { page: 4, text: 'Solar energy has become increasingly affordable and efficient, making it the fastest-growing source of new electricity generation worldwide. In many regions, solar is now the cheapest source of electricity ever recorded.\n\nThe efficiency of solar panels continues to improve. While early commercial panels converted only about 6% of sunlight into electricity, modern panels routinely achieve efficiencies of 20-22%, with laboratory demonstrations exceeding 40% efficiency.\n\nEnergy storage is crucial for renewable energy systems because the sun doesn\'t always shine and the wind doesn\'t always blow. Battery technology, particularly lithium-ion batteries, has improved dramatically. Costs have fallen by nearly 90% over the past decade, making large-scale energy storage economically viable.\n\nSmart grids use digital technology to manage electricity distribution more efficiently. They can automatically balance supply and demand, integrate renewable energy sources, and even allow consumers to sell excess solar power back to the grid.\n\nElectric vehicles represent another crucial piece of the clean energy puzzle. As the transportation sector electrifies, the demand for clean electricity will grow, further driving renewable energy deployment. Vehicle batteries can also serve as distributed storage for the grid.' },
      { page: 5, text: 'Chapter 3: Individual Actions That Matter\n\nWhile systemic change is crucial for addressing climate change, individual actions also play an important role. Every person can contribute to climate solutions through their daily choices and by advocating for broader changes.\n\nEnergy use in homes and buildings accounts for a significant portion of greenhouse gas emissions. Simple actions like switching to LED light bulbs, improving insulation, and using programmable thermostats can reduce energy consumption by 20-30%. These measures often pay for themselves through energy savings.\n\nTransportation choices have a major impact on your carbon footprint. Walking, cycling, or using public transportation for short trips can significantly reduce emissions. When driving is necessary, fuel-efficient or electric vehicles make a substantial difference.\n\nDiet choices matter too. Animal agriculture, particularly beef production, generates significant greenhouse gas emissions. Reducing meat consumption, especially beef, can have a meaningful impact. You don\'t need to become vegetarian overnight - even one meat-free day per week makes a difference.\n\nConsumption patterns affect climate in multiple ways. Buying less stuff, choosing durable goods, and supporting companies with strong environmental commitments all help. The circular economy model - where products are designed for reuse and recycling - offers a path toward sustainable consumption.\n\nPerhaps most importantly, use your voice. Talk to friends and family about climate change, vote for leaders who prioritize climate action, and support organizations working on solutions. Individual actions multiply when they inspire others and drive systemic change.' }
    ]
  }
];

const convertToLocalBook = (book: any): Book => ({
  id: book.id,
  title: book.title,
  author: book.author,
  category: book.category,
  description: book.description,
  isfeatured: book.isfeatured,
  is_free_to_read: book.is_free_to_read,
  content: book.content?.map((page: any) => ({
    page: page.page || page.pageNumber || 1,
    text: page.text || page.content || ''
  }))
});

const allFreeBooks = [
  ...booksData.filter(book => book.is_free_to_read).map(convertToLocalBook), 
  ...additionalFreeBooks
];

export const FreeBooks = () => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const openBookReader = (book: Book, fullscreen = false) => {
    setSelectedBook(book);
    setIsReaderOpen(true);
    setIsFullscreen(fullscreen);
  };

  const closeBookReader = () => {
    setIsReaderOpen(false);
    setSelectedBook(null);
    setIsFullscreen(false);
  };

  const freeCategories = ['All', ...Array.from(new Set(allFreeBooks.map(book => book.category)))];
  
  const filteredFreeBooks = categoryFilter === 'All' 
    ? allFreeBooks 
    : allFreeBooks.filter(book => book.category === categoryFilter);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2 flex items-center justify-center">
              <Library className="h-10 w-10 mr-3" />
              Free Books
            </h1>
            <p className="text-xl opacity-90">Read Amazing Books Completely Free</p>
            <p className="mt-2 opacity-75">Discover our collection of free books available for instant reading</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Category Filters */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Browse by Category</h2>
          <div className="flex gap-2">
            {freeCategories.map((category) => (
              <Button
                key={category}
                variant={categoryFilter === category ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Free Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFreeBooks.map((book) => (
            <Card key={book.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{book.title}</CardTitle>
                    <div className="flex items-center text-muted-foreground mb-2">
                      <User className="h-4 w-4 mr-1" />
                      <span className="text-sm">{book.author}</span>
                    </div>
                    <Badge variant="secondary" className="mb-2">
                      {book.category}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <BookOpen className="h-3 w-3 mr-1" />
                    Free
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  {book.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {book.content?.length || 0} pages
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      onClick={() => openBookReader(book, false)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Read
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => openBookReader(book, true)}
                    >
                      <Maximize className="h-4 w-4 mr-2" />
                      Fullscreen
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredFreeBooks.length === 0 && (
          <div className="text-center py-12">
            <Library className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No books found</h3>
            <p className="text-muted-foreground">
              Try adjusting your category filter to find more books.
            </p>
          </div>
        )}
      </div>

      {/* Book Reader Modal */}
      {selectedBook && (
        <BookReader
          book={selectedBook}
          isOpen={isReaderOpen}
          onClose={closeBookReader}
          fullscreen={isFullscreen}
        />
      )}
    </div>
  );
};
