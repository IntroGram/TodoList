let taskModal;
let editModal;
let taskList;
let taskForm;
let sortMenu;
let temporaryTaskSave;

class Task {
    constructor(taskName, dueDate, priority, completed = false) {
        this.taskName = taskName;
        this.dueDate = dueDate;
        this.dueDateText = generateDueDateText(dueDate);
        this.priority = priority;
        this.completed = completed;
    }   
}

function generateDueDateText(dueDate) {
    if (dueDate) {
        return `<b> (DUE: ${dueDate})</b>`; // Assuming dueDate is a string in the format "YYYY-MM-DD"
    }
    return "";
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

//Populates the Edit Modal with the current task's information
function openEditModal(taskItem) {
    var currentEditItem = taskItem.innerText;
    
    let dueDate = extractDate(currentEditItem);
    if (dueDate) {
        currentEditItem = currentEditItem.replace(`(DUE: ${dueDate})`, '').trim();
    }

    document.getElementById('edit-task-name').value = currentEditItem
    document.getElementById('edit-task-due-date').value = dueDate
    let priority = 'medium';
        if (taskItem.classList.contains('priority-low')) priority = 'low';
        else if (taskItem.classList.contains('priority-high')) priority = 'high';
    document.getElementById('edit-task-priority').value = priority;

    temporaryTaskSave = new Task(currentEditItem, dueDate, priority);
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

// Sorts tasks based on the selected sort type
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
            let aText = extractDate(a.querySelector('.due-date-text').innerText);
            let bText = extractDate(b.querySelector('.due-date-text').innerText);
            let aDate = aText ? new Date(extractDate(aText)) : new Date(8640000000000000);
            let bDate = bText ? new Date(extractDate(bText)) : new Date(8640000000000000);

            return aDate.getTime() - bDate.getTime();
        });
    }
    
    tasks.forEach(task => taskList.appendChild(task));
    sortMenu.classList.add('hidden');
    reSaveTasks();
}

// Pulls the due date from the task text
function extractDate(text) {
    const match = text.match(/(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : "";
}

//This fuction does not feel correct or be elegant would need more time refactor
function submitTask(event) {
    event.preventDefault();
    const taskName = document.getElementById('task-name').value.trim();
    const dueDate = document.getElementById('task-due-date').value;
    const priority = document.getElementById('task-priority').value;
    
    if (taskName === '') {
        alert('Task name cannot be empty.');
        return;
    }
    const regex = /(\d{4}-\d{2}-\d{2})/;
    if (regex.test(taskName)) {
        alert('Task name cannot contain a date.');
        return;
    }
    const newTask = new Task(taskName, dueDate, priority);
    addTask(newTask);
    closeTaskModal();
}

// Only called by the submitTask function
function addTask(newTask) {
    let newListLine = document.createElement('li');
    newListLine.innerHTML = `<input type="checkbox"> <span class="task-text">${newTask.taskName}</span><span class="due-date-text">${newTask.dueDateText}</span><btn class="edit-btn"><img src="images/edit.png"></btn><btn class="delete-btn"><img src="images/blackX.png"></btn>`;
    newListLine.classList.add(`priority-${newTask.priority}`);
    taskList.appendChild(newListLine); 
    attachEventListeners(newListLine);
    saveTasks(newTask);
}

//Attaches event listeners to each button on the line
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
        if(taskItem.classList.contains('completed')){
            alert("You cannot edit a completed task.");
            return;
        }
        openEditModal(taskItem);
    });
}

//This feels like bad code - I'm aware but unsure how to exactly refactor it
//Resaves entire list of tasks to local storage when edit button is clicked
function submitEditTask(event) {
    event.preventDefault();
    const newTaskName = document.getElementById('edit-task-name').value.trim();
    const newDueDate = document.getElementById('edit-task-due-date').value;
    const newPriority = document.getElementById('edit-task-priority').value;

    const tasks = [];
    taskList.querySelectorAll('li').forEach(li => {
        var taskText = li.querySelector('.task-text').innerText;
        var dueDate = extractDate(li.querySelector('.due-date-text').innerText);
        const completed = li.classList.contains('completed');
        let priority = 'medium';
        if (li.classList.contains('priority-low')) priority = 'low';
        else if (li.classList.contains('priority-high')) priority = 'high';
        if (taskText === temporaryTaskSave.taskName && dueDate === temporaryTaskSave.dueDate && priority === temporaryTaskSave.priority) {
            tasks.push(new Task(newTaskName, newDueDate, newPriority));
        }else{
            tasks.push(new Task(taskText, dueDate, priority, completed));
        }
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
    closeEditModal();
    window.location.reload();
}

//Resaves tasks to local storage but inefficiently? need to find better way to do this
//Will be a problem if someone puts in (DUE: YYYY-MM-DD) - fixed by checking for an extra date when adding task but inelegant
//Will also probably be a problem if someone puts in HTML tags in the task name - UNFIXED
function reSaveTasks() {
    const tasks = [];
    taskList.querySelectorAll('li').forEach(li => {
        var taskText = li.querySelector('.task-text').innerText;
        var dueDate = extractDate(li.querySelector('.due-date-text').innerText);
        const completed = li.classList.contains('completed');
        let priority = 'medium';
        if (li.classList.contains('priority-low')) priority = 'low';
        else if (li.classList.contains('priority-high')) priority = 'high';
        tasks.push(new Task(taskText, dueDate, priority, completed));
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function saveTasks(newTask) {
    var tasks = JSON.parse(localStorage.getItem('tasks') || "[]");
    tasks.push(newTask);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks') || "[]");
    tasks.forEach(task => {
        let taskItem = document.createElement('li');
        taskItem.innerHTML = `<input type="checkbox"> <span class="task-text">${task.taskName}</span><span class="due-date-text">${task.dueDateText}</span><btn class="edit-btn"><img src="images/edit.png"></btn><btn class="delete-btn"><img src="images/blackX.png"></btn>`;
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