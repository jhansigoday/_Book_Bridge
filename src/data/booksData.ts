
export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  description: string;
  coverurl: string;
  content: BookPage[];
  status: 'available' | 'requested' | 'donated';
  isfeatured: boolean;
  is_free_to_read: boolean;
  donorid?: string;
}

export interface BookPage {
  pageNumber: number;
  title: string;
  content: string;
}

export const booksData: Book[] = [
  {
    id: '1',
    title: 'Introduction to Data Structures',
    author: 'Dr. Sarah Johnson',
    category: 'Academic',
    description: 'A comprehensive guide to understanding fundamental data structures and algorithms used in computer science.',
    coverurl: '/placeholder.svg',
    status: 'available',
    isfeatured: true,
    is_free_to_read: true,
    content: [
      {
        pageNumber: 1,
        title: 'Chapter 1: Arrays and Lists',
        content: `
          Arrays are one of the most fundamental data structures in computer science. They provide a way to store multiple elements of the same type in a contiguous block of memory.

          **What is an Array?**
          An array is a collection of elements, each identified by an index or key. The elements are stored in consecutive memory locations, which allows for efficient access using the index.

          **Key Characteristics:**
          1. Fixed size (in most languages)
          2. Elements of the same data type
          3. Indexed access (typically starting from 0)
          4. Constant time access O(1)

          **Example in Python:**
          \`\`\`python
          # Creating an array
          numbers = [1, 2, 3, 4, 5]
          
          # Accessing elements
          first_element = numbers[0]  # Returns 1
          last_element = numbers[-1]  # Returns 5
          \`\`\`

          Arrays form the foundation for more complex data structures and are essential for understanding algorithm efficiency.
        `
      },
      {
        pageNumber: 2,
        title: 'Chapter 2: Linked Lists',
        content: `
          Linked Lists are dynamic data structures where elements (nodes) are stored in sequence, but not necessarily in contiguous memory locations.

          **Structure of a Node:**
          Each node contains:
          1. Data field - stores the actual value
          2. Pointer/Reference - points to the next node

          **Types of Linked Lists:**
          1. **Singly Linked List** - Each node points to the next
          2. **Doubly Linked List** - Each node has pointers to both next and previous
          3. **Circular Linked List** - Last node points back to the first

          **Advantages:**
          - Dynamic size
          - Efficient insertion/deletion at beginning
          - Memory efficient (allocates as needed)

          **Disadvantages:**
          - No random access
          - Extra memory for pointers
          - Not cache friendly

          **Implementation Example:**
          \`\`\`python
          class Node:
              def __init__(self, data):
                  self.data = data
                  self.next = None

          class LinkedList:
              def __init__(self):
                  self.head = None
          \`\`\`
        `
      },
      {
        pageNumber: 3,
        title: 'Chapter 3: Stacks and Queues',
        content: `
          Stacks and Queues are abstract data types that organize data in specific ways based on the order of operations.

          **Stack (LIFO - Last In, First Out):**
          Think of a stack of plates - you add and remove plates from the top.

          **Key Operations:**
          - Push: Add element to top
          - Pop: Remove element from top
          - Peek/Top: View top element without removing
          - isEmpty: Check if stack is empty

          **Applications:**
          - Function call management
          - Undo operations in software
          - Expression evaluation
          - Browser history

          **Queue (FIFO - First In, First Out):**
          Think of a line at a store - first person in line is first to be served.

          **Key Operations:**
          - Enqueue: Add element to rear
          - Dequeue: Remove element from front
          - Front: View front element
          - Rear: View rear element

          **Applications:**
          - Process scheduling in operating systems
          - Breadth-first search algorithms
          - Handling requests in web servers
          - Print job management
        `
      }
    ]
  },
  {
    id: '2',
    title: 'The Art of Creative Writing',
    author: 'Emily Rodriguez',
    category: 'Academic',
    description: 'Learn the fundamentals of creative writing, from character development to plot structure.',
    coverurl: '/placeholder.svg',
    status: 'available',
    isfeatured: false,
    is_free_to_read: true,
    content: [
      {
        pageNumber: 1,
        title: 'Chapter 1: Finding Your Voice',
        content: `
          Every writer has a unique voice - that distinctive style and perspective that makes their work recognizable. Finding your voice is one of the most important aspects of becoming a successful writer.

          **What is Writing Voice?**
          Your writing voice encompasses:
          - Tone and mood
          - Word choice and sentence structure
          - Perspective and point of view
          - Rhythm and pacing

          **Developing Your Voice:**
          1. **Read Extensively** - Expose yourself to different writing styles
          2. **Write Regularly** - Practice makes perfect
          3. **Experiment** - Try different genres and styles
          4. **Be Authentic** - Write what feels natural to you

          **Exercise:**
          Write the same scene from three different perspectives:
          - A child's point of view
          - An elderly person's perspective
          - A neutral observer

          Notice how the voice changes with each perspective. This exercise helps you understand how voice affects storytelling and reader connection.

          Remember: Your voice will evolve over time. Don't worry about finding it immediately - focus on writing consistently and authentically.
        `
      },
      {
        pageNumber: 2,
        title: 'Chapter 2: Character Development',
        content: `
          Characters are the heart of any story. Well-developed characters drive plot, create conflict, and help readers connect emotionally with your narrative.

          **Creating Believable Characters:**

          **1. Physical Description**
          - Height, weight, hair color, distinguishing features
          - Clothing style and preferences
          - Body language and mannerisms

          **2. Personality Traits**
          - Strengths and weaknesses
          - Fears and desires
          - Habits and quirks
          - Moral compass and values

          **3. Background and History**
          - Family relationships
          - Education and career
          - Significant life events
          - Cultural background

          **Character Arc Development:**
          A character arc shows how your character changes throughout the story:
          - **Starting Point** - Who is the character at the beginning?
          - **Catalyst** - What event triggers change?
          - **Struggle** - What obstacles do they face?
          - **Transformation** - How do they grow or change?

          **Writing Exercise:**
          Create a character profile for your protagonist including:
          - Basic demographics
          - Personality traits
          - One significant childhood memory
          - Their greatest fear and biggest dream
        `
      },
      {
        pageNumber: 3,
        title: 'Chapter 3: Plot Structure and Pacing',
        content: `
          A well-structured plot keeps readers engaged from beginning to end. Understanding plot structure helps you organize your story effectively.

          **The Three-Act Structure:**

          **Act I - Setup (25%)**
          - Introduce main character and setting
          - Establish the normal world
          - Present the inciting incident
          - First plot point that launches the story

          **Act II - Confrontation (50%)**
          - Character faces obstacles and conflicts
          - Rising action builds tension
          - Midpoint crisis or revelation
          - Character's lowest point (dark night of the soul)

          **Act III - Resolution (25%)**
          - Climax - the story's turning point
          - Falling action
          - Resolution of conflicts
          - New normal/denouement

          **Pacing Techniques:**
          1. **Vary sentence length** - Short sentences for tension, longer for reflection
          2. **Scene breaks** - Use white space to control rhythm
          3. **Dialogue** - Speeds up pacing
          4. **Description** - Slows down pacing
          5. **Cliffhangers** - Keep readers turning pages

          **Common Pacing Mistakes:**
          - Starting too slowly
          - Rushing through important moments
          - Info-dumping background information
          - Inconsistent tension levels

          Remember: Pacing should serve your story's emotional needs.
        `
      }
    ]
  },
  {
    id: '3',
    title: 'The Midnight Garden',
    author: 'Isabella Chen',
    category: 'Stories',
    description: 'A magical tale about a young girl who discovers a secret garden that only appears at midnight.',
    coverurl: '/placeholder.svg',
    status: 'available',
    isfeatured: true,
    is_free_to_read: true,
    content: [
      {
        pageNumber: 1,
        title: 'Chapter 1: The Discovery',
        content: `
          Luna had always been a light sleeper, but the sound that woke her that night was different from the usual creaking of the old house. It was a soft, melodic humming that seemed to drift through her bedroom window like a lullaby carried on the wind.

          She sat up in bed, her dark hair falling around her shoulders as she listened. The grandfather clock in the hallway had just chimed midnight, its deep tones fading into the silence. The humming continued, sweet and mysterious, calling to her.

          Unable to resist, Luna slipped out of bed and padded to the window. What she saw made her gasp in wonder. The backyard, which during the day was nothing more than overgrown grass and weeds, had transformed into something magical.

          A garden bloomed before her eyes - not the ordinary garden her grandmother used to tend, but something from a fairy tale. Luminescent flowers swayed in a breeze she couldn't feel, their petals glowing with an inner light that ranged from soft blues to vibrant purples. Vines twisted around invisible trellises, heavy with fruit that sparkled like jewels.

          At the center of it all stood a fountain that definitely hadn't been there before. Water danced in impossible spirals, defying gravity as it caught and reflected the moonlight. The humming grew stronger, and Luna realized it was coming from the garden itself - a harmony created by the gentle rustling of leaves and the tinkling of the impossible fountain.

          Without thinking, she found herself reaching for her robe and slippers. Something told her this was her invitation, her moment. The midnight garden was calling her name.
        `
      },
      {
        pageNumber: 2,
        title: 'Chapter 2: The First Visit',
        content: `
          The back door opened silently under Luna's touch, as if the house itself was conspiring to help her reach the garden. The night air was warm and sweet, filled with fragrances she couldn't identify - honey and jasmine, vanilla and something wild and green.

          As she stepped onto the grass, Luna felt a tingling sensation in her bare feet. The ground seemed to pulse with life, and tiny flowers bloomed where she walked, leaving a trail of light behind her. She had expected to feel afraid, but instead, she felt a deep sense of belonging.

          The garden was even more magnificent up close. Each flower seemed to have its own personality - some swayed shyly when she approached, others leaned forward as if eager for her attention. The fruit on the vines looked delicious, and when she hesitantly reached for what looked like a glowing pear, it practically fell into her hand.

          The first bite was a revelation. It tasted like sunshine and laughter, like the feeling of flying in dreams. As the juice ran down her chin, Luna felt something changing inside her. Colors seemed brighter, sounds clearer, and she could almost understand what the humming garden was trying to tell her.

          Near the fountain, she noticed a stone bench that seemed to be waiting for her. As she sat down, the water's dance became even more elaborate, creating shapes and patterns that told wordless stories. Luna watched, enchanted, as scenes played out in the dancing water - tales of other children who had found this place, other midnight visitors who had been chosen by the garden.

          She wasn't the first, and she sensed she wouldn't be the last. But for now, this magical sanctuary was hers to explore and protect.
        `
      },
      {
        pageNumber: 3,
        title: 'Chapter 3: The Garden\'s Secret',
        content: `
          Over the following weeks, Luna found herself living for midnight. Each night, she would slip from her bed and make her way to the garden, which appeared only when the clock struck twelve and vanished with the first light of dawn.

          The garden seemed to sense her growing connection to it. New paths appeared each night, leading to different sections she hadn't noticed before. There was a grove where the trees whispered secrets in languages she didn't recognize but somehow understood. A meadow where flowers sang in harmony when the wind touched them just right. A small pond where fish made of starlight swam in lazy circles.

          On her seventh visit, Luna met the garden's guardian. She was sitting by the fountain, sketching the impossible water dance in a notebook she'd started bringing, when a voice spoke behind her.

          "You have artist's eyes, child."

          Luna turned to see an elderly woman in a flowing dress that seemed to be made of moonbeams and flower petals. Her hair was silver-white and crowned with a wreath of the glowing blooms, and her eyes held the depth of someone who had seen centuries pass.

          "Don't be afraid," the woman said, settling beside Luna on the bench. "I am Selene, keeper of this sanctuary. Every generation, the garden chooses a child with a pure heart and an imagination bright enough to see beyond the ordinary world. You, Luna, are this generation's chosen one."

          "What does that mean?" Luna whispered, her voice barely audible over the fountain's song.

          Selene smiled, and when she did, every flower in the garden seemed to glow a little brighter. "It means you have been given a gift, and with it, a responsibility. This garden exists to nurture magic in a world that often forgets to believe in wonder. Your job is to learn its secrets and, when the time comes, to pass them on."

          Luna felt the weight and wonder of this revelation settle over her like a cloak made of starlight. She was no longer just a visitor to this magical place - she was its student, its protector, its future guardian.
        `
      }
    ]
  },
  {
    id: '4',
    title: 'The Lost Constellation',
    author: 'Marcus Thompson',
    category: 'Stories',
    description: 'An adventure story about a young astronomer who discovers that constellations can fall from the sky.',
    coverurl: '/placeholder.svg',
    status: 'available',
    isfeatured: false,
    is_free_to_read: true,
    content: [
      {
        pageNumber: 1,
        title: 'Chapter 1: The Falling Star',
        content: `
          Kai had been tracking unusual stellar activity for three weeks from his makeshift observatory in the attic. His telescope, a gift from his grandfather, was pointed toward the constellation Andromeda when he first noticed something was wrong.

          Stars weren't supposed to move. Not like this.

          As he watched through the eyepiece, one star - then another - began to drift away from its position. Not the gradual movement of planets or the predictable path of satellites, but something deliberate and urgent, as if the stars themselves were abandoning their ancient posts.

          The night sky, which had been Kai's constant companion since childhood, was changing before his eyes. Constellations he had memorized were becoming incomplete, their patterns disrupted by the exodus of individual stars.

          Then he saw it fall.

          A brilliant point of light detached itself from Cassiopeia and streaked across the sky, but this wasn't a meteor. Meteors burned up in the atmosphere, leaving brief trails of fire. This light maintained its brilliance all the way to the horizon, disappearing behind the hills to the east of town.

          Kai's hands shook as he lowered the telescope. In all his reading about astronomy, he had never encountered anything like this. Stars were supposed to be constant, reliable, eternal. They weren't supposed to fall to Earth like cosmic fruit from a celestial tree.

          His grandfather's journal lay open beside him, filled with decades of careful observations and sketches. Kai flipped through the pages, searching for any mention of moving stars or falling constellations. Near the back, he found a page that made his heart race.

          In his grandfather's careful handwriting was a single line: "The stars are guardians, not prisoners. When the balance is threatened, they will come home."

          Below it was a rough map of the surrounding hills, with an X marking a location that Kai recognized. It was exactly where the fallen star had disappeared.
        `
      },
      {
        pageNumber: 2,
        title: 'Chapter 2: The Quest Begins',
        content: `
          The next morning, Kai could barely concentrate on anything. His mother's concerns about his late nights and tired eyes fell on deaf ears. His teachers' lessons seemed trivial compared to the cosmic mystery unfolding above their heads.

          After school, instead of heading home, Kai rode his bike toward the eastern hills. The map from his grandfather's journal was folded in his pocket, along with a compass and flashlight. He had no idea what he would find, but he knew he had to look.

          The path into the hills was overgrown and difficult to follow. Kai had to push his bike for the last mile, following deer trails and his grandfather's cryptic landmarks. As evening approached, he found himself in a small clearing that matched the description in the journal.

          At first, everything seemed normal. Birds chirped in the trees, and a small stream bubbled nearby. But as the light faded and his eyes adjusted to the growing darkness, Kai began to notice something extraordinary.

          The ground itself was glowing.

          Not everywhere, but in specific patches that seemed to pulse with gentle, starlike light. As he moved closer, he could see that these weren't just random glowing spots. They formed patterns - the same patterns he had memorized from his star charts.

          Here was the outline of Orion, his belt clearly visible in three brighter patches of luminescence. There was the Big Dipper, and beyond it, the elegant curve of Draco the Dragon. It was as if pieces of the night sky had indeed fallen to Earth and were trying to maintain their celestial arrangements even while grounded.

          In the center of the clearing, where the brightest concentration of light pulsed, Kai found what had fallen the night before. It wasn't a meteorite or space debris, but something far more wonderful and impossible.

          It was a star - an actual star, no bigger than a marble, hovering three feet above the ground and emanating warmth and light like a miniature sun.
        `
      },
      {
        pageNumber: 3,
        title: 'Chapter 3: The Guardian\'s Message',
        content: `
          As Kai approached the floating star, it pulsed brighter, as if recognizing his presence. When he extended his hand toward it, the star gently descended to rest in his palm. It was warm but not burning, and it hummed with a frequency he could feel in his bones.

          Suddenly, the clearing filled with a soft voice that seemed to come from the star itself, speaking words that appeared in his mind rather than his ears.

          "Young watcher of the skies, we have been waiting for you."

          Kai's eyes widened as more stars began to rise from the glowing patches around the clearing. They formed a loose circle around him, each one humming in harmony with the others, creating a celestial choir unlike anything he had ever imagined.

          "We are the Stellae Custodes - the Star Guardians," the voice continued. "For millennia, we have watched over your world from above, maintaining the balance between light and darkness, hope and despair. But that balance is now threatened."

          The star in Kai's hand pulsed, and suddenly he could see visions in its light - images of pollution dimming the night sky, of cities growing so bright that children could no longer see the stars, of people who had forgotten to look up and wonder.

          "The connection between Earth and sky grows weak," the star explained. "Humans have lost their sense of wonder, their belief in magic and mystery. Without that connection, we cannot maintain our positions. We fall to Earth, seeking those who still remember to dream."

          Kai understood. His grandfather had been one of those dreamers, and now the responsibility was passing to him.

          "What can I do?" he asked aloud, his voice echoing strangely in the star-filled clearing.

          "Help us restore the wonder," came the reply. "Show others what you have seen. Teach them to look up again, to find magic in the night sky. Only when humans remember their connection to the cosmos can we return to our celestial home."

          The star in his hand grew brighter, and Kai felt a surge of purpose unlike anything he had ever experienced. He was no longer just a boy with a telescope - he was a guardian of wonder, a keeper of cosmic secrets, a bridge between Earth and sky.
        `
      }
    ]
  },
  {
    id: '5',
    title: 'Fundamentals of Psychology',
    author: 'Dr. Rebecca Martinez',
    category: 'Academic',
    description: 'An introduction to psychological principles, cognitive processes, and human behavior.',
    coverurl: '/placeholder.svg',
    status: 'available',
    isfeatured: false,
    is_free_to_read: true,
    content: [
      {
        pageNumber: 1,
        title: 'Chapter 1: Introduction to Psychology',
        content: `
          Psychology is the scientific study of mind and behavior. This broad definition encompasses everything from basic brain functions to complex social interactions, making psychology one of the most diverse and fascinating fields of study.

          **What is Psychology?**
          Psychology seeks to understand:
          - How we think, feel, and behave
          - Why people act the way they do
          - How mental processes work
          - How to improve human well-being

          **Brief History:**
          Psychology as a formal discipline began in 1879 when Wilhelm Wundt established the first psychology laboratory in Leipzig, Germany. Since then, the field has evolved through several major movements:

          **1. Structuralism (1879-1920s)**
          - Founded by Edward Titchener
          - Focused on breaking down mental processes into basic elements
          - Used introspection as primary method

          **2. Functionalism (1890s-1920s)**
          - Led by William James
          - Emphasized the purpose of mental processes
          - Interested in how psychology could be applied to real problems

          **3. Behaviorism (1920s-1960s)**
          - Pioneered by John Watson and B.F. Skinner
          - Focused on observable behavior
          - Rejected study of mental processes as unscientific

          **4. Cognitive Revolution (1950s-present)**
          - Returned focus to mental processes
          - Emphasized information processing
          - Influenced by computer science and neuroscience

          **Modern Psychology** integrates insights from all these approaches, using scientific methods to understand both behavior and mental processes.
        `
      },
      {
        pageNumber: 2,
        title: 'Chapter 2: Research Methods',
        content: `
          Psychology is a science, which means it relies on systematic observation and experimentation to understand human behavior and mental processes.

          **The Scientific Method in Psychology:**

          **1. Observation**
          - Careful watching and recording of behavior
          - Can be naturalistic (in real-world settings) or controlled (in laboratories)

          **2. Hypothesis Formation**
          - A testable prediction about the relationship between variables
          - Must be specific and measurable

          **3. Experimentation**
          - Controlled testing of hypotheses
          - Involves manipulating independent variables to observe effects on dependent variables

          **4. Data Analysis**
          - Statistical analysis of collected data
          - Determines if results support or refute the hypothesis

          **5. Peer Review and Replication**
          - Other scientists review and attempt to replicate findings
          - Ensures reliability and validity of results

          **Research Methods:**

          **Experimental Research**
          - Manipulates variables to determine cause and effect
          - Uses control groups and experimental groups
          - Allows for strongest conclusions about causation

          **Correlational Research**
          - Examines relationships between variables
          - Cannot determine causation, only association
          - Useful for studying variables that cannot be manipulated ethically

          **Case Studies**
          - In-depth examination of individual cases
          - Provides rich, detailed information
          - Limited generalizability

          **Surveys and Questionnaires**
          - Collect data from large numbers of people
          - Cost-effective and efficient
          - May be affected by response bias

          **Ethical Considerations:**
          All psychological research must follow strict ethical guidelines to protect participants' rights and well-being.
        `
      },
      {
        pageNumber: 3,
        title: 'Chapter 3: Learning and Memory',
        content: `
          Learning and memory are fundamental cognitive processes that allow us to acquire new information, skills, and behaviors, and to retain them over time.

          **Types of Learning:**

          **1. Classical Conditioning**
          - Discovered by Ivan Pavlov
          - Learning through association
          - Unconditioned stimulus naturally produces unconditioned response
          - Conditioned stimulus learns to produce conditioned response

          **Example:** A dog naturally salivates (UR) when it sees food (US). After repeatedly pairing a bell (CS) with food, the dog learns to salivate (CR) when it hears the bell alone.

          **2. Operant Conditioning**
          - Developed by B.F. Skinner
          - Learning through consequences
          - Behavior followed by positive consequences increases
          - Behavior followed by negative consequences decreases

          **Key Concepts:**
          - Reinforcement (positive and negative)
          - Punishment (positive and negative)
          - Schedules of reinforcement
          - Extinction and spontaneous recovery

          **3. Observational Learning**
          - Proposed by Albert Bandura
          - Learning by watching others
          - Involves attention, retention, reproduction, and motivation

          **Memory Processes:**

          **1. Encoding**
          - Converting information into a form that can be stored
          - Can be automatic or effortful
          - Affected by attention, elaboration, and organization

          **2. Storage**
          - Maintaining information over time
          - Sensory memory (brief)
          - Short-term memory (limited capacity)
          - Long-term memory (unlimited capacity)

          **3. Retrieval**
          - Accessing stored information
          - Recognition vs. recall
          - Affected by retrieval cues and context

          Understanding these processes helps explain how we acquire knowledge and skills throughout our lives.
        `
      }
    ]
  },
  {
    id: '6',
    title: 'The Time Traveler\'s Diary',
    author: 'Alexander Wright',
    category: 'Stories',
    description: 'A thrilling adventure about a teenager who finds a diary that allows her to travel through time.',
    coverurl: '/placeholder.svg',
    status: 'available',
    isfeatured: true,
    is_free_to_read: true,
    content: [
      {
        pageNumber: 1,
        title: 'Entry 1: The Discovery',
        content: `
          **March 15th, 2024**
          
          I never believed in magic until I found this diary in my grandmother's attic. It was tucked away in an old trunk, wrapped in silk that shimmered like it was woven from moonlight itself. The leather cover feels ancient under my fingers, and the pages seem to glow faintly when I write in them.

          Grandmother always said our family had secrets, but I thought she meant recipes or old photographs. I never imagined she meant this.

          The diary came with a note in her handwriting: "For Maya, when she's ready to understand that time is not a river flowing in one direction, but an ocean that can be navigated by those brave enough to dive deep."

          I thought it was just poetry until I wrote my first entry yesterday. I was complaining about my history test on World War II, wishing I could have been there to see what really happened instead of just memorizing dates and facts from a textbook.

          When I finished writing, the words began to shimmer and change. The page grew warm under my hand, and suddenly I felt like I was falling through layers of time itself. Colors swirled around me - sepia tones of old photographs, the harsh black and white of newsreels, the muted pastels of faded memories.

          When the sensation stopped, I was still in my room, but everything was different. My smartphone was gone, replaced by an old rotary phone. My LED lights had become gas lamps. My modern furniture was now heavy, dark wood pieces that belonged in a museum.

          And when I looked out my window, instead of the familiar sight of suburban houses and paved streets, I saw horse-drawn carriages and women in long dresses hurrying down cobblestone roads.

          I had traveled back in time. Actually traveled back in time.

          The diary had taken me exactly where I had wished to go - to see history firsthand.
        `
      },
      {
        pageNumber: 2,
        title: 'Entry 2: The Rules',
        content: `
          **September 3rd, 1943 (or March 16th, 2024 - time is confusing now)**

          I've discovered that this diary doesn't just transport me through time - it also somehow ensures I fit into whatever era I visit. When I arrived in 1943, I was wearing a simple dress and coat appropriate for the time period. My hair had changed to a style that wouldn't draw attention, and I even had period-appropriate identification in my pocket.

          It's like the diary creates a temporary identity for me, complete with believable backstory and documentation. I've become quite good at blending in, though the first few trips were terrifying.

          I've started to understand the rules through trial and error:

          **Rule 1:** I can only stay in each time period for 24 hours maximum. After that, the diary automatically pulls me back to my own time.

          **Rule 2:** I cannot change major historical events. When I tried to warn someone about an air raid in London, my voice literally wouldn't work. The diary seems to have built-in protections against paradoxes.

          **Rule 3:** I can only bring back memories and knowledge, not objects. Anything I try to take disappears when I return to 2024.

          **Rule 4:** The diary chooses the exact location and circumstances of my arrival based on my written intentions, but it always prioritizes my safety.

          **Rule 5:** I must write about each journey in detail. The diary feeds on stories, on the recording of experiences. If I don't document my travels, the magic begins to fade.

          Today I witnessed something incredible - a group of resistance fighters helping Allied prisoners escape from a German camp. I couldn't help them directly, but I could observe and remember. Their courage in the face of impossible odds will stay with me forever.

          History books tell us about battles and treaties, but they can't capture the smell of fear and hope mingled in a cold basement, or the way ordinary people become heroes when everything they love is threatened.

          This diary is teaching me that the past isn't just dates and facts - it's millions of individual stories, each one as real and important as my own.
        `
      },
      {
        pageNumber: 3,
        title: 'Entry 3: The Warning',
        content: `
          **December 7th, 1941 / March 20th, 2024**

          Something went wrong during my last trip. I was observing Pearl Harbor - standing on the shore, watching the morning sun paint the harbor in shades of gold and pink, when the attack began. I had read about it, seen footage, but nothing prepared me for the reality.

          The sound alone was overwhelming - the roar of aircraft engines, the thunder of explosions, the crack of anti-aircraft fire. But worse was the human cost I witnessed. Young sailors running for their battle stations, some barely older than me. Families on the shore searching frantically for loved ones.

          I was documenting everything, writing in the diary even as chaos erupted around me, when I noticed something that chilled me to the bone. There was another person there who didn't belong - a man in modern clothes, taking photographs with what was clearly a 21st-century camera.

          When our eyes met, he smiled - a cold, calculating expression that made my skin crawl. He approached me, speaking in a voice that seemed to echo strangely, as if coming from somewhere far away.

          "Another traveler," he said. "But you're just a tourist, aren't you? I'm here for business."

          Before I could respond, my 24-hour limit kicked in and the diary pulled me home. But his words haunted me. Business? What kind of business involves traveling back to witness one of the most tragic days in American history?

          I've been researching since I returned, looking for any evidence of time travel, any mention of people who don't belong in historical records. What I found terrifies me.

          There are others. People using time travel not to learn or understand, but to exploit. To steal knowledge, to manipulate events in subtle ways that won't trigger the diary's protections against major changes.

          I think my grandmother didn't just leave me this diary to satisfy my curiosity about history. I think she left it to me because she knew I would need to protect something - or stop someone.

          The diary is more than a tool for exploration. It's a responsibility. And I'm beginning to understand that some secrets are worth protecting, no matter the cost.
        `
      }
    ]
  }
];
