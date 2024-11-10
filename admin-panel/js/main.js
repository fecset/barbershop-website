import { initTabSwitching } from './modules/tabs.js';
import { initMasters } from './modules/masters.js';
import { initServices } from './modules/services.js';
import { initRecords } from './modules/records.js';

if (localStorage.getItem('role') === 'Superadmin') {
    import('./modules/admin.js').then(module => {
        module.initAdmin();
    });
}

initTabSwitching();
initMasters();
initServices();
initRecords();

const icons = {
    home: {
        default: 'img/home.svg',
        active: 'img/home-active.svg'
    },
    services: {
        default: 'img/services.svg',
        active: 'img/services-active.svg'
    },
    masters: {
        default: 'img/masters.svg',
        active: 'img/masters-active.svg'
    },
    records: {
        default: 'img/records.svg',
        active: 'img/records-active.svg'
    },
    admin: {
        default: 'img/admin.svg',
        active: 'img/admin-active.svg'
    }
};

const links = document.querySelectorAll('.sidebar__link');

function resetIcons() {
    links.forEach(otherLink => {
        const iconKey = otherLink.getAttribute('data-icon');
        const img = otherLink.querySelector('.sidebar__icon');

        if (icons[iconKey]) {
            otherLink.classList.remove('sidebar__link--active');
            img.src = icons[iconKey].default;
        }
    });
}

links.forEach(link => {
    link.addEventListener('click', function (event) {
        event.preventDefault();

        resetIcons();

        const iconKey = this.getAttribute('data-icon');
        const img = this.querySelector('.sidebar__icon');

        if (icons[iconKey]) {
            this.classList.add('sidebar__link--active');
            img.src = icons[iconKey].active;
        }
    });

    link.addEventListener('mouseenter', function () {
        const iconKey = this.getAttribute('data-icon');
        const img = this.querySelector('.sidebar__icon');

        if (icons[iconKey] && !this.classList.contains('sidebar__link--active')) {
            img.src = icons[iconKey].active;
        }
    });

    link.addEventListener('mouseleave', function () {
        const iconKey = this.getAttribute('data-icon');
        const img = this.querySelector('.sidebar__icon');

        if (icons[iconKey] && !this.classList.contains('sidebar__link--active')) {
            img.src = icons[iconKey].default;
        }
    });
});


const dropdownButton = document.getElementById('dropdownButton');
const dropdownMenu = document.getElementById('dropdownMenu');
const logoutLink = document.getElementById('logoutLink');

dropdownButton.addEventListener('click', function () {
    dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
});

