document.querySelectorAll('.custom-dropdown').forEach(dropdown => {
    const selected = dropdown.querySelector('.selected');
    const optionsContainer = dropdown.querySelector('.options');
    const options = dropdown.querySelectorAll('.option');

    
    dropdown.addEventListener('click', (e) => {
        e.stopPropagation(); 
        dropdown.classList.toggle('open'); 
    });

    options.forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation(); 

            const text = option.textContent.trim();

            
            selected.innerHTML = text;

            
            selected.dataset.value = option.getAttribute('data-value');

            
            dropdown.classList.remove('open');
        });
    });

    
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('open'); 
        }
    });
});


function saveRecordToLocalStorage(record) {
    // Проверяем, есть ли уже сохраненные записи с ключом "clientRecords"
    let records = JSON.parse(localStorage.getItem('clientRecords')) || [];
    records.push(record);
    localStorage.setItem('clientRecords', JSON.stringify(records));
}

function validateForm() {
    // Получаем значения полей
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();

    // Получаем выбранные значения для мастера, даты и услуги из dropdown'ов
    const selectedMasterElement = document.getElementById('master').querySelector('.selected');
    const selectedServiceElement = document.getElementById('service').querySelector('.selected');
    const selectedDateTimeElement = document.getElementById('date-time').querySelector('.selected');

    // Извлекаем значения из data-value атрибутов
    const selectedMasterId = selectedMasterElement.dataset.value;
    const selectedServiceId = selectedServiceElement.dataset.value;
    const selectedDateTime = selectedDateTimeElement.dataset.value;


    // Получаем элементы для отображения ошибок
    const nameError = document.getElementById('name-error');
    const emailError = document.getElementById('email-error');
    const phoneError = document.getElementById('phone-error');
    const masterError = document.getElementById('master-error');
    const dateTimeError = document.getElementById('date-time-error');
    const serviceError = document.getElementById('service-error');
    const successMessage = document.getElementById('success-message');

    // Устанавливаем флаг валидности
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

    
    if (!selectedDateTime) {
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

    
    if (isValid) {
        const newRecord = {
            запись_id: Date.now().toString(),
            клиент_имя: name,
            клиент_телефон: phone,
            клиент_email: email,
            мастер_id: selectedMasterId,
            услуга_id: selectedServiceId,
            дата_время: selectedDateTime,
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
    const submitButton = document.querySelector('.submit-button');
    submitButton.addEventListener('click', validateForm);
});


