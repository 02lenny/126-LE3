# ZenPaths - Interactive Pathfinding Visualizer

A modern, lofi garden-themed web app for visualizing and comparing Dijkstra's and A* pathfinding algorithms. Features a grid-based UI, real-time stats, responsive design, and a cozy, accessible interface.

Access the deployed version here: https://zenpath-azure.vercel.app/

## 🌟 Features

- **Side-by-side visualization** of Dijkstra and A* algorithms
- **Animated exploration** with speed controls
- **Interactive grid editing**: start/end, walls, weights, eraser
- **Random maze, weights, and environment generators**
- **Save/load grid states** (localStorage)
- **Responsive, mobile-friendly UI**
- **Garden-themed icons and pastel colors**
- **Legend and stats always visible**
- **Toast notifications with close button**

## 📁 Project Structure

```
ZenPaths/
├── index.html
├── styles/
│   └── styles.css
├── assets/
│   └── (images/icons)
├── components/
│   ├── App.js
│   ├── Grid.js
│   └── Node.js
├── algorithms/
│   ├── Dijkstra.js
│   └── AStar.js
├── utils/
│   └── EventHandlers.js
└── README.md
```

## 🎯 Usage

- Use the sidebar to select tools, randomize, or change grid size/speed.
- Click/drag on the grid to edit.
- Use the legend above the grids for reference.
- Save/load your favorite grid setups.
- Works great on desktop and mobile!

## 📝 License

For educational and personal use. Enjoy your zen pathfinding journey!