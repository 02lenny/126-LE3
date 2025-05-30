# Pathfinder Lab - Interactive Pathfinding Visualizer

A comprehensive web-based pathfinding visualizer that demonstrates and compares Dijkstra's algorithm and A* Search algorithm side-by-side. Built with modern JavaScript using object-oriented principles and modular architecture.

## 🌟 Features

### 📊 Algorithm Comparison
- **Side-by-side visualization** of Dijkstra's algorithm and A* Search
- **Real-time statistics** showing nodes explored and path length
- **Performance monitoring** with execution time comparison
- **Animated exploration** with customizable speed settings

### 🛠️ Interactive Tools
- **Start/End Point Placement** - Set custom start and end positions
- **Wall Builder** - Create obstacles by clicking and dragging
- **Weight System** - Add weighted nodes (1, 2, 5, 10) for realistic pathfinding
- **Eraser Tool** - Remove walls and weights
- **Grid Synchronization** - Changes to one grid automatically update the other

### 🎛️ Control Options
- **Animation Speed** - Slow, Medium, Fast settings
- **Dynamic Grid Sizing** - 5x5, 10x10, 15x15, 20x20 grids
- **Random Maze Generator** - Generate complex mazes automatically
- **Random Start/End** - Randomly place start and end points

### 💾 Data Management
- **Save/Load Grid States** - Persist grid configurations using localStorage
- **Grid Export/Import** - Save interesting maze configurations
- **Session Persistence** - Maintains state across browser sessions

### ⌨️ Keyboard Shortcuts
- `Space` - Find Path
- `Escape` - Stop Algorithms
- `Ctrl+S` - Save Grid
- `Ctrl+O` - Load Grid
- `Ctrl+R` - Random Maze
- `Delete` - Clear Grid
- `1-4` - Switch Tools (Start, End, Wall, Eraser)

## 📁 Project Structure

```
pathfinder-lab/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # Complete styling and animations
├── components/
│   ├── Node.js             # Node class for grid cells
│   ├── Grid.js             # Grid management and visualization
│   └── App.js              # Main application orchestrator
├── algorithms/
│   ├── Dijkstra.js         # Dijkstra's algorithm implementation
│   └── AStar.js            # A* Search algorithm implementation
├── utils/
│   └── EventHandlers.js    # Utilities and event management
└── README.md               # Project documentation
```

## 🚀 Getting Started

### Quick Start
1. Clone or download the project files
2. Open `index.html` in a modern web browser
3. Start creating mazes and finding paths!

### No Build Process Required
This project uses vanilla JavaScript with ES6 modules, so no compilation or build tools are needed. Simply serve the files from a web server or open directly in a browser that supports ES6 modules.

## 🎯 Usage Instructions

### Basic Operation
1. **Set Start/End Points**: Click the "Set Start" or "Set End" buttons, then click on the grid
2. **Create Obstacles**: Select "Wall" tool and click/drag on the grid to create walls
3. **Add Weights**: Select a weight value (1-10) and click on empty cells
4. **Find Paths**: Click "Find Path" to run both algorithms simultaneously
5. **Compare Results**: Observe the different exploration patterns and statistics

### Advanced Features
- **Save Interesting Mazes**: Use Save Grid to store complex configurations
- **Performance Analysis**: Check the browser console for detailed performance comparisons
- **Experiment with Weights**: Create scenarios where weighted paths affect algorithm behavior
- **Grid Sizing**: Try different grid sizes to see how algorithms scale

## 🧠 Learning Objectives

### Algorithm Understanding
- **Dijkstra's Algorithm**: Uniform cost search that guarantees shortest path
- **A* Search**: Heuristic-guided search that's often more efficient
- **Algorithm Comparison**: Direct visualization of efficiency differences
- **Performance Analysis**: Real-world execution time and space complexity

### Programming Concepts
- **Object-Oriented Design**: Clean separation of concerns with classes
- **Modular Architecture**: Reusable components and loose coupling
- **Asynchronous Programming**: Promise-based algorithm execution
- **Event-Driven Programming**: Interactive UI with proper event handling
- **Data Structures**: Grid representation and pathfinding data structures

