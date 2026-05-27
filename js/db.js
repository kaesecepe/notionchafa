/* 🌸 COZY ACADEMIC DASHBOARD - DATABASE MANAGER 🌸
   Dual-Mode Engine: Seamlessly connects to Supabase or falls back to LocalStorage.
   Pre-seeds beautiful mock data dynamically relative to "today" for instant demonstration. */

const db = (() => {
    let supabaseClient = null;
    let isSupabaseActive = false;

    // Helper: Get credentials from LocalStorage
    const getSupabaseCredentials = () => {
        const url = localStorage.getItem('COZY_SUPABASE_URL');
        const key = localStorage.getItem('COZY_SUPABASE_ANON_KEY');
        return url && key ? { url, key } : null;
    };

    // Initialize Connection
    const init = () => {
        const credentials = getSupabaseCredentials();
        if (credentials && window.supabase) {
            try {
                supabaseClient = window.supabase.createClient(credentials.url, credentials.key);
                isSupabaseActive = true;
                console.log("🌸 Connected successfully to Supabase Cloud Database!");
            } catch (err) {
                console.error("🌸 Supabase initialization failed, falling back to LocalStorage:", err);
                isSupabaseActive = false;
            }
        } else {
            console.log("🌸 Running in LocalStorage fallback mode (no Supabase config found).");
            isSupabaseActive = false;
            seedMockDataIfEmpty();
        }
    };

    // Save Supabase Configuration in-app
    const saveCredentials = (url, key) => {
        if (!url || !key) {
            localStorage.removeItem('COZY_SUPABASE_URL');
            localStorage.removeItem('COZY_SUPABASE_ANON_KEY');
        } else {
            localStorage.setItem('COZY_SUPABASE_URL', url.trim());
            localStorage.setItem('COZY_SUPABASE_ANON_KEY', key.trim());
        }
        init();
        return isSupabaseActive;
    };

    // Get Active Status
    const status = () => ({
        supabase: isSupabaseActive,
        url: localStorage.getItem('COZY_SUPABASE_URL') || ''
    });

    /* ==========================================================================
       MOCK DATA & LOCAL STORAGE ENGINE
       ========================================================================== */

    // Formats a Date object to YYYY-MM-DD local string
    const formatDateKey = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getOffsetDateString = (offsetDays) => {
        const d = new Date();
        d.setDate(d.getDate() + offsetDays);
        return formatDateKey(d);
    };

    const seedMockDataIfEmpty = () => {
        if (!localStorage.getItem('COZY_COURSES')) {
            // Seed Mock Courses
            const mockCourses = [
                {
                    id: 'course-cálculo',
                    name: 'Cálculo Diferencial',
                    code: 'MAT-102',
                    color: 'pink',
                    day_of_week: 1, // Lunes
                    time_start: '07:30',
                    time_end: '09:00',
                    professor: 'Prof. Carlos Ruíz',
                    classroom: 'Aula B2',
                    notes: '📚 Temas clave: Límites, Derivadas e Integrales básicas.\n⭐ Exámenes parciales valen 60%.\n💡 Entregar portafolio los viernes.'
                },
                {
                    id: 'course-historia',
                    name: 'Historia Universal',
                    code: 'HIS-105',
                    color: 'peach',
                    day_of_week: 2, // Martes
                    time_start: '09:30',
                    time_end: '11:00',
                    professor: 'Dra. María Sánchez',
                    classroom: 'Aula C3',
                    notes: '📖 Lecturas semanales obligatorias en PDF.\n📌 Investigar sobre la Revolución Industrial.\n💬 Participación activa suma 10%.'
                },
                {
                    id: 'course-web',
                    name: 'Desarrollo Web',
                    code: 'WEB-301',
                    color: 'mint',
                    day_of_week: 3, // Miércoles
                    time_start: '09:30',
                    time_end: '11:00',
                    professor: 'Prof. Ana Flores',
                    classroom: 'Lab 4',
                    notes: '🌸 Creando un dashboard súper lindo con Supabase.\n📂 Proyecto final: Portafolio responsivo. Vale 40%.'
                },
                {
                    id: 'course-quimica',
                    name: 'Química Orgánica',
                    code: 'QUI-202',
                    color: 'yellow',
                    day_of_week: 4, // Jueves
                    time_start: '11:30',
                    time_end: '13:00',
                    professor: 'Dr. Roberto Gómez',
                    classroom: 'Lab Química',
                    notes: '🧪 Recordar batas y lentes de seguridad para las prácticas.\n📝 Reportes de laboratorio se entregan los lunes.'
                },
                {
                    id: 'course-uiux',
                    name: 'Diseño UI/UX',
                    code: 'UIX-204',
                    color: 'lavender',
                    day_of_week: 5, // Viernes
                    time_start: '11:30',
                    time_end: '13:00',
                    professor: 'Prof. Sofia Reyes',
                    classroom: 'Aula Virtual C1',
                    notes: '🎨 Herramientas: Figma, Notion, Miro.\n✨ Enfoque en diseño minimalista, paletas pastel y micro-interacciones.'
                }
            ];
            localStorage.setItem('COZY_COURSES', JSON.stringify(mockCourses));
        }

        if (!localStorage.getItem('COZY_TASKS')) {
            // Seed Mock Tasks relative to current local date so dashboard looks alive!
            const mockTasks = [
                {
                    id: 'task-1',
                    course_id: 'course-cálculo',
                    title: 'Resolver ejercicios de límites continuos (Pág 45)',
                    due_date: getOffsetDateString(0), // Today!
                    completed: false
                },
                {
                    id: 'task-2',
                    course_id: 'course-web',
                    title: 'Maquetar Notion Grid y crear estilos en CSS',
                    due_date: getOffsetDateString(0), // Today!
                    completed: true
                },
                {
                    id: 'task-3',
                    course_id: 'course-historia',
                    title: 'Leer capítulo 4: "La Era de las Revoluciones"',
                    due_date: getOffsetDateString(1), // Tomorrow!
                    completed: false
                },
                {
                    id: 'task-4',
                    course_id: 'course-web',
                    title: 'Integrar base de datos con Supabase y db.js',
                    due_date: getOffsetDateString(2), // In 2 Days!
                    completed: false
                },
                {
                    id: 'task-5',
                    course_id: 'course-uiux',
                    title: 'Crear prototipo de alta fidelidad en Figma',
                    due_date: getOffsetDateString(4), // In 4 Days!
                    completed: false
                }
            ];
            localStorage.setItem('COZY_TASKS', JSON.stringify(mockTasks));
        }
    };

    const getLocalData = (key) => JSON.parse(localStorage.getItem(key)) || [];
    const saveLocalData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

    /* ==========================================================================
       PUBLIC API METHODS (SELECT, INSERT, UPDATE, DELETE) WITH DUAL-MODE
       ========================================================================== */

    // --- COURSES ---
    
    const getCourses = async () => {
        if (isSupabaseActive) {
            const { data, error } = await supabaseClient
                .from('courses')
                .select('*')
                .order('time_start', { ascending: true });
            if (error) {
                console.error("Supabase SELECT courses error:", error);
                throw error;
            }
            return data;
        } else {
            return getLocalData('COZY_COURSES');
        }
    };

    const addCourse = async (course) => {
        if (isSupabaseActive) {
            const { data, error } = await supabaseClient
                .from('courses')
                .insert([course])
                .select();
            if (error) throw error;
            return data[0];
        } else {
            const courses = getLocalData('COZY_COURSES');
            const newCourse = {
                id: 'course-' + Date.now(),
                ...course
            };
            courses.push(newCourse);
            saveLocalData('COZY_COURSES', courses);
            return newCourse;
        }
    };

    const updateCourseNotes = async (courseId, notes) => {
        if (isSupabaseActive) {
            const { data, error } = await supabaseClient
                .from('courses')
                .update({ notes })
                .eq('id', courseId)
                .select();
            if (error) throw error;
            return data[0];
        } else {
            const courses = getLocalData('COZY_COURSES');
            const idx = courses.findIndex(c => c.id === courseId);
            if (idx !== -1) {
                courses[idx].notes = notes;
                saveLocalData('COZY_COURSES', courses);
                return courses[idx];
            }
            return null;
        }
    };

    const deleteCourse = async (courseId) => {
        if (isSupabaseActive) {
            const { error } = await supabaseClient
                .from('courses')
                .delete()
                .eq('id', courseId);
            if (error) throw error;
            // Cascading tasks delete is handled by Supabase schema "ON DELETE CASCADE".
            return true;
        } else {
            // Delete Course
            let courses = getLocalData('COZY_COURSES');
            courses = courses.filter(c => c.id !== courseId);
            saveLocalData('COZY_COURSES', courses);

            // Cascade tasks delete in localStorage
            let tasks = getLocalData('COZY_TASKS');
            tasks = tasks.filter(t => t.course_id !== courseId);
            saveLocalData('COZY_TASKS', tasks);
            return true;
        }
    };

    // --- TASKS ---

    const getTasks = async () => {
        if (isSupabaseActive) {
            const { data, error } = await supabaseClient
                .from('tasks')
                .select('*')
                .order('due_date', { ascending: true });
            if (error) {
                console.error("Supabase SELECT tasks error:", error);
                throw error;
            }
            return data;
        } else {
            return getLocalData('COZY_TASKS');
        }
    };

    const addTask = async (task) => {
        if (isSupabaseActive) {
            const { data, error } = await supabaseClient
                .from('tasks')
                .insert([task])
                .select();
            if (error) throw error;
            return data[0];
        } else {
            const tasks = getLocalData('COZY_TASKS');
            const newTask = {
                id: 'task-' + Date.now(),
                completed: false,
                ...task
            };
            tasks.push(newTask);
            saveLocalData('COZY_TASKS', tasks);
            return newTask;
        }
    };

    const toggleTask = async (taskId, completed) => {
        if (isSupabaseActive) {
            const { data, error } = await supabaseClient
                .from('tasks')
                .update({ completed })
                .eq('id', taskId)
                .select();
            if (error) throw error;
            return data[0];
        } else {
            const tasks = getLocalData('COZY_TASKS');
            const idx = tasks.findIndex(t => t.id === taskId);
            if (idx !== -1) {
                tasks[idx].completed = completed;
                saveLocalData('COZY_TASKS', tasks);
                return tasks[idx];
            }
            return null;
        }
    };

    const deleteTask = async (taskId) => {
        if (isSupabaseActive) {
            const { error } = await supabaseClient
                .from('tasks')
                .delete()
                .eq('id', taskId);
            if (error) throw error;
            return true;
        } else {
            let tasks = getLocalData('COZY_TASKS');
            tasks = tasks.filter(t => t.id !== taskId);
            saveLocalData('COZY_TASKS', tasks);
            return true;
        }
    };

    // Trigger initialization immediately
    init();

    return {
        init,
        saveCredentials,
        status,
        getCourses,
        addCourse,
        updateCourseNotes,
        deleteCourse,
        getTasks,
        addTask,
        toggleTask,
        deleteTask,
        formatDateKey
    };
})();
