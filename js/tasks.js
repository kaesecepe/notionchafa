/* 🌸 COZY ACADEMIC DASHBOARD - TASK MANAGER MODULE 🌸
   Manages task display, interactive checkboxes, quick-add validation, and filters. */

const taskManager = (() => {
    let tasksList = [];
    let coursesList = [];
    
    // Filter State
    let filterMode = 'DATE'; // 'DATE' or 'COURSE'
    let selectedDateStr = '';
    let selectedCourse = null;

    let onTaskChangeCallback = null;

    const init = (onTaskChange) => {
        onTaskChangeCallback = onTaskChange;
        setupEventListeners();
    };

    const setupEventListeners = () => {
        const quickAddForm = document.getElementById('task-quick-add-form');
        if (quickAddForm) {
            quickAddForm.addEventListener('submit', handleQuickAdd);
        }
    };

    const updateData = (tasks, courses) => {
        tasksList = tasks;
        coursesList = courses;
        populateQuickAddCourseDropdown();
        render();
    };

    // Filters tasks by date (called from calendar selection)
    const setDateFilter = (dateStr) => {
        filterMode = 'DATE';
        selectedDateStr = dateStr;
        selectedCourse = null;
        render();
    };

    // Filters tasks by course (called from schedule or gallery card click)
    const setCourseFilter = (course) => {
        filterMode = 'COURSE';
        selectedCourse = course;
        render();
    };

    // Populates the inline course dropdown in task quick-add
    const populateQuickAddCourseDropdown = () => {
        const select = document.getElementById('task-course-select');
        if (!select) return;

        const currentVal = select.value;
        select.innerHTML = '<option value="">🌸 Sin Curso</option>';

        coursesList.forEach(course => {
            const option = document.createElement('option');
            option.value = course.id;
            option.text = `${course.code} - ${course.name}`;
            select.appendChild(option);
        });

        // Restore value if still exists
        select.value = currentVal;
    };

    // Format date string from YYYY-MM-DD to DD/MM
    const formatDayMonth = (dateStr) => {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}`;
    };

    // Handles quick task creation
    const handleQuickAdd = async (e) => {
        e.preventDefault();
        const input = document.getElementById('task-title-input');
        const courseSelect = document.getElementById('task-course-select');
        
        if (!input || !input.value.trim()) return;

        const title = input.value.trim();
        const courseId = courseSelect ? courseSelect.value : '';

        // Determine default due date
        // If course filter is active, default to today. If date filter is active, use selected date.
        let dueDate = selectedDateStr || db.formatDateKey(new Date());

        const newTaskPayload = {
            title: title,
            due_date: dueDate,
            completed: false
        };

        if (courseId) {
            newTaskPayload.course_id = courseId;
        } else if (filterMode === 'COURSE' && selectedCourse) {
            newTaskPayload.course_id = selectedCourse.id;
        }

        try {
            input.value = ''; // Clear immediately for snappy feel
            await db.addTask(newTaskPayload);
            
            if (onTaskChangeCallback) {
                await onTaskChangeCallback(); // Refetch global state
            }
        } catch (err) {
            console.error("🌸 Error adding task:", err);
            alert("Hubo un error al agregar la tarea.");
        }
    };

    const handleTaskToggle = async (taskId, completed) => {
        const taskElement = document.querySelector(`.task-item[data-id="${taskId}"]`);
        if (taskElement) {
            if (completed) {
                taskElement.classList.add('completed');
            } else {
                taskElement.classList.remove('completed');
            }
        }

        try {
            await db.toggleTask(taskId, completed);
            if (onTaskChangeCallback) {
                // Refresh background data quietly to keep badge counters in sync
                const updatedTasks = await db.getTasks();
                tasksList = updatedTasks;
                
                // Fire callback to refresh gallery badge counts, but don't full-render task manager
                // to prevent scroll-jumps or input blur
                const event = new CustomEvent('tasksUpdated', { detail: { tasks: updatedTasks } });
                window.dispatchEvent(event);
            }
        } catch (err) {
            console.error("🌸 Error toggling task:", err);
        }
    };

    const handleTaskDelete = async (taskId) => {
        const taskElement = document.querySelector(`.task-item[data-id="${taskId}"]`);
        if (taskElement) {
            // Apply quick fade-out animation
            taskElement.style.opacity = '0';
            taskElement.style.transform = 'translateY(-10px)';
            taskElement.style.transition = 'all 0.25s ease';
        }

        setTimeout(async () => {
            try {
                await db.deleteTask(taskId);
                if (onTaskChangeCallback) {
                    await onTaskChangeCallback();
                }
            } catch (err) {
                console.error("🌸 Error deleting task:", err);
            }
        }, 250);
    };

    const render = () => {
        const container = document.getElementById('task-list');
        const filterTitle = document.getElementById('task-filter-title');
        const clearFilterContainer = document.getElementById('task-clear-filter-container');
        
        if (!container) return;

        let filteredTasks = [];

        // Apply filter logic
        if (filterMode === 'DATE') {
            filteredTasks = tasksList.filter(t => t.due_date === selectedDateStr);
            
            // Format nice human-readable date
            const dateParts = selectedDateStr.split('-');
            const formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : selectedDateStr;
            
            if (filterTitle) {
                filterTitle.innerHTML = `Pendientes del día 📅 <span style="font-weight: 500;">(${formattedDate})</span>`;
            }
            if (clearFilterContainer) {
                clearFilterContainer.style.display = 'none';
            }
        } else if (filterMode === 'COURSE' && selectedCourse) {
            filteredTasks = tasksList.filter(t => t.course_id === selectedCourse.id);
            
            if (filterTitle) {
                filterTitle.innerHTML = `Tareas de <span class="task-tag task-tag-course" style="font-size:0.9rem; padding:4px 8px; border-radius:6px; vertical-align:middle;">📚 ${selectedCourse.code}</span>`;
            }
            if (clearFilterContainer) {
                clearFilterContainer.style.display = 'inline-flex';
                clearFilterContainer.innerHTML = `<button class="clear-filter-btn" id="btn-clear-task-filter">Ver calendario 🗓️</button>`;
                
                document.getElementById('btn-clear-task-filter').addEventListener('click', () => {
                    filterMode = 'DATE';
                    render();
                });
            }
        }

        container.innerHTML = '';

        if (filteredTasks.length === 0) {
            container.innerHTML = `
                <div class="empty-tasks">
                    ✨ ¡Súper! No hay tareas pendientes registradas.
                </div>
            `;
            return;
        }

        // Sort tasks: Incomplete first, then completed. Then by due date.
        filteredTasks.sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            return a.due_date.localeCompare(b.due_date);
        });

        filteredTasks.forEach(task => {
            const item = document.createElement('div');
            item.className = `task-item ${task.completed ? 'completed' : ''}`;
            item.setAttribute('data-id', task.id);

            // Resolve Course details for tags
            const course = coursesList.find(c => c.id === task.course_id);
            const courseTagHTML = course 
                ? `<span class="task-tag task-tag-course">📚 ${course.code}</span>` 
                : '';

            const dateTagHTML = `<span class="task-tag task-tag-date">📅 ${formatDayMonth(task.due_date)}</span>`;

            item.innerHTML = `
                <div class="task-left">
                    <label class="custom-checkbox-container">
                        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                        <span class="checkbox-checkmark"></span>
                    </label>
                    <div style="display: flex; flex-direction: column;">
                        <span class="task-title">${task.title}</span>
                        <div class="task-meta">
                            ${courseTagHTML}
                            ${dateTagHTML}
                        </div>
                    </div>
                </div>
                <button class="task-delete-btn" title="Eliminar tarea">✕</button>
            `;

            // Bind checkbox interaction
            const checkbox = item.querySelector('.task-checkbox');
            checkbox.addEventListener('change', (e) => {
                handleTaskToggle(task.id, e.target.checked);
            });

            // Bind delete button interaction
            const deleteBtn = item.querySelector('.task-delete-btn');
            deleteBtn.addEventListener('click', () => {
                handleTaskDelete(task.id);
            });

            container.appendChild(item);
        });
    };

    return {
        init,
        updateData,
        setDateFilter,
        setCourseFilter,
        render
    };
})();
