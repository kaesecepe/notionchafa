/* 🌸 COZY ACADEMIC DASHBOARD - COURSE GALLERY MODULE 🌸
   Manages the course cards grid, dynamic badges, course notes editor, and course creation modal. */

const courseGallery = (() => {
    let coursesList = [];
    let tasksList = [];
    let selectedCourse = null; // Stored when viewing a course's notes

    let onCourseChangeCallback = null;
    let onCourseSelectFilterCallback = null;

    const init = (onCourseChange, onCourseSelectFilter) => {
        onCourseChangeCallback = onCourseChange;
        onCourseSelectFilterCallback = onCourseSelectFilter;
        
        setupEventListeners();
        
        // Listen to background task updates from the task manager to keep badges in sync!
        window.addEventListener('tasksUpdated', (e) => {
            tasksList = e.detail.tasks;
            render();
        });
    };

    const setupEventListeners = () => {
        // Add Course Trigger
        const btnAddCourse = document.getElementById('add-course-card-trigger');
        if (btnAddCourse) {
            btnAddCourse.addEventListener('click', openAddCourseModal);
        }

        // Add Course Form Submit
        const formAddCourse = document.getElementById('add-course-form');
        if (formAddCourse) {
            formAddCourse.addEventListener('submit', handleAddCourse);
        }

        // Save Course Notes Trigger
        const btnSaveNotes = document.getElementById('btn-save-course-notes');
        if (btnSaveNotes) {
            btnSaveNotes.addEventListener('click', handleSaveNotes);
        }

        // Delete Course Trigger
        const btnDeleteCourse = document.getElementById('btn-delete-course');
        if (btnDeleteCourse) {
            btnDeleteCourse.addEventListener('click', handleDeleteCourse);
        }
    };

    const updateData = (courses, tasks) => {
        coursesList = courses;
        tasksList = tasks;
        render();
    };

    // Modal Helpers
    const openAddCourseModal = () => {
        const modal = document.getElementById('add-course-modal');
        if (modal) modal.classList.add('active');
    };

    const closeAddCourseModal = () => {
        const modal = document.getElementById('add-course-modal');
        if (modal) modal.classList.remove('active');
        document.getElementById('add-course-form').reset();
    };

    const openCourseDetailsModal = (course) => {
        selectedCourse = course;
        const modal = document.getElementById('course-details-modal');
        if (!modal) return;

        // Populate Modal Fields
        document.getElementById('details-title').innerHTML = `📚 ${course.code} - ${course.name}`;
        
        const DAYS = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        const dayName = DAYS[parseInt(course.day_of_week)] || 'Día indefinido';
        
        document.getElementById('details-schedule').innerText = `🗓️ ${dayName} • ⏰ ${course.time_start} - ${course.time_end}`;
        document.getElementById('details-prof').innerText = course.professor ? `👩‍🏫 ${course.professor}` : '👩‍🏫 Sin profesor asignado';
        document.getElementById('details-room').innerText = course.classroom ? `📍 ${course.classroom}` : '📍 Sin aula asignada';
        
        const textarea = document.getElementById('details-notes');
        textarea.value = course.notes || '';

        modal.classList.add('active');
    };

    const closeCourseDetailsModal = () => {
        const modal = document.getElementById('course-details-modal');
        if (modal) modal.classList.remove('active');
        selectedCourse = null;
    };

    // Form Submissions & Actions

    const handleAddCourse = async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('course-name-input').value.trim();
        const code = document.getElementById('course-code-input').value.trim();
        const day_of_week = parseInt(document.getElementById('course-day-select').value);
        const time_start = document.getElementById('course-start-time').value;
        const time_end = document.getElementById('course-end-time').value;
        const professor = document.getElementById('course-prof-input').value.trim();
        const classroom = document.getElementById('course-room-input').value.trim();
        
        // Find checked color
        const checkedColorRadio = document.querySelector('input[name="course-color"]:checked');
        const color = checkedColorRadio ? checkedColorRadio.value : 'pink';

        if (!name || !code || !day_of_week || !time_start || !time_end) return;

        const newCoursePayload = {
            name,
            code,
            day_of_week,
            time_start,
            time_end,
            professor,
            classroom,
            color,
            notes: `💡 Notas para ${name}.\n✍️ Escribe tus apuntes, tareas importantes o fechas de exámenes aquí.`
        };

        try {
            await db.addCourse(newCoursePayload);
            closeAddCourseModal();
            if (onCourseChangeCallback) {
                await onCourseChangeCallback();
            }
        } catch (err) {
            console.error("🌸 Error adding course:", err);
            alert("Hubo un error al guardar el curso.");
        }
    };

    const handleSaveNotes = async () => {
        if (!selectedCourse) return;
        const textarea = document.getElementById('details-notes');
        const notes = textarea.value;

        // Apply dynamic scale animation to save button for sweet tactile confirmation!
        const saveBtn = document.getElementById('btn-save-course-notes');
        saveBtn.innerHTML = '✨ ¡Guardado!';
        saveBtn.style.background = 'hsl(140, 50%, 80%)';
        saveBtn.style.color = 'hsl(140, 40%, 30%)';

        try {
            await db.updateCourseNotes(selectedCourse.id, notes);
            
            // Refresh local object quietly
            selectedCourse.notes = notes;
            const idx = coursesList.findIndex(c => c.id === selectedCourse.id);
            if (idx !== -1) coursesList[idx].notes = notes;

            setTimeout(() => {
                saveBtn.innerHTML = 'Guardar Notas 🌸';
                saveBtn.style.background = '';
                saveBtn.style.color = '';
            }, 1500);

        } catch (err) {
            console.error("🌸 Error saving notes:", err);
            alert("Error al guardar las notas.");
            saveBtn.innerHTML = 'Guardar Notas 🌸';
        }
    };

    const handleDeleteCourse = async () => {
        if (!selectedCourse) return;
        const confirmDelete = confirm(`¿Estás seguro de que deseas eliminar el curso "${selectedCourse.name}"?\nEsta acción también borrará todas sus tareas asociadas.`);
        if (!confirmDelete) return;

        try {
            await db.deleteCourse(selectedCourse.id);
            closeCourseDetailsModal();
            if (onCourseChangeCallback) {
                await onCourseChangeCallback();
            }
        } catch (err) {
            console.error("🌸 Error deleting course:", err);
            alert("Error al eliminar el curso.");
        }
    };

    const render = () => {
        const grid = document.getElementById('gallery-grid');
        if (!grid) return;

        // Keep the "+ Agregar Curso" block
        grid.innerHTML = `
            <div class="add-course-card" id="add-course-card-trigger">
                <span class="add-course-icon">🌸</span>
                <span class="add-course-text">+ Agregar Curso</span>
            </div>
        `;

        // Rebind click to the newly created button
        document.getElementById('add-course-card-trigger').addEventListener('click', openAddCourseModal);

        // Sort courses alphabetically by code
        const sortedCourses = [...coursesList].sort((a, b) => a.code.localeCompare(b.code));

        sortedCourses.forEach(course => {
            const card = document.createElement('div');
            card.className = `course-card ${course.color || 'pink'}`;
            card.setAttribute('data-id', course.id);

            // Count pending (incomplete) tasks for this course
            const pendingTasksCount = tasksList.filter(t => t.course_id === course.id && !t.completed).length;
            const badgeText = pendingTasksCount === 1 ? '1 pendiente' : `${pendingTasksCount} pendientes`;
            const badgeIcon = pendingTasksCount > 0 ? '✍️' : '✨';

            card.innerHTML = `
                <div class="course-card-top">
                    <span class="course-code">${course.code}</span>
                    <span class="course-name">${course.name}</span>
                </div>
                <div class="course-card-bottom">
                    <span class="course-tasks-count">${badgeIcon} ${badgeText}</span>
                    <span class="course-card-color-dot"></span>
                </div>
            `;

            // Double Click or click interactions
            // Single click opens details modal and lets you write notes + filters the task list!
            card.addEventListener('click', () => {
                openCourseDetailsModal(course);
                if (onCourseSelectFilterCallback) {
                    onCourseSelectFilterCallback(course);
                }
            });

            // Insert before the "+ Agregar" card
            grid.insertBefore(card, grid.lastElementChild);
        });
    };

    return {
        init,
        updateData,
        closeAddCourseModal,
        closeCourseDetailsModal,
        render
    };
})();
