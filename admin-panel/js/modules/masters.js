export function initMasters() {
    const mastersTableBody = document.getElementById('mastersTableBody');
    const addMasterButton = document.getElementById('addMasterButton');
    const addMasterModal = document.getElementById('addMasterModal');
    const closeAddMasterModal = document.getElementById('closeAddMasterModal');
    const masterSettingsModal = document.getElementById('masterSettingsModal');
    const closeMasterModal = document.getElementById('closeMasterModal');

    let currentMasterRow; 

    async function loadMastersFromJson() {
        const response = await fetch('db/barbershop_db.json');
        if (!response.ok) {
            throw new Error('Ошибка загрузки данных');
        }
        const data = await response.json();
        return data.find(table => table.name === "Мастера").data;
    }

    function getMastersFromLocalStorage() {
        const masters = localStorage.getItem('masters');
        return masters ? JSON.parse(masters) : [];
    }

    function saveMastersToLocalStorage(masters) {
        localStorage.setItem('masters', JSON.stringify(masters));
    }

    function getNextMasterId() {
        let masters = getMastersFromLocalStorage();
        return masters.length > 0 ? Math.max(...masters.map(master => Number(master.мастер_id))) + 1 : 1;
    }

    function populateMasters() {
        const masters = getMastersFromLocalStorage();
        mastersTableBody.innerHTML = ''; 

        masters.forEach(master => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="master-id">${master.мастер_id}</td>
                <td class="master-name">${master.имя}</td>
                <td class="master-specialization">${master.специализация}</td>
                <td class="master-schedule">${master.график_работы}</td>
                <td class="master-actions">
                    <button class="master-button master-button--settings">Настройки</button>
                    <button class="master-button master-button--delete">
                        <img src="img/delete-icon.svg" alt="Delete">
                    </button>
                </td>
            `;
            mastersTableBody.appendChild(row);
        });

        attachEventHandlers(); 
    }

    async function initializeMasters() {
        let masters = getMastersFromLocalStorage();
        if (masters.length === 0) {
            
            masters = await loadMastersFromJson();
            saveMastersToLocalStorage(masters); 
        }
        populateMasters(); 
    }

    function attachEventHandlers() {
        document.querySelectorAll('.master-button--delete').forEach(button => {
            button.addEventListener('click', function() {
                const row = this.closest('tr');
                const masterId = row.querySelector('.master-id').textContent;
                row.remove();

                let masters = getMastersFromLocalStorage();
                masters = masters.filter(master => master.мастер_id !== masterId);
                saveMastersToLocalStorage(masters);
            });
        });

        document.querySelectorAll('.master-button--settings').forEach(button => {
            button.addEventListener('click', function() {
                currentMasterRow = this.closest('tr'); 
                const masterId = currentMasterRow.querySelector('.master-id').textContent;
                const masterName = currentMasterRow.querySelector('.master-name').textContent;
                const masterSpecialization = currentMasterRow.querySelector('.master-specialization').textContent || 'Стрижка и укладка';  // Значение по умолчанию
                const masterSchedule = currentMasterRow.querySelector('.master-schedule').textContent;
        
                document.getElementById('masterId').textContent = masterId;
                document.getElementById('masterName').textContent = masterName;
                document.getElementById('editMasterSpecialization').value = masterSpecialization;
                document.getElementById('masterSchedule').textContent = masterSchedule;
        
                masterSettingsModal.style.display = 'flex'; 
            });
        });
        

        
        document.querySelectorAll('.edit-icon').forEach(icon => {
            icon.addEventListener('click', function() {

                const fieldToEdit = this.closest('td').previousElementSibling.querySelector('span'); 
        
                if (fieldToEdit) {
                    fieldToEdit.contentEditable = 'true'; 
                    fieldToEdit.focus();

                    fieldToEdit.addEventListener('keydown', function(event) {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            this.contentEditable = 'false'; 
                        }
                    });
                }
            });
        });
        
    }

    initializeMasters();
    
    closeMasterModal.addEventListener('click', function() {
        masterSettingsModal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === masterSettingsModal) {
            masterSettingsModal.style.display = 'none';
        }
    });

    document.getElementById('saveMasterSettings').addEventListener('click', function() {
        const masterId = document.getElementById('masterId').textContent.trim();
        const masterName = document.getElementById('masterName').textContent.trim();
        const masterSpecialization = document.getElementById('editMasterSpecialization').value;

        const masterSchedule = document.getElementById('masterSchedule').textContent.trim();
    
        
        if (currentMasterRow && masterId && masterName && masterSpecialization && masterSchedule) {
            currentMasterRow.querySelector('.master-name').textContent = masterName;
            currentMasterRow.querySelector('.master-specialization').textContent = masterSpecialization;
            currentMasterRow.querySelector('.master-schedule').textContent = masterSchedule;
            
            
            masterSettingsModal.style.display = 'none';
    
            
            let masters = getMastersFromLocalStorage();
            masters = masters.map(master => 
                master.мастер_id === masterId 
                ? { ...master, имя: masterName, специализация: masterSpecialization, график_работы: masterSchedule } 
                : master
            );
            saveMastersToLocalStorage(masters);
        }
    });

    
    addMasterButton.addEventListener('click', function() {
        document.getElementById('newMasterName').value = ''; 
        document.getElementById('newMasterSpecialization').value = 'Стрижка и укладка';  // Устанавливаем первую специализацию
        document.getElementById('newMasterSchedule').value = '';
        addMasterModal.style.display = 'flex'; 
    });

    window.addEventListener('click', function(event) {
        if (event.target === document.getElementById('addMasterModal')) {  // Проверяем, был ли клик на фоновом слое модального окна
            addMasterModal.style.display = 'none'; // Закрыть окно
        }
    });
    

    closeAddMasterModal.addEventListener('click', function() {
        addMasterModal.style.display = 'none';
    });

    
    document.getElementById('saveNewMaster').addEventListener('click', function() {
        const newMasterName = document.getElementById('newMasterName').value.trim();
        const newMasterSpecialization = document.getElementById('newMasterSpecialization').value.trim();
        const newMasterSchedule = document.getElementById('newMasterSchedule').value.trim();

        const nameError = document.getElementById('masterNameError');
        const scheduleError = document.getElementById('scheduleError');

        
        nameError.textContent = '';
        scheduleError.textContent = '';

        if (!newMasterName) {
            nameError.textContent = 'Введите имя мастера.';
            return;
        } else if (!/^[a-zA-Zа-яА-Я\s]+$/.test(newMasterName)) {
            nameError.textContent = 'Имя мастера может содержать только буквы.';
            return;
        }

        if (!newMasterSchedule) {
            scheduleError.textContent = 'Введите график работы мастера.';
            return;
        }

        if (!newMasterName || !newMasterSpecialization || !newMasterSchedule) return;

        const newMasterId = getNextMasterId();
        const newMaster = {
            мастер_id: String(newMasterId), 
            имя: newMasterName,
            специализация: newMasterSpecialization,
            график_работы: newMasterSchedule
        };
    
        let masters = getMastersFromLocalStorage();
        masters.push(newMaster);
        saveMastersToLocalStorage(masters);
    
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="master-id">${newMaster.мастер_id}</td>
            <td class="master-name">${newMaster.имя}</td>
            <td class="master-specialization">${newMaster.специализация}</td>
            <td class="master-schedule">${newMaster.график_работы}</td>
            <td class="master-actions">
                <button class="master-button master-button--settings">Настройки</button>
                <button class="master-button master-button--delete">
                    <img src="img/delete-icon.svg" alt="Delete">
                </button>
            </td>
        `;
        mastersTableBody.appendChild(row);
    
        
        document.getElementById('newMasterName').value = '';
        document.getElementById('newMasterSpecialization').value = '';
        document.getElementById('newMasterSchedule').value = '';
        addMasterModal.style.display = 'none';
    
        attachEventHandlers(); 
    });

    document.getElementById('newMasterName').addEventListener('input', function() {
        const nameError = document.getElementById('nameError');
        const value = this.value;
        if (!/^[a-zA-Zа-яА-Я\s]*$/.test(value)) {
            nameError.textContent = 'Имя мастера должно содержать только буквы и пробелы.';
            this.value = value.replace(/[^a-zA-Zа-яА-Я\s]/g, '');
        } else {
            nameError.textContent = '';
        }
    });



    const masterNameField = document.getElementById('masterName');
    const masterSpecializationField = document.getElementById('newMasterSpecialization');
    const masterScheduleField = document.getElementById('masterSchedule');

    masterNameField.addEventListener('keydown', handleAlphabeticKey);
    masterSpecializationField.addEventListener('keydown', handleAlphabeticKey);
    masterScheduleField.addEventListener('keydown', handleMasterScheduleKey);

    function handleMasterScheduleKey(event) {
        const maxLength = getMaxLength(this.id);
        if (event.key === 'Backspace' || event.key === 'Delete' || event.key === 'Tab' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            return;
        }

        if (!isAlphabeticKey(event) && !isNumberKey(event) || this.textContent.length >= maxLength) {
            event.preventDefault();
        }
    }

    function handleAlphabeticKey(event) {
        const maxLength = getMaxLength(this.id);
        if (event.key === 'Backspace' || event.key === 'Delete' || event.key === 'Tab' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            return;
        }

        if (!isAlphabeticKey(event) || this.textContent.length >= maxLength) {
            event.preventDefault();
        }
    }

    function getMaxLength(id) {
        switch (id) {
            case 'masterName': return 30; 
            case 'masterSpecialization': return 30; 
            case 'masterSchedule': return 25; 
            default: return Infinity; 
        }
    }

    function isNumberKey(event) {
        const charCode = event.which || event.keyCode;
        return (
            (charCode >= 48 && charCode <= 57) || 
            (charCode >= 96 && charCode <= 105) ||
            charCode === 8 || 
            charCode === 46 || 
            charCode === 9 || 
            (charCode >= 37 && charCode <= 40)
        );
    }

    function isAlphabeticKey(event) {
        const charCode = event.which || event.keyCode;
        return (
            (charCode >= 65 && charCode <= 90) || 
            (charCode >= 97 && charCode <= 122) || 
            charCode === 32 || 
            charCode === 8 || 
            charCode === 46 || 
            charCode === 9 || 
            (charCode >= 37 && charCode <= 40) 
        );
    }

    populateMasters();
}
