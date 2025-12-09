let taskModal;
let editModal;
let taskList;
let taskForm;
let sortMenu;

function initializeElements() {
    taskModal = document.getElementById('task-modal');
    editModal = document.getElementById('task-modal-edit');
    taskList = document.getElementById('task-list');
    taskForm = document.getElementById('task-form');
    sortMenu = document.getElementById('sort-menu');
    
    // Ensure modal is hidden on initialization
    if (taskModal && !taskModal.classList.contains('hidden')) {
        taskModal.classList.add('hidden');
    }
}

function openTaskModal() {
    taskModal.classList.remove('hidden');
    document.getElementById('task-name').focus();
}

function openEditModal(taskItem) {
    currentEditItem = taskItem.innerText.split(" ");
    let formattedDate = '';
    if (currentEditItem.length > 1) {
        formattedDate = new Date(currentEditItem[2].match(/\d{4}-\d{2}-\d{2}/g)[0]).toISOString().split('T')[0];
    }
    document.getElementById('edit-task-name').value = currentEditItem[0]
    document.getElementById('edit-task-due-date').value = formattedDate
    let priority = 'medium';
        if (taskItem.classList.contains('priority-low')) priority = 'low';
        else if (taskItem.classList.contains('priority-high')) priority = 'high';
    document.getElementById('edit-task-priority').value = priority;
    editModal.classList.remove('hidden');
}

function closeTaskModal() {
    taskModal.classList.add('hidden');
    taskForm.reset();
}

function closeEditModal() {
    editModal.classList.add('hidden');
}

function toggleSortMenu() {
    sortMenu.classList.toggle('hidden');
}

function sortTasks(sortType) {
    const tasks = Array.from(taskList.querySelectorAll('li'));
    
    if (sortType === 'high-to-low') {
        tasks.sort((a, b) => {
            const priorityOrder = { 'priority-low': 0, 'priority-medium': 1, 'priority-high': 2 };
            const aClass = Array.from(a.classList).find(c => c.startsWith('priority-')) || 'priority-medium';
            const bClass = Array.from(b.classList).find(c => c.startsWith('priority-')) || 'priority-medium';
            return priorityOrder[bClass] - priorityOrder[aClass];
        });
    } else if (sortType === 'low-to-high') {
        tasks.sort((a, b) => {
            const priorityOrder = { 'priority-low': 0, 'priority-medium': 1, 'priority-high': 2 };
            const aClass = Array.from(a.classList).find(c => c.startsWith('priority-')) || 'priority-medium';
            const bClass = Array.from(b.classList).find(c => c.startsWith('priority-')) || 'priority-medium';
            return priorityOrder[aClass] - priorityOrder[bClass];
        });
    } else if (sortType === 'due-date') {
        tasks.sort((a, b) => {
            const aText = a.querySelector('.task-text').innerText;
            const bText = b.querySelector('.task-text').innerText;
            const aDate = extractDate(aText);
            const bDate = extractDate(bText);
            
            // Tasks with no due dates go to the end
            if (!aDate) return 1;
            if (!bDate) return -1;
            
            return new Date(aDate) - new Date(bDate);
        });
    }
    
    tasks.forEach(task => taskList.appendChild(task));
    sortMenu.classList.add('hidden');
    saveTasks();
}

function extractDate(text) {
    const match = text.match(/Due: (\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : null;
}

function submitTask(event) {
    event.preventDefault();
    const taskName = document.getElementById('task-name').value.trim();
    const dueDate = document.getElementById('task-due-date').value;
    const priority = document.getElementById('task-priority').value;
    
    if (taskName === '') {
        alert('Task name cannot be empty.');
        return;
    }
    
    let taskText = taskName;
    if (dueDate) {
        taskText += ` (DUE: ${dueDate})`;
    }
    
    addTask(taskText, priority);
    closeTaskModal();
}

function addTask(taskText, priority = 'medium') {
    let taskItem = document.createElement('li');
    taskItem.innerHTML = `<input type="checkbox"> <span class="task-text">${taskText}</span><btn class="edit-btn"><img src="images/edit.png"></btn><btn class="delete-btn">X</btn>`;
    taskItem.classList.add(`priority-${priority}`);
    taskList.appendChild(taskItem);
    
    attachEventListeners(taskItem);
    saveTasks();
}

function attachEventListeners(taskItem) {
    const checkbox = taskItem.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', function() {
        if (this.checked) {
            taskItem.classList.add('completed');
        } else {
            taskItem.classList.remove('completed');
        }
        saveTasks();
    });
    
    const deleteBtn = taskItem.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', function() {
        taskItem.remove();
        saveTasks();
    });

    const editBtn = taskItem.querySelector('.edit-btn');
    editBtn.addEventListener('click', function() {
        openEditModal(taskItem);
    });
}

function saveTasks() {
  const tasks = [];
    taskList.querySelectorAll('li').forEach(li => {
        const taskText = li.querySelector('.task-text').innerText;
        const completed = li.classList.contains('completed');
        let priority = 'medium';
        if (li.classList.contains('priority-low')) priority = 'low';
        else if (li.classList.contains('priority-high')) priority = 'high';
        tasks.push({ text: taskText, completed: completed, priority: priority });
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => {
        let taskItem = document.createElement('li');
        taskItem.innerHTML = `<input type="checkbox"> <span class="task-text">${task.text}</span><btn class="edit-btn"><img src="images/edit.png"></btn><btn class="delete-btn">X</btn>`;
        const priority = task.priority || 'medium';
        taskItem.classList.add(`priority-${priority}`);
        if (task.completed) {
            taskItem.classList.add('completed');
            taskItem.querySelector('input[type="checkbox"]').checked = true;
        }  
        taskList.appendChild(taskItem);
        attachEventListeners(taskItem);
    });
}  

initializeElements();
loadTasks();