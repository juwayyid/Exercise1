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
            animateBoxes(draggedBox, targetBox, sourceCell, targetCell, () => {
                targetCell.appendChild(draggedBox);
                sourceCell.appendChild(targetBox);
                // Save the action in the undo stack
                saveAction('drop', sourceCell, targetCell, targetBox, draggedBox);
                updateButtonStates();
            });
        }
    });
}

document.querySelectorAll('td').forEach(cell => {
    addDragAndDropToCell(cell);
});

// Add row
document.getElementById('addRowBtn').addEventListener('click', function() {
    const table = document.getElementById('dragTable');
    const newRow = table.insertRow();
    const cells = [];

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
        cells.push(box);
    }
    
    // Save the action for adding a row
    saveAction('addRow', null, newRow, cells);
    updateButtonStates();
});

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

// Action command pattern
function saveAction(type, sourceCell, targetCell, sourceBox, targetBox) {
    const action = {
        type,
        sourceCell,
        targetCell,
        sourceBox,
        targetBox,
        undo() {
            if (this.type === 'drop') {
                animateBoxes(this.sourceBox, this.targetBox, targetCell, sourceCell, () => {
                    sourceCell.appendChild(this.targetBox);
                    targetCell.appendChild(this.sourceBox);
                });
            } else if (this.type === 'addRow') {
                this.targetCell.remove();
            }
        },
        redo() {
            if (this.type === 'drop') {
                animateBoxes(this.targetBox, this.sourceBox, sourceCell, targetCell, () => {
                    targetCell.appendChild(this.targetBox);
                    sourceCell.appendChild(this.sourceBox);
                });
            } else if (this.type === 'addRow') {
                document.getElementById('dragTable').appendChild(this.targetCell);
            }
        }
    };

    undoStack.push(action);
}

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
