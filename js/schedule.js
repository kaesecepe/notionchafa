/* 🌸 COZY ACADEMIC DASHBOARD - SCHEDULE MODULE 🌸
   Renders the daily university courses schedule based on the active day.
   Applies automatic color-coding based on the day of the week. */

const scheduleTimetable = (() => {
    let coursesList = [];
    let activeDayOfWeek = 1; // 1 (Mon) to 7 (Sun)
    let onCourseSelectCallback = null;

    const DAY_CODES = {
        1: 'LUN',
        2: 'MAR',
        3: 'MIÉ',
        4: 'JUE',
        5: 'VIE',
        6: 'SÁB',
        7: 'DOM'
    };

    // Maps day number to aesthetic pastel color classes in CSS
    const DAY_COLOR_MAP = {
        1: 'pink',      // Mondays
        2: 'peach',     // Tuesdays
        3: 'mint',      // Wednesdays
        4: 'yellow',    // Thursdays
        5: 'lavender',  // Fridays
        6: 'purple',    // Saturdays
        7: 'gray'       // Sundays
    };

    const init = (onCourseSelect) => {
        onCourseSelectCallback = onCourseSelect;
    };

    // Sets the active day based on selected date (YYYY-MM-DD)
    const setActiveDate = (dateStr) => {
        const dateObj = new Date(dateStr + "T00:00:00");
        let dayNum = dateObj.getDay(); // 0 is Sun, 1 is Mon...
        activeDayOfWeek = dayNum === 0 ? 7 : dayNum; // Map Sunday to 7
        render();
    };

    // Formats 24h string "07:30" to "07:30 am" or "14:15" to "02:15 pm"
    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [hoursStr, minutesStr] = timeStr.split(':');
        let hours = parseInt(hoursStr);
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const minutes = minutesStr.padStart(2, '0');
        const hrFormatted = String(hours).padStart(2, '0');
        return `${hrFormatted}:${minutes} ${ampm}`;
    };

    const updateCoursesData = (courses) => {
        coursesList = courses;
        render();
    };

    const render = () => {
        const container = document.getElementById('schedule-container');
        if (!container) return;

        // Filter courses for active day
        const dayCourses = coursesList.filter(c => parseInt(c.day_of_week) === activeDayOfWeek);

        // Sort by start time
        dayCourses.sort((a, b) => a.time_start.localeCompare(b.time_start));

        container.innerHTML = '';

        if (dayCourses.length === 0) {
            container.innerHTML = `
                <div class="empty-schedule">
                    🌸 ¡Día libre! Disfruta tu jornada sin clases asignadas.
                </div>
            `;
            return;
        }

        dayCourses.forEach(course => {
            const card = document.createElement('div');
            
            // Resolve pastel color class (prioritize day of week color code, fallback to stored color)
            const pastelColor = DAY_COLOR_MAP[activeDayOfWeek] || course.color || 'pink';
            card.className = `course-schedule-card course-card-${pastelColor}`;
            card.setAttribute('data-id', course.id);

            const dayCode = DAY_CODES[activeDayOfWeek] || 'DÍA';
            const formattedStart = formatTime(course.time_start);
            const formattedEnd = formatTime(course.time_end);

            card.innerHTML = `
                <div class="course-schedule-info">
                    <span class="course-schedule-name">${course.name}</span>
                    <div class="course-schedule-meta">
                        <span class="course-schedule-time">⏰ ${formattedStart} - ${formattedEnd}</span>
                        ${course.classroom ? `<span>• 📍 ${course.classroom}</span>` : ''}
                    </div>
                </div>
                <span class="course-day-tag">${dayCode}</span>
            `;

            // Click listener: Shift filter focus in Task Manager to this course!
            card.addEventListener('click', () => {
                if (onCourseSelectCallback) {
                    onCourseSelectCallback(course);
                }
            });

            container.appendChild(card);
        });
    };

    return {
        init,
        setActiveDate,
        updateCoursesData,
        render
    };
})();
