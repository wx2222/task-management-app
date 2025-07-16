
let lists = JSON.parse(localStorage.getItem("lists")) || [];
let currentListIndex = null;

const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggle-btn');
const addBtn = document.getElementById('add-btn');
const popupContainer = document.getElementById('popup-container');
const popupClose = document.getElementById('popup-close');
const textButton = document.getElementById('text-button');
const todoButton = document.getElementById('todo-button');
const taskButton = document.getElementById('task-button');
const taskContainer = document.querySelector('.task-container');
const navList = document.querySelector(".sidebar nav ul");
const icon = document.querySelector('.icon');



function saveLists() {
    localStorage.setItem("lists", JSON.stringify(lists));  
}

function renderSidebarLists() {
    navList.innerHTML = "";

    lists.forEach((list, index) => {
        const li = document.createElement("li");
        li.dataset.index = index;  
        
        const listNameSpan = document.createElement("span");
        listNameSpan.className = "list-name";
        listNameSpan.textContent = list.name;
        
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
        
        li.appendChild(listNameSpan);
        li.appendChild(deleteBtn);
        navList.appendChild(li);

      
        li.addEventListener("click", (e) => {
            if (e.target.closest('.delete-btn')) return;
            
            currentListIndex = index;
            renderListContent(currentListIndex);
        });

        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            
            showPopupConfirm((confirmed) => {
                if (confirmed) {
                      lists.splice(index, 1);
                      saveLists();
                      
                    
                      if (currentListIndex === index) {
                          currentListIndex = null;
                      } else if (currentListIndex > index) {
                          currentListIndex--;
                      }
                      
                      renderSidebarLists();
                      renderTaskContainer();
                }
            });
        
           
        });
    });
}

function showPopupConfirm(callback) {
    const popup = document.getElementById("popup-confirm");
    popup.style.display = "flex";

    document.getElementById("confirm-yes").onclick = () => {
        popup.style.display = "none";
        callback(true);
    };
    document.getElementById("confirm-no").onclick = () => {
        popup.style.display = "none";
        callback(false);
    };
}


