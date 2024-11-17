import { initTabSwitching } from './modules/tabs.js';
import { initMasters } from './modules/masters.js';
import { initServices } from './modules/services.js';
import { initRecords } from './modules/records.js';

export const state = {
    selectedDate: new Date().toISOString().split('T')[0], 
};

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
        
        
        listItem.addEventListener('click', () => {
            openRecordModal(master.имя);
        });

        mastersList.appendChild(listItem);
    });
});

function openRecordModal(masterName) {
    const recordModal = document.getElementById('recordModal');
    
    
    const masterNameElement = document.getElementById('mastersName');
    if (masterNameElement) {
        masterNameElement.textContent = masterName;
    }

    
    const records = getRecordsForMaster(masterName);

    
    const recordList = document.getElementById('recordList');
    recordList.innerHTML = ''; 

    if (records.length === 0) {
        
        const noRecordsMessage = document.createElement('li');
        noRecordsMessage.textContent = 'Записи отсутствуют';
        noRecordsMessage.style.color = '#999'; 
        noRecordsMessage.style.fontStyle = 'italic'; 
        recordList.appendChild(noRecordsMessage);
    } else {
        
        records.forEach((record, index) => {
            const recordItem = document.createElement('li');

            
            const recordNumber = document.createElement('span');
            recordNumber.className = 'record-number';
            recordNumber.textContent = index + 1; 

            
            const recordText = document.createElement('span');
            recordText.innerHTML = `<strong>Дата и время:</strong> ${record.дата_время}, <strong>Клиент:</strong> ${record.клиент_имя}, <strong>Услуга:</strong> ${record.услуга_название}`;

            
            recordItem.appendChild(recordNumber);
            recordItem.appendChild(recordText);
            
            recordList.appendChild(recordItem);
        });
    }

    
    recordModal.style.display = 'block';

    
    document.querySelector('.close-button').onclick = function() {
        recordModal.style.display = 'none';
    };

    
    window.onclick = function(event) {
        if (event.target === recordModal) {
            recordModal.style.display = 'none';
        }
    };
}

function getRecordsForMaster(masterName) {
    const records = JSON.parse(localStorage.getItem('records')) || [];
    
    return records.filter(record => record.мастер_имя === masterName);
}

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


export function generateScheduleBody(masters) {
    const scheduleBody = document.getElementById('scheduleBody');
    scheduleBody.innerHTML = '';
    const startTime = 9;
    const endTime = 19;
    const interval = 30;
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 30); 

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
                cell.dataset.date = state.selectedDate; 

                const cellDateTime = new Date(`${state.selectedDate}T${timeText}`);
                if (cellDateTime < today || cellDateTime > maxDate) {
                    cell.classList.add('disabled-cell');
                } else {
                    cell.addEventListener('click', () => handleCellClick(cell));
                }

                row.appendChild(cell);
            });
            scheduleBody.appendChild(row);
        }
    }
}


function getNextRecordId() {
    const records = JSON.parse(localStorage.getItem('records')) || [];
    return records.length > 0 ? Math.max(...records.map(r => parseInt(r.запись_id, 10))) + 1 : 1;
}

function getMasterIdByName(masterName) {
    const masters = JSON.parse(localStorage.getItem('masters')) || [];
    const master = masters.find(m => m.имя === masterName);
    return master ? master.мастер_id : null; 
}

function getServiceIdByName(serviceName) {
    const services = JSON.parse(localStorage.getItem('services')) || [];
    const service = services.find(s => s.название === serviceName);
    return service ? service.услуга_id : null; 
}



