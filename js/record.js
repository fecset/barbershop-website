const SERVICE_DURATION_MINUTES = 90;

function getDataFromLocalStorage() {
    const masters = JSON.parse(localStorage.getItem('masters')) || [];
    const services = JSON.parse(localStorage.getItem('services')) || [];
    const records = JSON.parse(localStorage.getItem('records')) || [];
    return { masters, services, records };
}

const daysOfWeek = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];



function getMasterWorkingHours(master, date) {
    
    const dayOfWeek = date.toLocaleDateString('ru-RU', { weekday: 'short' }).charAt(0).toUpperCase() + date.toLocaleDateString('ru-RU', { weekday: 'short' }).slice(1);
    console.log("Проверяем рабочий день:", dayOfWeek); 

    if (!master.график_работы) {
        console.warn("График работы мастера не найден");
        return null;
    }

    const workingHoursEntry = master.график_работы.split(", ").find(dayEntry => {
        console.log("Анализируем запись графика:", dayEntry); 
        const [daysRange, hours] = dayEntry.split(" ");
        const [startDay, endDay] = daysRange.split("-");

        const startIndex = daysOfWeek.indexOf(startDay);
        const endIndex = daysOfWeek.indexOf(endDay || startDay); 
        const currentIndex = daysOfWeek.indexOf(dayOfWeek);

        if (currentIndex === -1) {
            console.error(`Ошибка: День недели "${dayOfWeek}" не найден в daysOfWeek`);
            return false;
        }

        console.log(`Диапазон дней: ${startDay} (${startIndex}) - ${endDay || startDay} (${endIndex}), Текущий день: ${dayOfWeek} (${currentIndex})`); 

        if (startIndex <= endIndex) {
            return currentIndex >= startIndex && currentIndex <= endIndex;
        } else {
            return currentIndex >= startIndex || currentIndex <= endIndex;
        }
    });

    if (!workingHoursEntry) {
        console.log("Мастер не работает в выбранный день:", date.toDateString());
        return null;
    }

    console.log("Найденные рабочие часы для дня:", workingHoursEntry); 

    const hours = workingHoursEntry.split(" ")[1].split("-");
    return {
        start: hours[0],
        end: hours[1]
    };
}



function getMasterAppointmentsForDate(masterId, date, records) {
    const dateString = date.toISOString().split("T")[0]; 
    return records.filter(record => record.мастер_id === masterId && record.дата_время.startsWith(dateString));
}

function getAvailableTimeSlots(master, date, records) {
    const workingHours = getMasterWorkingHours(master, date);
    console.log("Рабочие часы мастера:", workingHours); 
    if (!workingHours) {
        console.log("Мастер не работает в выбранный день:", date);
        return [];
    }

    const today = new Date();
    const isToday = today.toDateString() === date.toDateString();

    const startHour = parseInt(workingHours.start.split(":")[0], 10);
    const startMinute = parseInt(workingHours.start.split(":")[1], 10);
    const endHour = parseInt(workingHours.end.split(":")[0], 10);
    const endMinute = parseInt(workingHours.end.split(":")[1], 10);

    console.log("Проверка времени начала и конца работы:", startHour, ":", startMinute, "-", endHour, ":", endMinute);

    const appointments = getMasterAppointmentsForDate(master.мастер_id, date, records);
    console.log("Существующие записи на выбранный день:", appointments);

    const availableSlots = [];
    let currentHour = startHour;
    let currentMinute = startMinute;

    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
        const slotStart = new Date(date);
        slotStart.setHours(currentHour, currentMinute);

        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotStart.getMinutes() + SERVICE_DURATION_MINUTES);

        
        if (isToday && slotStart <= today) {
            currentMinute += 30;
            if (currentMinute >= 60) {
                currentMinute = 0;
                currentHour += 1;
            }
            continue;
        }

        const isSlotFree = appointments.every(appointment => {
            const appointmentStart = new Date(appointment.дата_время);
            const appointmentEnd = new Date(appointmentStart);
            appointmentEnd.setMinutes(appointmentStart.getMinutes() + SERVICE_DURATION_MINUTES);

            return slotEnd <= appointmentStart || slotStart >= appointmentEnd;
        });

        if (isSlotFree) {
            availableSlots.push(slotStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }

        currentMinute += 30;
        if (currentMinute >= 60) {
            currentMinute = 0;
            currentHour += 1;
        }
    }

    
    console.log("Доступные временные слоты:", availableSlots); 
    return availableSlots;
}



function showAvailableTimeSlots() {
    const selectedDate = new Date(document.getElementById('date-picker').value);
    const masterDropdown = document.getElementById('master');
    const selectedMasterId = masterDropdown.querySelector('.selected').dataset.value;

    if (!selectedMasterId || isNaN(selectedDate.getTime())) {
        return;
    }

    const { masters, records } = getDataFromLocalStorage();
    const selectedMaster = masters.find(master => master.мастер_id === selectedMasterId);

    const availableSlots = getAvailableTimeSlots(selectedMaster, selectedDate, records);
    const timeSlotsContainer = document.getElementById('time-slots');
    timeSlotsContainer.innerHTML = '';

    if (availableSlots.length === 0) {
        timeSlotsContainer.textContent = 'Нет доступного времени для записи на выбранный день';
    } else {
        availableSlots.forEach(time => {
            const timeSlot = document.createElement('div');
            timeSlot.classList.add('time-slot');
            timeSlot.textContent = time;
            timeSlot.addEventListener('click', () => {
                document.querySelector('.selected-time').textContent = `Вы выбрали: ${time}`;
            });
            timeSlotsContainer.appendChild(timeSlot);
        });
    }
}