function renderListContent(index) {
    if (index === null || index < 0 || index >= lists.length) {
        renderTaskContainer();
        return;
    }

    const list = lists[index];
    taskContainer.innerHTML = "";

    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.value = list.name;
    titleInput.className = "list-title-input";
    titleInput.placeholder = "List Title";

    titleInput.addEventListener("input", (e) => {
        lists[index].name = e.target.value;
        saveLists();
        renderSidebarLists();
    });

    const hr = document.createElement("hr");

    taskContainer.appendChild(titleInput);
    taskContainer.appendChild(hr);

    if (list.type === 'text') {
        const textarea = document.createElement("textarea");
        textarea.value = list.content || "";
        textarea.placeholder = "Type your content here...";
        
        textarea.addEventListener("input", (e) => {
            lists[index].content = e.target.value;
            saveLists();
        });

        taskContainer.appendChild(textarea);
    } else if (list.type === 'todo') {
        const todoContainer = document.createElement("div");
        todoContainer.className = "todo-container";

        const addItemContainer = document.createElement("div");
        addItemContainer.className = "add-todo-item";

        const itemInput = document.createElement("input");
        itemInput.type = "text";
        itemInput.placeholder = "Add new task...";
        itemInput.className = "todo-input";

        const addButton = document.createElement("button");
        addButton.textContent = "Add";
        addButton.className = "add-todo-button";

        addItemContainer.appendChild(itemInput);
        addItemContainer.appendChild(addButton);
        todoContainer.appendChild(addItemContainer);

        const itemsList = document.createElement("ul");
        itemsList.className = "todo-items";

        list.items.forEach((item, itemIndex) => {
            const li = document.createElement("li");
            li.className = `todo-item ${item.completed ? 'completed' : ''}`;

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = item.completed;
            checkbox.addEventListener("change", () => {
                lists[index].items[itemIndex].completed = checkbox.checked;
                saveLists();
                li.classList.toggle('completed');
            });

            const textSpan = document.createElement("span");
            textSpan.textContent = item.text;

            const deleteBtn = document.createElement("button");
            deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
            deleteBtn.className = "delete-todo-item";
            deleteBtn.addEventListener("click", () => {
                lists[index].items.splice(itemIndex, 1);
                saveLists();
                renderListContent(index);
            });

            li.appendChild(checkbox);
            li.appendChild(textSpan);
            li.appendChild(deleteBtn);
            itemsList.appendChild(li);
        });

        addButton.addEventListener("click", () => {
            if (itemInput.value.trim()) {
                lists[index].items.push({
                    text: itemInput.value.trim(),
                    completed: false
                });
                saveLists();
                renderListContent(index);
                itemInput.value = "";
            }
        });

        itemInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                addButton.click();
            }
        });

        todoContainer.appendChild(itemsList);
        taskContainer.appendChild(todoContainer);
    } else if(list.type === 'task'){
      const sheetContainer = document.createElement('div');
      sheetContainer.className = 'task-sheet-container';
      

      const sheetHeader = document.createElement('div');
      sheetHeader.className = 'sheet-header';
      
      sheetContainer.appendChild(sheetHeader);

      const addTaskBtn = document.createElement('button');
      addTaskBtn.className = 'add-task-btn';
      addTaskBtn.textContent = '+ Add Task';
      addTaskBtn.addEventListener('click', () => {
          lists[index].tasks.push({
              title: 'New Task',
              startDate: new Date().toISOString().split('T')[0],
              endDate: new Date().toISOString().split('T')[0],
              priority: 'medium',
              description: '',
              status: 'not-started'
          });
          saveLists();
          renderListContent(index);
      });
      sheetContainer.appendChild(addTaskBtn);
      

      const taskTable = document.createElement('table');
      taskTable.className = 'task-table';
      

      const thead = document.createElement('thead');
      thead.innerHTML = `
          <tr>
              <th>Title</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Description</th>
              <th></th>
          </tr>
      `;
      taskTable.appendChild(thead);
      

      const tbody = document.createElement('tbody');
      list.tasks.forEach((task, taskIndex) => {
          const row = document.createElement('tr');
          const isOverdue = isTaskOverdue(task.endDate) && task.status !== 'completed';
          row.className = `task-row ${task.status} priority-${task.priority} ${
            isOverdue ? 'overdue' : ''
          }`;
          

          const titleCell = document.createElement('td');
          const titleInput = document.createElement('input');
          titleInput.type = 'text';
          titleInput.value = task.title;
          titleInput.addEventListener('change', (e) => {
              lists[index].tasks[taskIndex].title = e.target.value;
              saveLists();
          });
          titleCell.appendChild(titleInput);
          
   
          const startDateCell = document.createElement('td');
          const startDateInput = document.createElement('input');
          startDateInput.type = 'date';
          startDateInput.value = task.startDate || '';
          startDateInput.addEventListener('change', (e) => {
              lists[index].tasks[taskIndex].startDate = e.target.value;
              saveLists();
          });
          startDateCell.appendChild(startDateInput);
          

            const endDateCell = document.createElement('td');
            const endDateInput = document.createElement('input');
            endDateInput.type = 'date';
            endDateInput.value = task.endDate || '';
            endDateInput.className = isOverdue ? 'overdue-date' : '';
            endDateInput.addEventListener('change', (e) => {
              lists[index].tasks[taskIndex].endDate = e.target.value;
              saveLists();
              renderListContent(index); 
            });
            endDateCell.appendChild(endDateInput);
          

          const priorityOptions = [
              { value: 'low', label: '🟢 Low' },
              { value: 'medium', label: '🟠 Medium' }, 
              { value: 'high', label: '🔴 High' }
          ];

          const priorityCell = document.createElement('td');
          const prioritySelect = document.createElement('select');
          priorityOptions.forEach(({value, label}) => {
              const option = document.createElement('option');
              option.value = value; 
              option.textContent = label; 
              option.selected = task.priority === value;
              prioritySelect.appendChild(option);
          });

          prioritySelect.addEventListener('change', (e) => {
            const newPriority = e.target.value;

            lists[index].tasks[taskIndex].priority = newPriority;
            saveLists();
            
            const currentTask = lists[index].tasks[taskIndex];
            
            const isOverdue = isTaskOverdue(currentTask.endDate) && currentTask.status !== 'completed';
        
            row.className = [
                'task-row',
                currentTask.status,
                `priority-${newPriority}`,
                isOverdue ? 'overdue' : ''
            ].filter(Boolean).join(' ');
          });
          priorityCell.appendChild(prioritySelect);
          

          const statusCell = document.createElement('td');
          const statusSelect = document.createElement('select');
          ['not-started', 'in-progress', 'completed'].forEach(status => {
              const option = document.createElement('option');
              option.value = status;
              option.textContent = status.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
              option.selected = task.status === status;
              statusSelect.appendChild(option);
          });
          statusSelect.addEventListener('change', (e) => {
              lists[index].tasks[taskIndex].status = e.target.value;
              saveLists();
              row.className = `task-row ${e.target.value} priority-${task.priority}`;
          });
          statusCell.appendChild(statusSelect);
          
 
          const descCell = document.createElement('td');
          const descInput = document.createElement('input');
          descInput.type = 'text';
          descInput.value = task.description || '';
          descInput.addEventListener('change', (e) => {
              lists[index].tasks[taskIndex].description = e.target.value;
              saveLists();
          });
          descCell.appendChild(descInput);
          
      
          const actionsCell = document.createElement('td');
          const deleteBtn = document.createElement('button');
          deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
          deleteBtn.className = 'delete-task-btn';
          deleteBtn.addEventListener('click', () => {
              lists[index].tasks.splice(taskIndex, 1);
              saveLists();
              renderListContent(index);
          });
          actionsCell.appendChild(deleteBtn);
          
          row.appendChild(titleCell);
          row.appendChild(startDateCell);
          row.appendChild(endDateCell);
          row.appendChild(priorityCell);
          row.appendChild(statusCell);
          row.appendChild(descCell);
          row.appendChild(actionsCell);
          
          tbody.appendChild(row);
      });
      taskTable.appendChild(tbody);
      sheetContainer.appendChild(taskTable);
      

     
      
      taskContainer.appendChild(sheetContainer);
    }
}

