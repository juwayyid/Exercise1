let draggedBox = null;
let sourceCell = null;
let undoStack = [];
let redoStack = [];
let nextBoxId = 1000;

// Drag start and end
document.addEventListener('dragstart', function(event) {
    draggedBox = event.target;
    sourceCell = draggedBox.parentElement;
    draggedBox.classList.add('dragging');
});

document.addEventListener('dragend', function(event) {
    draggedBox.classList.remove('dragging');
});

// Drag and drop
function addDragAndDropToCell(cell) {
    cell.addEventListener('dragover', function(event) {
        event.preventDefault();
    });
    cell.addEventListener('drop', function(event) {
        event.preventDefault();
        const targetCell = event.currentTarget;
        const targetBox = targetCell.querySelector('.box');
        
        if (draggedBox !== targetBox) {
            const command = new DropCommand(sourceCell, targetCell, draggedBox, targetBox);
            command.execute();
            undoStack.push(command);
            redoStack = []; // Clear redo stack after a new action
            updateButtonStates();
        }
    });
}

document.querySelectorAll('td').forEach(cell => {
    addDragAndDropToCell(cell);
});

// Add row
document.getElementById('addRowBtn').addEventListener('click', function() {
    const table = document.getElementById('dragTable');
    const command = new AddRowCommand(table);
    command.execute();
    undoStack.push(command);
    redoStack = []; // Clear redo stack after a new action
    updateButtonStates();
});

// Command Classes for Undo/Redo
class DropCommand {
    constructor(sourceCell, targetCell, sourceBox, targetBox) {
        this.sourceCell = sourceCell;
        this.targetCell = targetCell;
        this.sourceBox = sourceBox;
        this.targetBox = targetBox;
    }

    execute() {
        animateBoxes(this.sourceBox, this.targetBox, this.sourceCell, this.targetCell, () => {
            this.targetCell.appendChild(this.sourceBox);
            this.sourceCell.appendChild(this.targetBox);
        });
    }

    undo() {
        animateBoxes(this.sourceBox, this.targetBox, this.targetCell, this.sourceCell, () => {
            this.sourceCell.appendChild(this.sourceBox);
            this.targetCell.appendChild(this.targetBox);
        });
    }

    redo() {
        this.execute();
    }
}

class AddRowCommand {
    constructor(table) {
        this.table = table;
        this.newRow = null;
        this.cells = [];
    }

    execute() {
        this.newRow = this.table.insertRow();
        for (let i = 0; i < 3; i++) {
            const cell = this.newRow.insertCell();
            const box = document.createElement('div');
            box.className = 'box';
            box.id = `box${nextBoxId}`;
            box.textContent = nextBoxId;
            box.style.backgroundColor = getRandomColor();
            box.setAttribute('draggable', true);
            cell.appendChild(box);
            addDragAndDropToCell(cell);
            this.cells.push(box);
            nextBoxId += 100;
        }
    }

    undo() {
        this.table.deleteRow(this.newRow.rowIndex);
    }

    redo() {
        this.execute();
    }
}

// Undo and Redo functionality
document.getElementById('undoBtn').addEventListener('click', function() {
    if (undoStack.length > 0) {
        const lastAction = undoStack.pop();
        lastAction.undo();
        redoStack.push(lastAction);
        updateButtonStates();
    }
});

document.getElementById('redoBtn').addEventListener('click', function() {
    if (redoStack.length > 0) {
        const lastAction = redoStack.pop();
        lastAction.redo();
        undoStack.push(lastAction);
        updateButtonStates();
    }
});

// Animation for boxes during drag and drop
function animateBoxes(box1, box2, cell1, cell2, callback) {
    const box1Rect = box1.getBoundingClientRect();
    const box2Rect = box2.getBoundingClientRect();

    const deltaX1 = cell1.getBoundingClientRect().left - box1Rect.left;
    const deltaY1 = cell1.getBoundingClientRect().top - box1Rect.top;
    const deltaX2 = cell2.getBoundingClientRect().left - box2Rect.left;
    const deltaY2 = cell2.getBoundingClientRect().top - box2Rect.top;

    box1.style.transition = 'transform 0.5s ease-in-out';
    box2.style.transition = 'transform 0.5s ease-in-out';

    box1.style.transform = `translate(${deltaX1}px, ${deltaY1}px)`;
    box2.style.transform = `translate(${deltaX2}px, ${deltaY2}px)`;

    setTimeout(() => {
        callback();
        box1.style.transform = '';
        box2.style.transform = '';
    }, 500);
}

// Update button states based on stack length
function updateButtonStates() {
    document.getElementById('undoBtn').disabled = undoStack.length === 0;
    document.getElementById('redoBtn').disabled = redoStack.length === 0;
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

// Initialize button states on page load
updateButtonStates();