### Web Development Skills
- **ES6 Modules**: Modern JavaScript module system
- **CSS Grid/Flexbox**: Responsive layout techniques
- **Local Storage**: Client-side data persistence
- **Performance Optimization**: Efficient DOM manipulation and memory management
- **Accessibility**: Keyboard navigation and user-friendly interface

## 🔧 Technical Implementation

### Node Class (`components/Node.js`)
- Represents individual grid cells
- Manages state (start, end, wall, weight, explored, path)
- Handles visual updates and DOM interaction
- Supports serialization for save/load functionality

### Grid Class (`components/Grid.js`)
- Manages 2D array of nodes
- Handles user interactions and tool application
- Provides neighbor finding and grid operations
- Supports dynamic resizing and maze generation

### Algorithm Classes (`algorithms/`)
- **Dijkstra**: Classic shortest-path algorithm with uniform cost
- **A* Search**: Heuristic-based pathfinding with Manhattan distance
- Both support animated visualization and performance tracking
- Modular design allows easy addition of new algorithms

### Utility Classes (`utils/EventHandlers.js`)
- **StorageManager**: Local storage operations with error handling
- **PerformanceMonitor**: Execution time tracking and analysis
- **KeyboardManager**: Comprehensive keyboard shortcut system
- **Animation Controller**: Smooth animation management

## 🎨 UI Design Features

### Modern Interface
- **Gradient backgrounds** and glass-morphism effects
- **Smooth animations** for node exploration and path drawing
- **Responsive design** that works on different screen sizes
- **Color-coded visualization** with intuitive legend

### Interactive Elements
- **Hover effects** and visual feedback
- **Tool selection** with clear active states
- **Real-time statistics** updates
- **Toast notifications** for user feedback

### Accessibility
- **Keyboard navigation** support
- **Clear visual hierarchy** and contrast
- **Semantic HTML** structure
- **Screen reader friendly** elements

## 📚 Educational Value

### Algorithm Concepts
- **Graph Theory**: Understanding nodes, edges, and traversal
- **Search Strategies**: Breadth-first vs. best-first search
- **Heuristics**: How A* uses estimates to improve efficiency
- **Optimality**: Understanding when algorithms guarantee shortest paths

### Performance Analysis
- **Time Complexity**: Practical demonstration of algorithmic efficiency
- **Space Complexity**: Memory usage visualization
- **Best/Worst Case**: Creating scenarios that favor different algorithms
- **Real-World Applications**: GPS navigation, game AI, network routing

### Programming Best Practices
- **Clean Code**: Well-documented, readable implementation
- **SOLID Principles**: Single responsibility and open/closed principles
- **Error Handling**: Graceful error management and user feedback
- **Testing Mindset**: Code structure that facilitates testing

## 🌐 Browser Compatibility

- **Chrome 61+** (Full ES6 module support)
- **Firefox 60+** (Full ES6 module support)
- **Safari 10.1+** (Full ES6 module support)
- **Edge 16+** (Full ES6 module support)

## 🤝 Contributing

This project is designed for educational purposes. To extend or modify:

1. **Add New Algorithms**: Create new classes in `algorithms/` folder
2. **Enhance Visualization**: Modify CSS animations and transitions
3. **Add Features**: Extend the UI with new tools or controls
4. **Improve Performance**: Optimize algorithms or data structures

## 📝 License

This project is designed for educational use in Web Engineering courses. Feel free to use, modify, and distribute for learning purposes.

## 🎓 Assignment Context

This project serves as a comprehensive Web Engineering lab activity covering:
- Modern JavaScript development
- Object-oriented programming principles
- Algorithm implementation and analysis
- Interactive web application development
- Performance optimization techniques
- User experience design

Perfect for demonstrating understanding of pathfinding algorithms, JavaScript async behavior, and creating engaging, educational web applications. 