function saveRecord(master, time, client, phone, service, date, isEdit = false) {
    let records = JSON.parse(localStorage.getItem('records')) || [];

    function getServicePriceByName(serviceName) {
        const services = JSON.parse(localStorage.getItem('services')) || [];
        const service = services.find(s => s.название === serviceName);
        return service ? service.цена : null; 
    }

    
    let servicePrice = getServicePriceByName(service); 

    
    if (service === 'Другое') {
        servicePrice = '-';
    } else if (servicePrice === null) {
        console.warn(`Цена для услуги "${service}" не найдена.`);
        servicePrice = '0'; 
    }

    if (isEdit) {
        const recordExists = records.some(record => 
            record.мастер_имя === master &&
            record.дата_время.split(" ")[0] === date &&
            record.дата_время.split(" ")[1] === time
        );

        if (!recordExists) {
            console.warn('Запись для редактирования не найдена');
            return; 
        }

        records = records.map(record => {
            if (
                record.мастер_имя === master &&
                record.дата_время.split(" ")[0] === date &&
                record.дата_время.split(" ")[1] === time
            ) {
                return {
                    ...record,
                    клиент_имя: client,
                    клиент_телефон: phone,
                    услуга_название: service,
                    услуга_цена: servicePrice 
                };
            }
            return record;
        });
    } else {
        const duplicateRecord = records.some(record => 
            record.мастер_имя === master &&
            record.дата_время.split(" ")[0] === date &&
            record.дата_время.split(" ")[1] === time
        );

        if (duplicateRecord) {
            console.warn('Запись уже существует');
            return; 
        }

        records.push({
            запись_id: getNextRecordId().toString(), 
            клиент_имя: client,
            клиент_телефон: phone,
            клиент_email: '-', 
            мастер_id: getMasterIdByName(master),
            мастер_имя: master,
            услуга_id: getServiceIdByName(service),
            услуга_название: service,
            услуга_цена: servicePrice, 
            дата_время: `${date} ${time}`,
            статус: 'Подтверждена'
        });
    }

    try {
        localStorage.setItem('records', JSON.stringify(records));
    } catch (error) {
        console.error('Ошибка при сохранении записей в localStorage:', error);
    }
}


