let taskModal;
let editModal;
let taskList;
let taskForm;
let sortMenu;

class Task {
    constructor(taskName, dueDate, priority, completed = false) {
        this.taskName = taskName;
        this.dueDate = dueDate;
        this.priority = priority;
        this.displaytext = generateTaskText(taskName, dueDate);
        this.completed = completed;
    }   
}

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
            let aText = extractDate(a.querySelector('.task-text').innerText);
            let bText = extractDate(b.querySelector('.task-text').innerText);
            let aDate = aText ? new Date(extractDate(aText)) : new Date(8640000000000000);
            let bDate = bText ? new Date(extractDate(bText)) : new Date(8640000000000000);

            return aDate.getTime() - bDate.getTime();
        });
    }
    
    tasks.forEach(task => taskList.appendChild(task));
    sortMenu.classList.add('hidden');
    reSaveTasks();
}

function extractDate(text) {
    const match = text.match(/(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : "";
}

//This is bad code but would need to refactor whole thing and not enough time at the moment
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
    const newTask = new Task(taskName, dueDate, priority);

    addTask(taskText, priority, newTask);
    closeTaskModal();
}

function addTask(taskText, priority = 'medium', newTask) {
    let taskItem = document.createElement('li');
    taskItem.innerHTML = `<input type="checkbox"> <span class="task-text">${taskText}</span><btn class="edit-btn"><img src="images/edit.png"></btn><btn class="delete-btn">X</btn>`;
    taskItem.classList.add(`priority-${priority}`);
    taskList.appendChild(taskItem);
    
    attachEventListeners(taskItem);
    saveTasks(newTask);
}

function attachEventListeners(taskItem) {
    const checkbox = taskItem.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', function() {
        if (this.checked) {
            taskItem.classList.add('completed');
        } else {
            taskItem.classList.remove('completed');
        }
        reSaveTasks();
    });
    
    const deleteBtn = taskItem.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', function() {
        taskItem.remove();
        reSaveTasks();
    });

    const editBtn = taskItem.querySelector('.edit-btn');
    editBtn.addEventListener('click', function() {
        openEditModal(taskItem);
    });
}

//Resaves tasks to local storage but inefficiently? need to find better way to do this
//Will be a problem if someone puts in (DUE: YYYY-MM-DD) in task name but unsure how to fix
function reSaveTasks() {
    const tasks = [];
    taskList.querySelectorAll('li').forEach(li => {
        var taskText = li.querySelector('.task-text').innerText;
        const dueDate = extractDate(taskText);
        taskText = taskText.replace(` (DUE: ${dueDate})`, '');
        const completed = li.classList.contains('completed');
        let priority = 'medium';
        if (li.classList.contains('priority-low')) priority = 'low';
        else if (li.classList.contains('priority-high')) priority = 'high';

        tasks.push(new Task(taskText, dueDate, priority, completed));
    });
    console.log(tasks);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function saveTasks(newTask) {
    var tasks = JSON.parse(localStorage.getItem('tasks') || "[]");
    tasks.push(newTask);
    console.log(tasks);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks') || "[]");
    console.log(tasks);
    tasks.forEach(task => {
        let taskItem = document.createElement('li');
        taskItem.innerHTML = `<input type="checkbox"> <span class="task-text">${task.displaytext}</span><btn class="edit-btn"><img src="images/edit.png"></btn><btn class="delete-btn">X</btn>`;
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

function generateTaskText(taskName, dueDate) {
    if (dueDate) {
        return taskName + ` (DUE: ${dueDate})`;
    }
    return taskName 
}

initializeElements();
loadTasks();