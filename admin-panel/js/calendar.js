import { loadRecords } from './main.js';

let calA = new Calendar({
    id: "#calendar-a",
    theme: "glass",
    weekdayType: "long-upper",
    monthDisplayType: "long",
    headerColor: "black",
    headerBackgroundColor: "white",
    calendarSize: "medium",
    layoutModifiers: ["month-left-align"],
    eventsData: [],

    
    dateChanged: (currentDate, events) => {
        if (currentDate instanceof Date && !isNaN(currentDate)) {
            const selectedDate = new Date(currentDate.getTime() - currentDate.getTimezoneOffset() * 60000)
                .toISOString()
                .split('T')[0];
            console.log("Выбрана дата в календаре:", selectedDate);
            loadRecords(selectedDate); 
        } else {
            console.error("Invalid date value:", currentDate);
        }
    },
    monthChanged: (currentDate, events) => {
        console.log("Изменен месяц", currentDate, events);
    }
});