function renderTaskContainer() {
    taskContainer.innerHTML = "";
    
    if (lists.length === 0 || currentListIndex === null) {
        const emptyDiv = document.createElement("div");
        emptyDiv.className = "empty-list";
        emptyDiv.innerHTML = `
            <p>${'Click "+" to add your list'}</p>
        `;
        taskContainer.appendChild(emptyDiv);
    } else {
        renderListContent(currentListIndex);
    }
}

function isTaskOverdue(endDate) {
  if (!endDate) return false; 
  const today = new Date().toISOString().split('T')[0];
  return endDate < today; 
}

toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
});

addBtn.addEventListener('click', () => {
    popupContainer.style.display = 'flex';
});

popupContainer.addEventListener('click', (e) => {
    if (e.target === popupContainer) {
        popupContainer.style.display = 'none';
    }
});

popupClose.addEventListener('click', () => {
    popupContainer.style.display = 'none';
});

textButton.addEventListener('click', () => {
    const newList = {
        type: 'text',
        name: `New Text List`,
        content: ""
    };
    
    lists.push(newList);
    saveLists();
    currentListIndex = lists.length - 1;
    
    renderSidebarLists();
    renderListContent(currentListIndex);
    popupContainer.style.display = 'none';
});

todoButton.addEventListener('click', () => {
    lists.push({
        type: 'todo',
        name: `New To-Do List`,
        items: []
    });
    saveLists();
    currentListIndex = lists.length - 1;
    renderSidebarLists();
    renderListContent(currentListIndex);
    popupContainer.style.display = 'none';
});

taskButton.addEventListener('click', () => {
    lists.push({
        type: 'task',
        name: `New Task Sheet`,
        tasks: [
            {
                title: 'New Task',
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0],
                priority: 'medium',
                description: '',
                status: 'not-started'
            }
        ]
    });
    saveLists();
    currentListIndex = lists.length - 1;
    renderSidebarLists();
    renderListContent(currentListIndex);
    popupContainer.style.display = 'none';
});


renderSidebarLists();
renderTaskContainer();
