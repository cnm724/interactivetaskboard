// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId"));

//  a function that generates a unique task id
function generateTaskId() {
    if (nextId === null) {
        nextId = 1
    } else {
        nextId++
    }

    localStorage.setItem('nextId', JSON.stringify(nextId))
    return nextId
}

// creates a task card for each input by using jquery
function createTaskCard(task) {
    let taskCard = $("<div>")
        .addClass('card task-card draggable my-3')
        .attr('data-task-id', task.id);
    const cardHeader = $('<div>').addClass('card-header h4').text(task.title);
    const cardBody = $('<div>').addClass('card-body');
    const cardDescription = $('<p>').addClass('card-text').text(task.description);
    const cardDueDate = $('<p>').addClass('card-text').text(task.dueDate);
    const cardDeleteBtn = $('<button>').addClass('btn btn-danger delete').text('Delete').attr('data-task-id', task.id);    
    cardDeleteBtn.on('click', handleDeleteTask);

  // Sets the card background color based on due date
  if (task.dueDate && task.status !== 'done') {
    const now = dayjs();
    const taskDueDate = dayjs(task.dueDate, 'DD/MM/YYYY');

    // task due today will turn yellow. overdue task will turn red.
    if (now.isSame(taskDueDate, 'day')) {
      taskCard.addClass('bg-warning text-white');
    } else if (now.isAfter(taskDueDate)) {
      taskCard.addClass('bg-danger text-white');
      cardDeleteBtn.addClass('border-light');
    }
  }
        
    // appending elements above to taskCard
    cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
    taskCard.append(cardHeader, cardBody);

    return taskCard;
    }


// a function that renders the task list and make cards draggable
function renderTaskList() {
    //clears containers, so cards don't duplicate when adding more tasks
    $('#todo-cards').empty()
    $('#in-progress-cards').empty()
    $('#done-cards').empty()

    //checks each object in the task list array and separate them by their status
    for (let index = 0; index < taskList.length; index++) {
        if (taskList[index].status === "to-do") {
            $('#todo-cards').append(createTaskCard(taskList[index]))
        } else if (taskList[index].status === "in-progress") {
            $('#in-progress-cards').append(createTaskCard(taskList[index]))
        } else {
            $('#done-cards').append(createTaskCard(taskList[index]))
        }

    }

    //creates card to be draggable, and give some attributes
    $('.draggable').draggable ({
        opacity: 0.7,
        zIndex: 1000,
        helper: function (e){
            const original  = $(e.target).hasClass('ui-draggable') ? $(e.target): $(e.target).closest('.ui-draggable');
            // creates a duplicate of the card while dragging to other container
            return original.clone().css({
                maxWidth: original.outerWidth(),
                width: original.outerWidth()
            });
        },
        // if dragged to a position on the page that won't accept a droppable feature, it will return to its original positon
        revert: "invalid",
    });

}

// a function to handle adding a new task
function handleAddTask(event) {
    event.preventDefault();

    //tasks object that will store the id, title, description, due date, and the status
    const tasks = {
        id: generateTaskId(),
        title: $("#task-title").val(),
        description: $("#description").val(),
        dueDate: $("#dueDate").val(),
        status: "to-do",

    }

    // pushes task object into taskList array, and sets it to the local storage
    taskList.push(tasks);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();

    // clears input fields to allow the form to reset when a user goes back to add more tasks
    $("#task-title").val("");
    $("#description").val("");
    $("#dueDate").val("");
}


//a function that handles deleting a task
function handleDeleteTask(event) {
    const taskId = $(event.currentTarget).data("task-id");
    taskList = taskList.filter(task => task.id !== taskId);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();
}

//a function that handles dropping a task into a new status lane
function handleDrop(event, ui) {      
        event.preventDefault();
        const taskId = ui.draggable.attr("data-task-id");
        const newStatus = event.target.id;
        
        const task = taskList.find(task => task.id == taskId);
        if (task) {
            task.status = newStatus;
            localStorage.setItem("tasks", JSON.stringify(taskList));
            renderTaskList();
        }
    }


//calls on elements once the page opens
$(document).ready(function () {
    
    renderTaskList();

    $('.lane').droppable({
        accept: '.draggable',
        drop: handleDrop
    });

    $('#taskForm').on('submit', handleAddTask)
});