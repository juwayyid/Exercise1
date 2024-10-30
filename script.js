let draggedBox = null;
let sourceCell = null;
let undoStack = [];
let redoStack = [];
let nextBoxId = 1000; 

// Command Pattern for Undo and Redo
class Command {
    constructor(execute, undo) {
        this.execute = execute;
        this.undo = undo;
    }
}

function addDragAndDropToCell(cell) {
    cell.addEventListener('dragover', function(event) {
        event.preventDefault();
    });
    cell.addEventListener('drop', function(event) {
        event.preventDefault();
        const targetCell = event.currentTarget;
        const targetBox = targetCell.querySelector('.box');

        if (draggedBox !== targetBox) {
            // Store command for redo
            const command = new Command(
                () => {
                    targetCell.appendChild(draggedBox);
                    sourceCell.appendChild(targetBox);
                },
                () => {
                    sourceCell.appendChild(draggedBox);
                    targetCell.appendChild(targetBox);
                }
            );
            executeCommand(command);
        }
    });
}

document.querySelectorAll('td').forEach(cell => {
    addDragAndDropToCell(cell);
});

// Drag start and end
document.addEventListener('dragstart', function(event) {
    draggedBox = event.target;
    sourceCell = draggedBox.parentElement;
    draggedBox.classList.add('dragging');
});

document.addEventListener('dragend', function(event) {
    draggedBox.classList.remove('dragging');
});

// Add row with undo functionality
document.getElementById('addRowBtn').addEventListener('click', function() {
    const table = document.getElementById('dragTable');
    const command = new Command(
        () => {
            const newRow = table.insertRow();
            for (let i = 0; i < 3; i++) {
                const cell = newRow.insertCell();
                const box = document.createElement('div');
                box.className = 'box';
                box.id = `box${nextBoxId}`;
                box.textContent = nextBoxId;
                box.style.backgroundColor = getRandomColor();
                box.setAttribute('draggable', true);
                cell.appendChild(box);
                addDragAndDropToCell(cell); 
                nextBoxId += 100;
            }
        },
        () => {
            table.deleteRow(-1); // Remove last row
        }
    );
    executeCommand(command);
});

// Undo function
document.getElementById('undoBtn').addEventListener('click', function() {
    if (undoStack.length > 0) {
        const command = undoStack.pop();
        command.undo();
        redoStack.push(command);
        animateUndoButton();
    }
    updateButtonStates();
});

// Redo function
document.getElementById('redoBtn').addEventListener('click', function() {
    if (redoStack.length > 0) {
        const command = redoStack.pop();
        command.execute();
        undoStack.push(command);
        animateUndoButton();
    }
    updateButtonStates();
});

// Execute command
function executeCommand(command) {
    command.execute();
    undoStack.push(command);
    redoStack = []; // Clear redo stack
    updateButtonStates();
}

// Update button states based on stack lengths
function updateButtonStates() {
    document.getElementById('undoBtn').disabled = undoStack.length === 0;
    document.getElementById('redoBtn').disabled = redoStack.length === 0;
}

// Animation for the undo button
function animateUndoButton() {
    const undoBtn = document.getElementById('undoBtn');
    undoBtn.classList.add('undo-animation');
    setTimeout(() => {
        undoBtn.classList.remove('undo-animation');
    }, 300);
}

// Random color generator for new boxes
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Function to undo translate animation for boxes
function undoTranslate(targetBox, originalPosition) {
    const targetBoxRect = targetBox.getBoundingClientRect();
    const deltaX = originalPosition.left - targetBoxRect.left;
    const deltaY = originalPosition.top - targetBoxRect.top;

    targetBox.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

    setTimeout(() => {
        targetBox.style.transform = ''; 
    }, 500);
}

// Execute the animation when undoing
function executeUndoAnimation(lastAction) {
    const { targetBox, originalPosition } = lastAction;
    undoTranslate(targetBox, originalPosition);
}