function getMastersForService(serviceName, masters) {
    if (["Мужская стрижка", "Комплекс: стрижка и бритьё", "Укладка волос", "Детская стрижка"].includes(serviceName)) {
        return masters.filter(master => master.специализация.includes("Стрижка"));
    } else if (["Бритьё опасной бритвой", "Коррекция бороды", "Окрашивание бороды", "Королевское бритьё с уходом"].includes(serviceName)) {
        return masters.filter(master => master.специализация.includes("Бритьё") || master.специализация.includes("бородой"));
    }
    return [];
}

function saveRecordToLocalStorage(record) {
    let records = JSON.parse(localStorage.getItem('records')) || [];
    
    
    record.запись_id = record.запись_id.toString();
    record.клиент_id = record.клиент_id?.toString();
    record.мастер_id = record.мастер_id.toString();
    record.услуга_id = record.услуга_id.toString();

    records.push(record);
    localStorage.setItem('records', JSON.stringify(records));
}

function getMasterNameById(masterId) {
    const masters = JSON.parse(localStorage.getItem('masters')) || [];
    const master = masters.find(m => m.мастер_id === masterId);
    return master ? master.имя : '';
}

function getServiceNameById(serviceId) {
    const services = JSON.parse(localStorage.getItem('services')) || [];
    const service = services.find(s => s.услуга_id === serviceId);
    return service ? service.название : '';
}

function populateServices(services) {
    const serviceSelect = document.getElementById('service').querySelector('.options');
    serviceSelect.innerHTML = ''; 

    services.forEach(service => {
        const option = document.createElement('div');
        option.classList.add('option');
        option.setAttribute('data-value', service.услуга_id);
        option.textContent = `${service.название} - ${service.цена} руб.`;
        serviceSelect.appendChild(option);
    });
}


function populateMasters(masters) {
    const masterSelect = document.getElementById('master').querySelector('.options');
    masterSelect.innerHTML = '';
    masters.forEach(master => {
        const option = document.createElement('div');
        option.classList.add('option');
        option.dataset.value = master.мастер_id;
        option.textContent = `${master.имя} (${master.график_работы})`;
        masterSelect.appendChild(option);
    });
}

function getNextRecordId() {
    const records = JSON.parse(localStorage.getItem('records')) || [];
    const nextId = records.length > 0 ? Math.max(...records.map(r => parseInt(r.запись_id, 10))) + 1 : 1;
    return nextId.toString(); 
}


function validateForm() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();

    let selectedMasterElement = document.getElementById('master').querySelector('.selected');
    let selectedServiceElement = document.getElementById('service').querySelector('.selected');
    let selectedDate = document.getElementById('date-picker').value; 
    let selectedTime = document.querySelector('.selected-time').textContent; 

    selectedTime = selectedTime.replace('Вы выбрали: ', '').trim();

    const selectedMasterId = selectedMasterElement.dataset.value;
    const selectedServiceId = selectedServiceElement.dataset.value;

    const nameError = document.getElementById('name-error');
    const emailError = document.getElementById('email-error');
    const phoneError = document.getElementById('phone-error');
    const masterError = document.getElementById('master-error');
    const dateTimeError = document.getElementById('date-time-error');
    const serviceError = document.getElementById('service-error');
    const successMessage = document.getElementById('success-message');

    let isValid = true;

    
    if (name.length < 2) {
        nameError.textContent = 'Имя должно содержать не менее 2 символов.';
        nameError.style.display = 'block';
        isValid = false;
    } else if (/\d/.test(name)) {
        nameError.textContent = 'Имя не должно содержать цифр.';
        nameError.style.display = 'block';
        isValid = false;
    } else {
        nameError.style.display = 'none';
    }

    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        emailError.textContent = 'Введите корректный адрес электронной почты.';
        emailError.style.display = 'block';
        isValid = false;
    } else {
        emailError.style.display = 'none';
    }

    
    const phonePattern = /^(?:\+7|8)\d{10}$/;
    if (!phonePattern.test(phone)) {
        phoneError.textContent = 'Введите корректный номер телефона.';
        phoneError.style.display = 'block';
        isValid = false;
    } else {
        phoneError.style.display = 'none';
    }

    
    if (!selectedMasterId) {
        masterError.textContent = 'Пожалуйста, выберите мастера.';
        masterError.style.display = 'block';
        isValid = false;
    } else {
        masterError.style.display = 'none';
    }

    
    if (!selectedDate || !selectedTime) {
        dateTimeError.textContent = 'Пожалуйста, выберите дату и время.';
        dateTimeError.style.display = 'block';
        isValid = false;
    } else {
        dateTimeError.style.display = 'none';
    }

    
    if (!selectedServiceId) {
        serviceError.textContent = 'Пожалуйста, выберите услугу.';
        serviceError.style.display = 'block';
        isValid = false;
    } else {
        serviceError.style.display = 'none';
    }


    function getServicePriceById(serviceId) {
        const services = JSON.parse(localStorage.getItem('services')) || [];
        const service = services.find(service => service.услуга_id === serviceId);
        return service ? service.цена : null;
    }
    

    if (isValid) {
        const newRecord = {
            запись_id: getNextRecordId().toString(), 
            клиент_имя: name,
            клиент_телефон: phone,
            клиент_email: email,
            мастер_id: selectedMasterId.toString(), 
            мастер_имя: getMasterNameById(selectedMasterId),
            услуга_id: selectedServiceId.toString(), 
            услуга_название: getServiceNameById(selectedServiceId),
            услуга_цена: getServicePriceById(selectedServiceId), 
            дата_время: `${selectedDate} ${selectedTime}`, 
            статус: 'Ожидает подтверждения'
        };
        
        saveRecordToLocalStorage(newRecord);

        successMessage.textContent = 'Ваша запись отправлена!';
        successMessage.style.display = 'block';
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    } else {
        successMessage.style.display = 'none';
    }
}