document.addEventListener('click', function (event) {
    if (!dropdownButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
        dropdownMenu.style.display = 'none';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    
    const masters = JSON.parse(localStorage.getItem('masters')) || [];

    
    const mastersList = document.querySelector('.masters-list');

    
    mastersList.innerHTML = '';

    
    masters.forEach(master => {
        
        const listItem = document.createElement('li');
        listItem.textContent = `${master.имя} - ${master.график_работы}`;
        mastersList.appendChild(listItem);
    });
});

document.addEventListener('DOMContentLoaded', () => {

    const userData = JSON.parse(localStorage.getItem('currentUser'));

    if (userData) {

        document.querySelector('.sidebar__username').textContent = userData.name;
        document.querySelector('.sidebar__role').textContent = userData.role;


        document.querySelector('.header__login-text').textContent = userData.name;


        if (userData.role === 'Superadmin') {
            document.getElementById('adminTab').style.display = 'block';
        }
    } else {
        console.error('Данные пользователя не найдены');
    }

    logoutLink.addEventListener('click', function () {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('role');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('activeTab'); 
        window.location.href = 'auth.html'; 
    });

    const role = localStorage.getItem('role'); 

    
    if (role !== 'Superadmin') {
        const adminTab = document.getElementById('adminTab');
        if (adminTab) {
            adminTab.style.display = 'none';
        }
    }

    
    const activeTab = localStorage.getItem('activeTab') || 'home'; 
    showTab(activeTab);

});




document.addEventListener('DOMContentLoaded', initScheduleTable);

function initScheduleTable() {
    const masters = JSON.parse(localStorage.getItem('masters')).filter(master => master.специализация !== 'Уборка');
    generateScheduleHeader(masters);
    generateScheduleBody(masters);
    loadRecords();
}


function generateScheduleHeader(masters) {
    const mastersRow = document.getElementById('mastersRow');
    masters.forEach(master => {
        const th = document.createElement('th');
        th.textContent = master.имя;
        mastersRow.appendChild(th);
    });
}

function syncRecordsToClientSchedule() {
    const records = JSON.parse(localStorage.getItem('records')) || [];
    let clientScheduleRecords = JSON.parse(localStorage.getItem('clientScheduleRecords')) || [];

    records.forEach(record => {
        const formattedRecord = {
            master: record.мастер_имя || record.master,
            time: record.дата_время.split(" ")[1],
            client: record.клиент_имя || record.client,
            service: record.услуга_название || record.service,
            date: record.дата_время.split(" ")[0]
        };

        const exists = clientScheduleRecords.some(item =>
            item.master === formattedRecord.master &&
            item.date === formattedRecord.date &&
            item.time === formattedRecord.time &&
            item.client === formattedRecord.client &&
            item.service === formattedRecord.service
        );

        if (!exists) {
            clientScheduleRecords.push(formattedRecord);
        }
    });

    localStorage.setItem('clientScheduleRecords', JSON.stringify(clientScheduleRecords));
}



syncRecordsToClientSchedule();


function generateScheduleBody(masters) {
    const scheduleBody = document.getElementById('scheduleBody');
    const startTime = 9;
    const endTime = 19;
    const interval = 30;

    for (let hour = startTime; hour < endTime; hour++) {
        for (let minute = 0; minute < 60; minute += interval) {
            const row = document.createElement('tr');
            const timeCell = document.createElement('td');
            timeCell.classList.add('time-cell');
            const timeText = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
            timeCell.textContent = timeText;
            row.appendChild(timeCell);

            masters.forEach(master => {
                const cell = document.createElement('td');
                cell.classList.add('schedule-cell');
                cell.dataset.time = timeText;
                cell.dataset.master = master.имя;
                
                cell.addEventListener('click', () => handleCellClick(cell));

                row.appendChild(cell);
            });
            scheduleBody.appendChild(row);
        }
    }
}

const STORAGE_KEY = 'clientScheduleRecords';

function saveClientScheduleRecord(master, time, client, service, date, isEdit = false) {
    console.log("Сохранение записи для clientScheduleRecords:", { master, time, client, service, date });
    let clientScheduleRecords = JSON.parse(localStorage.getItem('clientScheduleRecords')) || [];

    if (isEdit) {
        
        clientScheduleRecords = clientScheduleRecords.map(record => {
            if (record.master === master && record.date === date && record.time === time) {
                
                return { ...record, client, service };
            }
            return record;
        });
    } else {
        
        clientScheduleRecords = clientScheduleRecords.filter(record => 
            !(record.master === master && record.time === time && record.date === date)
        );
        
        
        clientScheduleRecords.push({ master, time, client, service, date });
    }

    localStorage.setItem('clientScheduleRecords', JSON.stringify(clientScheduleRecords));
    loadRecords(date); 
}



export function loadRecords(selectedDate) {
    
    const dateToLoad = selectedDate || new Date().toISOString().split('T')[0];
    console.log("Загрузка записей для даты:", dateToLoad);

    const clientScheduleRecords = JSON.parse(localStorage.getItem('clientScheduleRecords')) || [];
    console.log("Все записи:", clientScheduleRecords);

    document.querySelectorAll('.schedule-cell').forEach(cell => {
        cell.textContent = '';
    });

    clientScheduleRecords.forEach(record => {
        console.log("Проверка записи:", record);
        
        const recordDate = record.date.split(' ')[0];
        
        if (recordDate === dateToLoad) {
            console.log("Запись совпадает с выбранной датой:", record);
            
            const recordTime = record.time;
            const cell = document.querySelector(`.schedule-cell[data-master="${record.master}"][data-time="${recordTime}"]`);
            if (cell) {
                cell.textContent = `${record.client} (${record.service})`;
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', loadRecords);

window.addEventListener('storage', (event) => {
    if (event.key === 'records') {
        loadRecords();
    }
});



const serviceSelect = document.getElementById('serviceSelect');
const otherServiceContainer = document.getElementById('otherServiceContainer');
const otherServiceInput = document.getElementById('otherServiceInput');
const deleteClientButton = document.getElementById('deleteClientButton');


serviceSelect.addEventListener('change', () => {
    if (serviceSelect.value === 'other') {
        otherServiceContainer.style.display = 'block';
        otherServiceInput.required = true;
    } else {
        otherServiceContainer.style.display = 'none';
        otherServiceInput.value = ''; 
        otherServiceInput.required = false;
    }
});


deleteClientButton.addEventListener('click', () => {
    if (selectedCell) {
        deleteRecord(selectedCell.dataset.master, selectedCell.dataset.time, new Date().toISOString().split("T")[0]);
        closeClientModal();
        loadRecords(); 
    }
});


function populateServiceSelect() {
    const services = JSON.parse(localStorage.getItem('services')) || [];
    
    
    serviceSelect.innerHTML = `
        <option value="" disabled selected>-- Выберите услугу --</option>
    `;

    
    services.forEach(service => {
        const option = document.createElement('option');
        option.value = service.услуга_id; 
        option.textContent = service.название; 
        serviceSelect.appendChild(option);
    });

    
    const otherOption = document.createElement('option');
    otherOption.value = 'other';
    otherOption.textContent = 'Другое';
    serviceSelect.appendChild(otherOption);
}


function deleteRecord(master, time, date) {
    console.log(`Удаление записи: мастер=${master}, время=${time}, дата=${date}`);

    
    let records = JSON.parse(localStorage.getItem('records')) || [];
    records = records.filter(record => {
        
        const recordDate = record.дата_время ? record.дата_время.split(" ")[0] : record.date;
        const recordTime = record.дата_время ? record.дата_время.split(" ")[1] : record.time;
        return !(record.мастер_имя === master && recordDate === date && recordTime === time);
    });
    localStorage.setItem('records', JSON.stringify(records));
    console.log("Удалено из records:", records);

    
    let clientScheduleRecords = JSON.parse(localStorage.getItem('clientScheduleRecords')) || [];
    clientScheduleRecords = clientScheduleRecords.filter(record => 
        !(record.master === master && record.date === date && record.time === time)
    );
    localStorage.setItem('clientScheduleRecords', JSON.stringify(clientScheduleRecords));
    console.log("Удалено из clientScheduleRecords:", clientScheduleRecords);

    loadRecords(date); 
}



function handleCellClick(cell) {
    openClientModal(cell);
}


const clientModal = document.getElementById('clientModal');
const clientNameInput = document.getElementById('clientNameInput');
const saveClientButton = document.getElementById('saveClientButton');
const errorMessage = document.getElementById('errorMessage');

let selectedCell = null;

function getRecordForCell(master, time) {
    const records = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    return records.find(record => record.master === master && record.time === time);
}

function openClientModal(cell) {
    selectedCell = cell;
    clientNameInput.value = '';
    serviceSelect.value = '';
    otherServiceContainer.style.display = 'none';
    otherServiceInput.value = '';

    populateServiceSelect();

    
    const existingRecord = getRecordForCell(cell.dataset.master, cell.dataset.time);
    if (existingRecord) {
        clientNameInput.value = existingRecord.client;
        serviceSelect.value = existingRecord.service === 'other' ? 'other' : existingRecord.service;
        if (existingRecord.service === 'other') {
            otherServiceContainer.style.display = 'block';
            otherServiceInput.value = existingRecord.customService;
        }
        deleteClientButton.style.display = 'inline-block'; 
    } else {
        deleteClientButton.style.display = 'none'; 
    }

    clientModal.style.display = 'flex';
    clientNameInput.focus();
}



function closeClientModal() {
    clientModal.style.display = 'none';
    selectedCell = null;
    errorMessage.style.display = 'none'; 
}


saveClientButton.addEventListener('click', () => {
    const clientName = clientNameInput.value.trim();
    const selectedService = serviceSelect.value === 'other' ? otherServiceInput.value.trim() : serviceSelect.options[serviceSelect.selectedIndex].text;

    if (clientName && selectedService && selectedCell) {
        
        const isEdit = !!getRecordForCell(selectedCell.dataset.master, selectedCell.dataset.time);

        saveClientScheduleRecord(
            selectedCell.dataset.master,
            selectedCell.dataset.time,
            clientName,
            selectedService,
            new Date().toISOString().split("T")[0],
            isEdit 
        );
        
        closeClientModal();
        errorMessage.style.display = 'none';
        
        loadRecords(new Date().toISOString().split("T")[0]); 
    } else {
        errorMessage.textContent = 'Введите имя клиента и выберите услугу.';
        errorMessage.style.display = 'block';
    }
});


clientNameInput.addEventListener('input', () => {
    
    clientNameInput.value = clientNameInput.value.replace(/[^a-zA-Zа-яА-Я\s]/g, '');

    
    if (/[^a-zA-Zа-яА-Я\s]/.test(clientNameInput.value)) {
        errorMessage.textContent = 'Имя может содержать только буквы и пробелы.';
        errorMessage.style.display = 'block';
    } else {
        errorMessage.style.display = 'none';
    }
});


window.addEventListener('click', (event) => {
    if (event.target === clientModal) {
        closeClientModal();
    }
});

window.loadRecords = loadRecords;
document.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; 

    
    loadRecords(todayString);
});