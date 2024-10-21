let draggedBox = null;
let sourceCell = null;
let undoStack = [];
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

// drag and drop 
function addDragAndDropToCell(cell) {
  cell.addEventListener('dragover', function(event) {
    event.preventDefault();
  });
  cell.addEventListener('drop', function(event) {
    event.preventDefault();
    const targetCell = event.currentTarget;
    const targetBox = targetCell.querySelector('.box');
    if (draggedBox !== targetBox) {
      targetCell.appendChild(draggedBox);
      sourceCell.appendChild(targetBox);
      undoStack.push({ sourceCell, targetCell, sourceBox: targetBox, targetBox: draggedBox });
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
});

//undo
document.getElementById('undoBtn').addEventListener('click', function() {
  if (undoStack.length > 0) {
    const lastAction = undoStack.pop();
    const { sourceCell, targetCell, sourceBox, targetBox } = lastAction;

    
    const targetBoxRect = targetBox.getBoundingClientRect();
    const sourceCellRect = sourceCell.getBoundingClientRect();

   
    const deltaX = sourceCellRect.left - targetBoxRect.left;
    const deltaY = sourceCellRect.top - targetBoxRect.top;


    targetBox.style.transform = `translate(${deltaX}px, ${deltaY}px)`; // translation

    // move back the boxes into original
    setTimeout(() => {
      targetCell.appendChild(sourceBox);
      sourceCell.appendChild(targetBox);
      targetBox.style.transform = ''; 
    }, 500); //spped of the undo
  }
});

// Random color generator for new boxes
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