document.addEventListener('DOMContentLoaded', () => {
    const { masters, services } = getDataFromLocalStorage();
    populateServices(services);

    const serviceDropdown = document.getElementById('service');
    const masterDropdown = document.getElementById('master');
    const datePicker = document.getElementById('date-picker');
    const timeSlotsContainer = document.getElementById('time-slots');
    const selectedServiceElement = serviceDropdown.querySelector('.selected');
    const selectedMasterElement = masterDropdown.querySelector('.selected');

    masterDropdown.classList.add('disabled');
    datePicker.disabled = true;
    timeSlotsContainer.classList.add('disabled');

    function resetDateTimeSelection() {
        const dateTimeError = document.getElementById('date-time-error');
        datePicker.value = ''; 
        document.querySelector('.selected-time').textContent = ''; 
        timeSlotsContainer.innerHTML = ''; 
        timeSlotsContainer.classList.add('disabled'); 

        if (dateTimeError) {
            dateTimeError.style.display = 'none';
        }
    }

    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 30);

    datePicker.min = today.toISOString().split('T')[0]; 
    datePicker.max = maxDate.toISOString().split('T')[0];
    
    serviceDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!serviceDropdown.classList.contains('open')) {
            closeAllDropdowns(serviceDropdown); 
            serviceDropdown.classList.add('open'); 
        }
    });

    
    masterDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!masterDropdown.classList.contains('disabled') && !masterDropdown.classList.contains('open')) {
            closeAllDropdowns(masterDropdown);
            masterDropdown.classList.add('open'); 
        }
    });

    
    serviceDropdown.querySelector('.options').addEventListener('click', (e) => {
        e.stopPropagation(); 
        if (e.target.classList.contains('option')) {
            const option = e.target;
            const serviceName = option.textContent.split(" - ")[0];
            selectedServiceElement.textContent = option.textContent.trim();
            selectedServiceElement.dataset.value = option.getAttribute('data-value');
            serviceDropdown.classList.remove('open'); 

            
            resetMasterSelection();
            resetDateTimeSelection();

            
            const availableMasters = getMastersForService(serviceName, masters);
            populateMasters(availableMasters);

            
            masterDropdown.classList.remove('disabled');
        }
    });

    
    masterDropdown.querySelector('.options').addEventListener('click', (e) => {
        e.stopPropagation(); 
        if (e.target.classList.contains('option')) {
            const option = e.target;
            selectedMasterElement.textContent = option.textContent.trim();
            selectedMasterElement.dataset.value = option.getAttribute('data-value');
            masterDropdown.classList.remove('open'); 

            
            resetDateTimeSelection();

            
            if (selectedServiceElement.dataset.value && selectedMasterElement.dataset.value) {
                datePicker.disabled = false; 
                timeSlotsContainer.classList.remove('disabled'); 
            }
        }
    });

    
    document.addEventListener('click', () => {
        closeAllDropdowns();
    });

    datePicker.addEventListener('change', showAvailableTimeSlots);

    document.querySelector('.submit-button').addEventListener('click', validateForm);
});


function resetMasterSelection() {
    const masterDropdown = document.getElementById('master');
    const selectedMasterElement = masterDropdown.querySelector('.selected');
    selectedMasterElement.textContent = "Выберите мастера";
    selectedMasterElement.dataset.value = "";
    masterDropdown.classList.add('disabled'); 
}


function closeAllDropdowns(exceptDropdown = null) {
    const dropdowns = document.querySelectorAll('.custom-dropdown');
    dropdowns.forEach(dropdown => {
        if (dropdown !== exceptDropdown) {
            dropdown.classList.remove('open');
        }
    });
}



