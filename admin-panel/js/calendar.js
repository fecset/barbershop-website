import { loadRecords, state } from './main.js';
import { generateScheduleBody } from './main.js';

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
            state.selectedDate = new Date(currentDate.getTime() - currentDate.getTimezoneOffset() * 60000)
                .toISOString()
                .split('T')[0]; 

            console.log("Выбрана дата в календаре:", state.selectedDate);

            
            document.getElementById('scheduleBody').innerHTML = '';  

            
            const masters = JSON.parse(localStorage.getItem('masters')) || [];
            const filteredMasters = masters.filter(master => master.специализация !== 'Уборка');
            
            
            generateScheduleBody(filteredMasters);

            
            loadRecords(state.selectedDate); 
        } else {
            console.error("Invalid date value:", currentDate);
        }
    },
    monthChanged: (currentDate, events) => {
        console.log("Изменен месяц", currentDate, events);
    }
});
