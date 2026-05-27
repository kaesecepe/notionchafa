/* 🌸 COZY ACADEMIC DASHBOARD - MAIN CONTROLLER 🌸
   Orchestrates global application state, event wiring, modals, and data synchronization. */

const app = (() => {
    // Global State Cache
    let courses = [];
    let tasks = [];

    const init = async () => {
        setupGlobalEventListeners();
        setupSettingsPanel();
        
        // 1. Initialize Sub-Modules
        
        // When a day in the weekly calendar is clicked
        weeklyCalendar.init((selectedDateStr) => {
            scheduleTimetable.setActiveDate(selectedDateStr);
            taskManager.setDateFilter(selectedDateStr);
        });

        // When class card in schedule is clicked -> filter tasks by this course
        scheduleTimetable.init((course) => {
            taskManager.setCourseFilter(course);
        });

        // When a course is clicked in the gallery -> filter tasks by this course
        // (Note: opening the details/notes modal is handled internally inside courses.js)
        courseGallery.init(
            async () => {
                // Callback: When courses are created, edited or deleted
                await reloadData();
            },
            (course) => {
                // Callback: When a course is selected from gallery
                taskManager.setCourseFilter(course);
            }
        );

        // When tasks are updated (added, toggled completion, deleted)
        taskManager.init(async () => {
            await reloadData();
        });

        // 2. Fetch and render initial data
        await reloadData();
        
        // Align schedule & tasks to the default selected date (today)
        const initialDate = weeklyCalendar.getSelectedDate();
        scheduleTimetable.setActiveDate(initialDate);
        taskManager.setDateFilter(initialDate);

        console.log("🌸 Cozy Academic Dashboard initialized successfully!");
    };

    // Load data from DB (Supabase/LocalStorage) and distribute to modules
    const reloadData = async () => {
        try {
            courses = await db.getCourses();
            tasks = await db.getTasks();

            // Feed updated data to relevant views
            scheduleTimetable.updateCoursesData(courses);
            taskManager.updateData(tasks, courses);
            courseGallery.updateData(courses, tasks);
        } catch (err) {
            console.error("🌸 Error reloading dashboard data:", err);
        }
    };

    const setupGlobalEventListeners = () => {
        // Week Navigation Click Listeners
        document.getElementById('btn-prev-week').addEventListener('click', () => {
            weeklyCalendar.navigateWeek(-1);
        });
        document.getElementById('btn-next-week').addEventListener('click', () => {
            weeklyCalendar.navigateWeek(1);
        });
        document.getElementById('btn-today').addEventListener('click', () => {
            const todayStr = db.formatDateKey(new Date());
            weeklyCalendar.setSelectedDate(todayStr);
        });

        // Close Modals buttons (bind generic closes)
        document.getElementById('btn-close-add-course').addEventListener('click', () => {
            courseGallery.closeAddCourseModal();
        });
        document.getElementById('btn-cancel-add-course').addEventListener('click', () => {
            courseGallery.closeAddCourseModal();
        });
        document.getElementById('btn-close-course-details').addEventListener('click', () => {
            courseGallery.closeCourseDetailsModal();
        });
        document.getElementById('btn-close-notes').addEventListener('click', () => {
            courseGallery.closeCourseDetailsModal();
        });

        // Escape Key close modals
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeAllModals();
            }
        });

        // Overlay backdrop click closes modals
        const overlays = document.querySelectorAll('.modal-overlay');
        overlays.forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    closeAllModals();
                }
            });
        });
    };

    const closeAllModals = () => {
        const activeOverlays = document.querySelectorAll('.modal-overlay.active');
        activeOverlays.forEach(overlay => overlay.classList.remove('active'));
        
        // Reset forms quietly
        const addCourseForm = document.getElementById('add-course-form');
        if (addCourseForm) addCourseForm.reset();
    };

    /* ==========================================================================
       SETTINGS & DATABASE CONFIGURATION PANEL
       ========================================================================== */
    const setupSettingsPanel = () => {
        const btnToggle = document.getElementById('btn-settings-toggle');
        const modal = document.getElementById('settings-modal');
        const btnClose = document.getElementById('btn-close-settings');
        const btnCancel = document.getElementById('btn-cancel-settings');
        const form = document.getElementById('settings-form');
        const btnDisconnect = document.getElementById('btn-disconnect-db');

        const inputUrl = document.getElementById('settings-db-url');
        const inputKey = document.getElementById('settings-db-key');

        const openSettings = () => {
            const status = db.status();
            
            // Populate Inputs
            inputUrl.value = status.url || '';
            inputKey.value = status.url ? '••••••••••••••••••••••••••••••••••••' : ''; // Mask key if present

            updateSettingsBadge(status);
            modal.classList.add('active');
        };

        const closeSettings = () => {
            modal.classList.remove('active');
            form.reset();
        };

        btnToggle.addEventListener('click', openSettings);
        btnClose.addEventListener('click', closeSettings);
        btnCancel.addEventListener('click', closeSettings);

        // Submit Settings Form
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const url = inputUrl.value.trim();
            let key = inputKey.value.trim();

            if (!url || !key) {
                alert("Por favor, rellene todos los campos.");
                return;
            }

            // If key is masked representation, do not update the key value
            if (key.includes('•••')) {
                const currentStatus = db.status();
                key = localStorage.getItem('COZY_SUPABASE_ANON_KEY') || '';
            }

            // Save and Initialize
            const success = db.saveCredentials(url, key);
            
            if (success) {
                alert("🌸 ¡Conectado con éxito a tu base de datos Supabase!");
                closeSettings();
                await reloadData();
            } else {
                alert("❌ Falló la conexión. Verifica tu URL y Anon Key e inténtalo de nuevo.");
                updateSettingsBadge(db.status());
            }
        });

        // Disconnect DB
        btnDisconnect.addEventListener('click', async () => {
            const confirmDisconnect = confirm("¿Estás seguro de que deseas desconectar Supabase?\nTu panel volverá a guardar los datos en LocalStorage (Offline). No perderás tus apuntes locales.");
            if (!confirmDisconnect) return;

            db.saveCredentials(null, null); // Clear
            closeSettings();
            await reloadData();
            
            alert("🌸 Has vuelto a la base de datos local.");
        });
    };

    const updateSettingsBadge = (status) => {
        const badge = document.getElementById('db-status-badge');
        if (!badge) return;

        if (status.supabase) {
            badge.innerHTML = `✅ Sincronizado en la Nube (Supabase)`;
            badge.style.backgroundColor = 'hsl(140, 50%, 94%)';
            badge.style.borderColor = 'hsl(140, 35%, 86%)';
            badge.style.color = 'hsl(140, 40%, 30%)';
            document.getElementById('btn-disconnect-db').style.display = 'block';
        } else {
            badge.innerHTML = `🌸 Guardado Localmente (Offline Mode)`;
            badge.style.backgroundColor = 'hsl(350, 70%, 95%)';
            badge.style.borderColor = 'hsl(350, 50%, 88%)';
            badge.style.color = 'hsl(350, 50%, 35%)';
            document.getElementById('btn-disconnect-db').style.display = 'none';
        }
    };

    return {
        init
    };
})();

// Trigger Dashboard Load
window.addEventListener('DOMContentLoaded', () => {
    app.init();
});
