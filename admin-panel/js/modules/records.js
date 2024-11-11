
export function initRecords() {
    const recordsTableBody = document.getElementById('recordsTableBody');
    const newRecordsTableBody = document.getElementById('newRecordsTableBody');
    const detailsModal = document.getElementById('detailsModal');
    const closeDetailsModal = document.getElementById('closeDetailsModal');

    function getStatusClass(status) {
        switch (status) {
            case 'Подтверждена':
                return 'status-confirmed';
            case 'Ожидает подтверждения':
                return 'status-awaiting';
            case 'Отклонена':
                return 'status-rejected';
            default:
                return '';
        }
    }

    async function loadDataFromJson() {
        const response = await fetch('db/barbershop_db.json');
        if (!response.ok) {
            throw new Error('Ошибка загрузки данных');
        }
        const data = await response.json();

        const records = data.find(table => table.name === "Записи").data;
        const clients = data.find(table => table.name === "Клиенты").data;
        const masters = data.find(table => table.name === "Мастера").data;
        const services = data.find(table => table.name === "Услуги").data;

        const clientMap = {};
        clients.forEach(client => {
            clientMap[client.клиент_id] = client;
        });

        const masterMap = {};
        masters.forEach(master => {
            masterMap[master.мастер_id] = master;
        });

        const serviceMap = {};
        services.forEach(service => {
            serviceMap[service.услуга_id] = service;
        });

        const enrichedRecords = records.map(record => ({
            ...record,
            клиент_имя: clientMap[record.клиент_id]?.имя || 'Неизвестный клиент',
            клиент_телефон: clientMap[record.клиент_id]?.телефон || '',
            клиент_email: clientMap[record.клиент_id]?.email || '',
            мастер_имя: masterMap[record.мастер_id]?.имя || 'Неизвестный мастер',
            услуга_название: serviceMap[record.услуга_id]?.название || 'Неизвестная услуга',
            услуга_цена: serviceMap[record.услуга_id]?.цена || ''
        }));

        return enrichedRecords;
    }
    function getRecordsFromLocalStorage() {
        const records = localStorage.getItem('records');
        return records ? JSON.parse(records) : [];
    }

    function saveRecordsToLocalStorage(records) {
        localStorage.setItem('records', JSON.stringify(records));
    }

    function populateRecords() {
        const records = getRecordsFromLocalStorage();
        recordsTableBody.innerHTML = '';

        records.forEach(record => {
            const row = document.createElement('tr');
            const statusClass = getStatusClass(record.статус);

            row.innerHTML = `
                <td>${record.запись_id}</td>
                <td>${record.клиент_имя}</td>
                <td>${record.дата_время}</td>
                <td class="status ${statusClass}">${record.статус}</td>
                <td>
                    <div class="record-buttons">
                        <button class="record-button record-button--info" data-id="${record.запись_id}">
                            <img src="img/info.svg" alt="Info">
                        </button>
                        <button class="record-button record-button--confirm ${record.статус === 'Подтверждена' ? 'inactive' : ''}">
                            <img src="img/confirm.svg" alt="Confirm">
                        </button>
                        <button class="record-button record-button--reject ${record.статус === 'Отклонена' ? 'inactive' : ''}">
                            <img src="img/reject.svg" alt="Reject">
                        </button>
                        <button class="record-button record-button--delete">
                            <img src="img/delete-icon.svg" alt="Delete">
                        </button>
                    </div>
                </td>
            `;
            recordsTableBody.appendChild(row);
        });
    }

    async function initializeRecords() {
        // let records = getRecordsFromLocalStorage();
        // if (records.length === 0) {
        //     records = await loadDataFromJson();
        //     saveRecordsToLocalStorage(records);
        // }
        populateRecords();
        initializeNewRecords();
    }

    function deleteFromClientScheduleRecords(master, time, date) {
        let clientScheduleRecords = JSON.parse(localStorage.getItem('clientScheduleRecords')) || [];
    
        // Удаляем запись из clientScheduleRecords на основе совпадения по мастеру, времени и дате
        clientScheduleRecords = clientScheduleRecords.filter(record =>
            !(record.master === master && record.time === time && record.date === date)
        );
    
        // Сохраняем обновленный список в localStorage
        localStorage.setItem('clientScheduleRecords', JSON.stringify(clientScheduleRecords));
    }
    
    function attachEventHandlers() {

        recordsTableBody.addEventListener('click', function (event) {
            const target = event.target;
            const button = target.closest('button');
            if (!button) return;

            const row = button.closest('tr');
            const recordId = row.querySelector('td').textContent;
            const statusCell = row.querySelector('.status');
            const confirmButton = row.querySelector('.record-button--confirm');
            const rejectButton = row.querySelector('.record-button--reject');

            if (button.classList.contains('record-button--info')) {
                showRecordDetails(recordId);
            } else if (button.classList.contains('record-button--delete')) {
                row.remove();

                let records = getRecordsFromLocalStorage();
                const record = records.find(record => record.запись_id === recordId);
                records = records.filter(record => record.запись_id !== recordId);
                saveRecordsToLocalStorage(records);
        

                console.log('Запись удалена из records:', recordId);

                if (record) {
                    deleteFromClientScheduleRecords(recordId);
                    console.log('Запись также удалена из clientScheduleRecords');
                }

                loadRecords();
                refreshTables();
            } else if (button.classList.contains('record-button--confirm')) {
                statusCell.textContent = 'Подтверждена';
                statusCell.classList.remove('status-awaiting', 'status-rejected');
                statusCell.classList.add('status-confirmed');
                updateRecordStatus(recordId, 'Подтверждена');
            } else if (button.classList.contains('record-button--reject')) {
                statusCell.textContent = 'Отклонена';
                statusCell.classList.remove('status-awaiting', 'status-confirmed');
                statusCell.classList.add('status-rejected');
                updateRecordStatus(recordId, 'Отклонена');
            }
        });


        newRecordsTableBody.addEventListener('click', function (event) {
            const target = event.target;
            const button = target.closest('button');
            if (!button) return;

            const row = button.closest('tr');
            const recordId = row.querySelector('.record-button--info').dataset.id;
            const statusCell = row.querySelector('.status');
            const confirmButton = row.querySelector('.record-button--confirm');
            const rejectButton = row.querySelector('.record-button--reject');

            console.log(`Нажата кнопка в таблице "Главная" с ID: ${recordId}`);

            if (button.classList.contains('record-button--info')) {
                showRecordDetails(recordId);
            } else if (button.classList.contains('record-button--confirm')) {
                statusCell.textContent = 'Подтверждена';
                statusCell.classList.remove('status-awaiting', 'status-rejected');
                statusCell.classList.add('status-confirmed');
                updateRecordStatus(recordId, 'Подтверждена');
                console.log('Статус обновлён на "Подтверждена" для записи:', recordId);
                row.remove();
                refreshTables();
            } else if (button.classList.contains('record-button--reject')) {
                statusCell.textContent = 'Отклонена';
                statusCell.classList.remove('status-awaiting', 'status-confirmed');
                statusCell.classList.add('status-rejected');
                updateRecordStatus(recordId, 'Отклонена');
                console.log('Статус обновлён на "Отклонена" для записи:', recordId);
                row.remove();
                refreshTables();
            }
        });
    }

    function refreshTables() {
        populateRecords();
        populateNewRecords();
    }

    function updateRecordStatus(recordId, status) {
        let records = getRecordsFromLocalStorage();


        records = records.map(record => {
            if (record.запись_id === recordId) {
                console.log(`Updating status for record: ${record.запись_id}`);
                return { ...record, статус: status };
            }
            return record;
        });

        saveRecordsToLocalStorage(records);


        console.log('Updated records saved to localStorage:', JSON.parse(localStorage.getItem('records')));


        refreshTables();
    }

    function showRecordDetails(recordId) {
        const records = getRecordsFromLocalStorage();
        const record = records.find(rec => rec.запись_id === recordId);

        if (!record) {
            console.error("Запись не найдена");
            return;
        }


        document.getElementById('detailId').textContent = record.запись_id;
        document.getElementById('detailClientName').textContent = record.клиент_имя;
        document.getElementById('detailPhone').textContent = record.клиент_телефон;
        document.getElementById('detailEmail').textContent = record.клиент_email;
        document.getElementById('detailMaster').textContent = record.мастер_имя;
        document.getElementById('detailService').textContent = record.услуга_название;
        document.getElementById('detailPrice').textContent = `${record.услуга_цена} ₽`;
        document.getElementById('detailDate').textContent = record.дата_время;


        const statusElement = document.getElementById('detailStatus');
        statusElement.textContent = record.статус;


        const statusClass = getStatusClass(record.статус);
        statusElement.classList.remove('status-awaiting', 'status-confirmed', 'status-rejected');
        statusElement.classList.add(statusClass);


        detailsModal.style.display = 'flex';
    }


    closeDetailsModal.addEventListener('click', function () {
        detailsModal.style.display = 'none';
    });


    window.addEventListener('click', function (event) {
        if (event.target === detailsModal) {
            detailsModal.style.display = 'none';
        }
    });

    initializeRecords();



    function populateNewRecords() {
        const records = getRecordsFromLocalStorage();
        newRecordsTableBody.innerHTML = '';


        const awaitingRecords = records.filter(record => record.статус === 'Ожидает подтверждения');

        awaitingRecords.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.клиент_имя}</td>
                <td class="status status-awaiting">${record.статус}</td>
                <td>
                    <div class="record-buttons">
                        <button class="record-button record-button--info" data-id="${record.запись_id}">
                            <img src="img/info.svg" alt="Info">
                        </button>
                        <button class="record-button record-button--confirm">
                            <img src="img/confirm.svg" alt="Confirm">
                        </button>
                        <button class="record-button record-button--reject">
                            <img src="img/reject.svg" alt="Reject">
                        </button>
                    </div>
                </td>
            `;
            newRecordsTableBody.appendChild(row);
        });
    }


    initializeRecords();
    attachEventHandlers();



    function initializeNewRecords() {
        populateNewRecords();
    }
}