// Size of grid
const numRows = 65;
const numCols = 85;

// Size of cells in pixels
const cellSize = 3.5;

// Matrix that contains the maze
const matrix = "initial_matrix.txt";

// Variable that contains the path to be animated
let path = "";

// Variable that indicates whether the animation should stop or not
let shouldStop = false;

// Variable that indicates whether the animation is running or not
let isAnimating = false;

// Variable that contains the coordinates of the last cell that was animated
let stoppedCoords = {
    row: 0,
    column: 0
};

// Initial grid
let grid = [];

// Function that reads the initial matrix from the file
fetch(matrix)
    .then(response => response.text())
    .then(data => {
        // Split the file into lines
        let rows = data.split('\n');

        // Loop through the lines and split each line into columns
        for (let i = 0; i < rows.length; i++) {
            let values = rows[i].trim().split(' ');
            let row = [];
            for (let j = 0; j < values.length; j++) {
                row.push(parseInt(values[j]));
            }
            grid.push(row);
        }

        // Render the maze on the screen
        renderGrid(grid);
    })
    .catch(error => console.log(error));

// Function that checks if a cell is adjacent to a green cell
function hasGreenCellAdjacent(row, column) {
    const adjacentCells = [
        [row - 1, column],
        [row + 1, column],
        [row, column - 1],
        [row, column + 1],
        [row - 1, column - 1],
        [row - 1, column + 1],
        [row + 1, column - 1],
        [row + 1, column + 1]
    ];

    let numGreen = 0;
    adjacentCells.forEach(([r, c]) => {
        if (grid[r] && grid[r][c] === 1) {
            numGreen++;
        }
    });

    return numGreen > 0;
}

// Function that renders the maze on the screen
function renderGrid() {
    const table = document.getElementById("maze");
    table.innerHTML = ""; // clear the table

    for (let i = 0; i < numRows; i++) {
        let row = document.createElement("tr");
        for (let j = 0; j < numCols; j++) {
            let cell = document.createElement("td");
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;

            const color = getColorForCell(grid[i][j]);
            cell.style.backgroundColor = color;

            row.appendChild(cell);
        }
        table.appendChild(row);
    }
}

function getColorForCell(value) {
    switch (value) {
        case 1:
            return "#28a745";
        case 3:
        case 4:
            return "#ffc107";
        default:
            return "#FFFFFF";
    }
}


// Function that creates path animation and shows victory message
async function animatePath(path) {
    const messageDiv = document.getElementById("message");
    if (messageDiv) {
        return;
    }

    let row = stoppedCoords.row;
    let column = stoppedCoords.column;

    for (let i = 0; i < path.length; i++) {
        if (shouldStop) {
            stoppedCoords.row = row;
            stoppedCoords.column = column;
            break;
        }

        const prevRow = row;
        const prevColumn = column;

        const step = path[i];
        switch (step) {
            case "R":
                column++;
                break;
            case "L":
                column--;
                break;
            case "U":
                row--;
                break;
            case "D":
                row++;
                break;
            default:
                break;
        }

        if (row === numRows - 1 && column === numCols - 1) {
            grid[prevRow][prevColumn] = 0;
            grid[row][column] = 4;
            showMessage("Congratulations!");
        } else {
            grid[prevRow][prevColumn] = 0;
            grid[row][column] = 3;
        }

        renderGrid();

        await sleep(1);
    }
    isAnimating = false;
}

// Sleep function to wait for a period in milliseconds
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Function that reads the path from the input and starts the animation
function startGame() {
    if (!path || isAnimating) {
      return;
    }
    shouldStop = false;
    animatePath(path);
    isAnimating = true;
}
  

// Function that stops the animation
function stopGame() {
    shouldStop = true;
}

// Function that restarts the game
function restart() {
    location.reload();
}

// Function that reads the path from the file and starts the animation
function handleFileInput(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        path = event.target.result;

        // Save path to localStorage
        localStorage.setItem('mazePath', path);
    };
    reader.readAsText(file);
}

// Load path from localStorage, if available
const savedPath = localStorage.getItem('mazePath');
if (savedPath) {
    path = savedPath;
}

// Function that shows a message on the screen
function showMessage(text) {
    const messageDiv = document.createElement("div");
    messageDiv.setAttribute("id", "message");
    messageDiv.style.position = "fixed";
    messageDiv.style.top = "50%";
    messageDiv.style.left = "50%";
    messageDiv.style.transform = "translate(-50%, -50%)";
    messageDiv.style.padding = "20px";
    messageDiv.style.backgroundColor = "#ffc107";
    messageDiv.style.color = "white";
    messageDiv.style.borderRadius = "5px";
    messageDiv.style.zIndex = 1000;
    messageDiv.textContent = text;

    document.body.appendChild(messageDiv);
}

// Function that hides the message
function hideMessage() {
    const messageDiv = document.getElementById("message");
    if (messageDiv) {
        messageDiv.parentNode.removeChild(messageDiv);
    }
}

// Adds click event to start button
document.getElementById("start").addEventListener("click", startGame);

// Adds click event to stop button
document.getElementById("stop").addEventListener("click", stopGame);

// Adds click event to restart button
document.getElementById("restart").addEventListener("click", restart);