export function loadRecords(date) {
    const records = JSON.parse(localStorage.getItem('records')) || [];
    const dateToLoad = date || new Date().toISOString().split('T')[0];

    document.querySelectorAll('.schedule-cell').forEach(cell => {
        cell.textContent = ''; 
    });

    records.forEach(record => {
        const recordDate = record.дата_время.split(" ")[0];
        const recordTime = record.дата_время.split(" ")[1];

        if (recordDate === dateToLoad) {
            const cell = document.querySelector(
                `.schedule-cell[data-master="${record.мастер_имя}"][data-time="${recordTime}"]`
            );
            if (cell) {
                cell.textContent = `${record.клиент_имя} (${record.услуга_название})`;
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', loadRecords);


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
        const masterName = selectedCell.dataset.master;
        const time = selectedCell.dataset.time;

        deleteRecord(masterName, time, state.selectedDate); 

        closeClientModal();
        loadRecords(state.selectedDate); 
    }
});



function populateServiceSelect(masterSpecialization) {
    const services = JSON.parse(localStorage.getItem('services')) || [];
    
    
    const filteredServices = services.filter(service => service.специализация === masterSpecialization);
    
    
    serviceSelect.innerHTML = `
        <option value="" disabled selected>-- Выберите услугу --</option>
    `;

    
    filteredServices.forEach(service => {
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
    let records = JSON.parse(localStorage.getItem('records')) || [];
    const updatedRecords = records.filter(record => {
        const recordDate = record.дата_время.split(" ")[0];
        const recordTime = record.дата_время.split(" ")[1];
        const recordMaster = record.мастер_имя;

        return !(recordMaster === master && recordTime === time && recordDate === date);
    });

    localStorage.setItem('records', JSON.stringify(updatedRecords));
    loadRecords(date); 
}



function handleCellClick(cell) {
    const cellDateTime = new Date(`${state.selectedDate}T${cell.dataset.time}`);
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 30);

    if (cellDateTime < today || cellDateTime > maxDate) {
        return;
    }

    openClientModal(cell);
}

const clientModal = document.getElementById('clientModal');
const clientNameInput = document.getElementById('clientNameInput');
const saveClientButton = document.getElementById('saveClientButton');
const errorMessage = document.getElementById('errorMessage');

let selectedCell = null;

function getRecordForCell(master, time, date) {
    const records = JSON.parse(localStorage.getItem('records')) || [];
    return records.find(record => {
        const recordTime = record.дата_время.split(" ")[1];
        const recordDate = record.дата_время.split(" ")[0]; 
        const recordMaster = record.мастер_имя;
        return recordMaster === master && recordTime === time && recordDate === date; 
    });
}


function openClientModal(cell) {
    selectedCell = cell;

    
    clientNameInput.value = '';
    document.getElementById('clientPhoneInput').value = '';
    serviceSelect.value = '';
    otherServiceContainer.style.display = 'none';
    otherServiceInput.value = '';
    deleteClientButton.style.display = 'none'; 

    
    const masterName = cell.dataset.master;
    const masters = JSON.parse(localStorage.getItem('masters')) || [];
    const selectedMaster = masters.find(master => master.имя === masterName);
    const masterSpecialization = selectedMaster ? selectedMaster.специализация : '';

    
    populateServiceSelect(masterSpecialization);

    
    const time = cell.dataset.time;
    const date = cell.dataset.date; 
    const existingRecord = getRecordForCell(masterName, time, date); 

    if (existingRecord) {
        
        clientNameInput.value = existingRecord.клиент_имя || '';
        document.getElementById('clientPhoneInput').value = existingRecord.клиент_телефон || '';
        serviceSelect.value = getServiceIdByName(existingRecord.услуга_название) || '';

        updateStatusStyles(existingRecord.статус);
        
        document.getElementById('recordStatus').textContent = existingRecord.статус || 'Неизвестно';
        document.getElementById('recordId').textContent = existingRecord.запись_id || '-';
        document.getElementById('recordDetails').style.display = 'block';

        
        deleteClientButton.style.display = 'inline-block';
    } else {
        
        document.getElementById('recordDetails').style.display = 'none';
        document.getElementById('recordStatus').textContent = '';
    }

    clientModal.style.display = 'flex';
    clientNameInput.focus();
}

function closeClientModal() {
    clientModal.style.display = 'none';
    selectedCell = null;
    errorMessage.style.display = 'none'; 
}

function updateStatusStyles(status) {
    const statusElement = document.getElementById('recordStatus');

    
    statusElement.classList.remove('status-awaiting', 'status-confirmed', 'status-rejected');

    
    if (status === 'Ожидает подтверждения') {
        statusElement.textContent = 'Ожидает подтверждения';
        statusElement.classList.add('status-awaiting');
    } else if (status === 'Подтверждена') {
        statusElement.textContent = 'Подтверждена';
        statusElement.classList.add('status-confirmed');
    } else if (status === 'Отклонена') {
        statusElement.textContent = 'Отклонена';
        statusElement.classList.add('status-rejected');
    } else {
        statusElement.textContent = 'Неизвестный статус';
    }
}

saveClientButton.addEventListener('click', () => {
    const clientName = clientNameInput.value.trim();
    const clientPhone = document.getElementById('clientPhoneInput').value.trim();
    const selectedService = serviceSelect.value === 'other' ? otherServiceInput.value.trim() : serviceSelect.options[serviceSelect.selectedIndex].text;
    const masterName = selectedCell.dataset.master;
    const time = selectedCell.dataset.time;

    if (clientName && clientPhone && selectedService && selectedCell) {
        if (!/^\+?\d{10,15}$/.test(clientPhone)) {
            errorMessage.textContent = 'Введите корректный номер телефона.';
            errorMessage.style.display = 'block';
            return;
        }

        if (selectedService === "-- Выберите услугу --") {
            errorMessage.textContent = 'Выберите услугу.';
            errorMessage.style.display = 'block';
            return;
        }

        const isEdit = !!getRecordForCell(masterName, time);

        saveRecord(masterName, time, clientName, clientPhone, selectedService, state.selectedDate, isEdit);

        closeClientModal();
        errorMessage.style.display = 'none';

        loadRecords(state.selectedDate); 
    } else {
        errorMessage.textContent = 'Введите имя клиента, телефон и выберите услугу.';
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