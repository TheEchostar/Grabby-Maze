document.addEventListener("DOMContentLoaded", function() {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    console.error("Canvas context is null. Make sure the <canvas> element exists.");
    return;
  }

  // Maze dimensions
  const cols = 10;
  const rows = 10;
  const cellSize = 40;

  // Set canvas size
  canvas.width = cols * cellSize;
  canvas.height = rows * cellSize;

  let maze, player, goal;

  // Grab the difficulty selector
  const difficultySelect = document.getElementById("difficulty");

  /**
   * Generate a random maze with walls, ensuring solvability.
   * @param {string} difficulty - 'easy', 'medium', or 'hard'
   * @param {number} attempt - recursion attempt to avoid infinite loops
   * @returns {Array} 2D array representing the maze
   */
  function generateMaze(difficulty, attempt = 1) {
    console.log(`Generating maze (attempt #${attempt}), difficulty: ${difficulty}`);

    // If too many attempts, give up and return an open maze
    if (attempt > 20) {
      console.warn("Max attempts reached, returning an open maze.");
      return Array.from({ length: rows }, () => Array(cols).fill("path"));
    }

    // Create base maze of paths
    let newMaze = Array.from({ length: rows }, () => Array(cols).fill("path"));

    // Decide wall density based on difficulty
    let wallDensity;
    switch (difficulty) {
      case "easy":
        wallDensity = 0.1;  // fewer walls
        break;
      case "hard":
        wallDensity = 0.3;  // more walls
        break;
      case "medium":
      default:
        wallDensity = 0.2;
        break;
    }

    // Place random walls
    const totalWalls = Math.floor(cols * rows * wallDensity);
    for (let i = 0; i < totalWalls; i++) {
      let x = Math.floor(Math.random() * cols);
      let y = Math.floor(Math.random() * rows);

      // Don't overwrite start or goal
      if ((x !== 0 || y !== 0) && (x !== cols - 1 || y !== rows - 1)) {
        newMaze[y][x] = "wall";
      }
    }

    // Check if maze is solvable
    if (!isMazeSolvable(newMaze)) {
      return generateMaze(difficulty, attempt + 1);
    }

    return newMaze;
  }

  /**
   * Checks if there's a path from top-left (0,0) to bottom-right (cols-1, rows-1).
   * Uses a simple DFS (stack).
   */
  function isMazeSolvable(checkMaze) {
    let stack = [[0, 0]];
    let visited = new Set();
    let target = `${cols - 1},${rows - 1}`;

    while (stack.length > 0) {
      let [x, y] = stack.pop();
      let key = `${x},${y}`;

      if (key === target) return true;
      if (visited.has(key) || checkMaze[y][x] === "wall") continue;

      visited.add(key);

      // Explore neighbors
      if (y > 0) stack.push([x, y - 1]);
      if (y < rows - 1) stack.push([x, y + 1]);
      if (x > 0) stack.push([x - 1, y]);
      if (x < cols - 1) stack.push([x + 1, y]);
    }
    return false;
  }

  // Draw the maze, player, and goal
  function drawMaze() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw cells
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (maze[y][x] === "wall") {
          ctx.fillStyle = "black";
        } else {
          ctx.fillStyle = "white";
        }
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);

        ctx.strokeStyle = "gray";
        ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }

    // Draw goal (green)
    ctx.fillStyle = "green";
    ctx.fillRect(goal.x * cellSize, goal.y * cellSize, cellSize, cellSize);

    // Draw player (red)
    ctx.fillStyle = "red";
    ctx.fillRect(player.x * cellSize, player.y * cellSize, cellSize, cellSize);
  }

  // Attempt to move the player
  function movePlayer(dx, dy) {
    let newX = player.x + dx;
    let newY = player.y + dy;

    // Check boundaries & walls
    if (
      newX >= 0 &&
      newX < cols &&
      newY >= 0 &&
      newY < rows &&
      maze[newY][newX] !== "wall"
    ) {
      player.x = newX;
      player.y = newY;
    }

    // Check if reached goal
    if (player.x === goal.x && player.y === goal.y) {
      alert("You won! Generating a new maze...");
      restartGame();
      return;
    }

    drawMaze();
  }

  // Listen for arrow key presses
  document.addEventListener("keydown", function(event) {
    if (event.key === "ArrowUp") movePlayer(0, -1);
    if (event.key === "ArrowDown") movePlayer(0, 1);
    if (event.key === "ArrowLeft") movePlayer(-1, 0);
    if (event.key === "ArrowRight") movePlayer(1, 0);
  });

  // Regenerate the maze and reset player/goal
  function restartGame() {
    // Get selected difficulty
    const difficulty = difficultySelect.value;

    // Generate new maze
    maze = generateMaze(difficulty);
    player = { x: 0, y: 0 };
    goal = { x: cols - 1, y: rows - 1 };

    drawMaze();
  }

  // Start the game initially
  restartGame();

  // Expose restartGame so the button can call it
  window.restartGame = restartGame;
});
