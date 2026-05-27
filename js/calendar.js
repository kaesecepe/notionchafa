/* 🌸 COZY ACADEMIC DASHBOARD - CALENDAR MODULE 🌸
   Manages the horizontal weekly card calendar, navigation, and day selection. */

const weeklyCalendar = (() => {
    let currentMonday = null; // The Date object representing the Monday of the currently viewed week
    let selectedDateStr = ""; // The YYYY-MM-DD string of the selected day
    let onDateSelectCallback = null;

    const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const MONTH_NAMES = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    // Helper: Get Monday of the week for a given Date
    const getMondayOf = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        // Adjust Sunday (0) to be 7, and Monday to be 1
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.setDate(diff));
        monday.setHours(0, 0, 0, 0);
        return monday;
    };

    const init = (callback) => {
        onDateSelectCallback = callback;
        const today = new Date();
        currentMonday = getMondayOf(today);
        selectedDateStr = db.formatDateKey(today); // Select today by default
        render();
    };

    const getSelectedDate = () => selectedDateStr;

    const setSelectedDate = (dateStr) => {
        selectedDateStr = dateStr;
        // Check if the selected date is within the currently viewed week, if not, jump the calendar
        const selDate = new Date(dateStr + "T00:00:00");
        const selMondayStr = db.formatDateKey(getMondayOf(selDate));
        const currentMondayStr = db.formatDateKey(currentMonday);
        
        if (selMondayStr !== currentMondayStr) {
            currentMonday = getMondayOf(selDate);
        }
        
        render();
        if (onDateSelectCallback) {
            onDateSelectCallback(selectedDateStr);
        }
    };

    const navigateWeek = (direction) => {
        // direction: 1 for next week, -1 for previous week
        const nextMon = new Date(currentMonday);
        nextMon.setDate(currentMonday.getDate() + (direction * 7));
        currentMonday = nextMon;
        render();
    };

    const render = () => {
        const today = new Date();
        const todayStr = db.formatDateKey(today);

        // Update Month/Year header
        // Use the middle of the week (Thursday) to decide which month to show if week straddles two months
        const midWeek = new Date(currentMonday);
        midWeek.setDate(currentMonday.getDate() + 3);
        const monthText = `${MONTH_NAMES[midWeek.getMonth()]} ${midWeek.getFullYear()}`;
        document.getElementById('current-month').innerText = monthText;

        const container = document.getElementById('week-cards-container');
        container.innerHTML = '';

        // Generate 7 days starting from current Monday
        for (let i = 0; i < 7; i++) {
            const dayDate = new Date(currentMonday);
            dayDate.setDate(currentMonday.getDate() + i);
            const dateStr = db.formatDateKey(dayDate);
            const dayNum = dayDate.getDate();
            const dayName = DAY_NAMES[i];
            
            // Lunes = 1, Domingo = 7 (matches our DB mapping)
            const dayOfWeekNum = i + 1; 

            const card = document.createElement('div');
            card.className = 'day-card';
            card.setAttribute('data-date', dateStr);
            card.setAttribute('data-day', dayOfWeekNum);

            // Highlights
            if (dateStr === todayStr) {
                card.classList.add('today');
            }
            if (dateStr === selectedDateStr) {
                card.classList.add('selected');
            }

            card.innerHTML = `
                <span class="day-name">${dayName}</span>
                <span class="day-number">${dayNum}</span>
            `;

            // Click listener
            card.addEventListener('click', () => {
                setSelectedDate(dateStr);
            });

            container.appendChild(card);
        }
    };

    return {
        init,
        getSelectedDate,
        setSelectedDate,
        navigateWeek,
        render
    };
})();
