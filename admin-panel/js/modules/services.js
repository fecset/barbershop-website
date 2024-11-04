export function initServices() {
    const modal = document.getElementById('settingsModal');
    const closeModal = document.getElementById('closeModal');
    const servicesTableBody = document.getElementById('servicesTableBody');
    const addServiceModal = document.getElementById('addServiceModal');
    let lastServiceId = 0;

    function getServicesFromLocalStorage() {
        const services = localStorage.getItem('services');
        return services ? JSON.parse(services) : [];
    }

    function saveServicesToLocalStorage(services) {
        localStorage.setItem('services', JSON.stringify(services));
    }

    function getNextServiceId() {
        const services = getServicesFromLocalStorage();
        return services.length > 0 ? Math.max(...services.map(service => Number(service.услуга_id))) + 1 : 1;
    }
    
    async function loadServicesFromJson() {
        const response = await fetch('db/barbershop_db.json');
        if (!response.ok) {
            throw new Error('Ошибка загрузки данных');
        }
        const data = await response.json();
        return data.find(table => table.name === "Услуги").data;
    }

    function populateServices() {
        const services = getServicesFromLocalStorage();
        servicesTableBody.innerHTML = ''; 

        services.forEach(service => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="service__id">${service.услуга_id}</td>
                <td class="service__name">${service.название}</td>
                <td class="service__price">${service.цена} ₽</td>
                <td class="service__actions">
                    <button class="service__button service__button--settings">Настройки</button>
                    <button class="service__button service__button--delete">
                        <img src="img/delete-icon.svg" alt="Delete">
                    </button>
                </td>
            `;
            servicesTableBody.appendChild(row);
        });

        attachEventHandlers();
    }

    async function initializeServices() {
        let services = getServicesFromLocalStorage();
        if (services.length === 0) {
            
            services = await loadServicesFromJson();
            saveServicesToLocalStorage(services); 
        }
        populateServices(); 
    }

    function attachEventHandlers() {
        document.querySelectorAll('.service__button--delete').forEach(button => {
            button.addEventListener('click', function() {
                const row = this.closest('tr');
                const serviceId = row.querySelector('.service__id').textContent;
                row.remove();

                
                let services = getServicesFromLocalStorage();
                services = services.filter(service => service.услуга_id !== serviceId);
                saveServicesToLocalStorage(services);
            });
        });
        
        document.querySelectorAll('.service__button--settings').forEach(button => {
            button.addEventListener('click', function() {
                const row = this.closest('tr'); 
                const serviceId = row.querySelector('.service__id').textContent;
                const serviceName = row.querySelector('.service__name').textContent;
                const servicePrice = row.querySelector('.service__price').textContent;

                document.getElementById('serviceId').textContent = serviceId; 
                document.getElementById('serviceName').textContent = serviceName; 
                document.getElementById('priceValue').textContent = servicePrice.replace(' ₽', '');
                modal.style.display = 'flex'; 
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
    initializeServices();

    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    document.getElementById('saveSettings').addEventListener('click', function() {
        const serviceId = document.getElementById('serviceId').textContent;
        const updatedName = document.getElementById('serviceName').textContent; 
        const updatedPrice = document.getElementById('priceValue').textContent; 
    
        if (!updatedName || !updatedPrice || isNaN(updatedPrice) || updatedPrice <= 0) {
            alert('Пожалуйста, заполните все поля.');
            return; 
        }

        const rows = servicesTableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const idCell = row.querySelector('.service__id');
            if (idCell.textContent === serviceId) {
                row.querySelector('.service__name').textContent = updatedName;
                row.querySelector('.service__price').textContent = updatedPrice + ' ₽'; 
                row.querySelector('.service__name').contentEditable = 'false'; 
                row.querySelector('.service__price').contentEditable = 'false'; 
            }
        });
    
        
        let services = getServicesFromLocalStorage();
        services = services.map(service => 
            service.услуга_id === serviceId 
            ? { ...service, название: updatedName, цена: updatedPrice } 
            : service
        );
        saveServicesToLocalStorage(services);

        modal.style.display = 'none'; 
    });

    

    const priceValueField = document.getElementById('priceValue');
    const serviceNameField = document.getElementById('serviceName');

    priceValueField.addEventListener('keydown', handleKeyDown);
    serviceNameField.addEventListener('keydown', handleAlphabeticKey);

    function handleKeyDown(event) {
        const maxLength = getMaxLength(this.id);
        if (event.key === 'Backspace' || event.key === 'Delete' || event.key === 'Tab' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            return;
        }
        
        if (!isNumberKey(event) || this.textContent.length >= maxLength) {
            event.preventDefault();
        }
        if (this.id === 'priceValue' && this.textContent.trim() === '') {
            this.textContent = '0';
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
            case 'serviceName': return 30; 
            case 'priceValue': return 10; 
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

    
     document.getElementById('addServiceButton').addEventListener('click', function() {
        document.getElementById('newServiceName').value = ''; 
        document.getElementById('newServicePrice').value = '';
        document.getElementById('addServiceModal').style.display = 'flex';
    });

    const closeAddServiceModal = document.getElementById('closeAddServiceModal');
    closeAddServiceModal.addEventListener('click', function() {
        document.getElementById('addServiceModal').style.display = 'none';
    });
    
    document.getElementById('saveNewService').addEventListener('click', function() {
        const newServiceName = document.getElementById('newServiceName').value.trim();
        const newServicePriceInput = document.getElementById('newServicePrice');
        const newServicePrice = newServicePriceInput.value.trim();
        const priceError = document.getElementById('priceError');
        const nameError = document.getElementById('nameError');

        priceError.textContent = '';
        nameError.textContent = '';

        if (!newServiceName) {
            nameError.textContent = 'Введите название услуги.';
            return;
        } else if (!/^[a-zA-Zа-яА-Я\s]+$/.test(newServiceName)) {
            nameError.textContent = 'Название услуги может содержать только буквы.';
            return;
        }
        if (!newServiceName || !newServicePrice || isNaN(newServicePrice) || newServicePrice <= 0) return;

        
        if (newServicePrice === '' || isNaN(newServicePrice) || newServicePrice <= 0) {
            priceError.textContent = 'Введите корректную цену.';
            return;
        }
        const newServiceId = getNextServiceId();
        const newService = {
            услуга_id: String(newServiceId),
            название: newServiceName,
            цена: newServicePrice
        };

        let services = getServicesFromLocalStorage();
        services.push(newService);
        saveServicesToLocalStorage(services);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="service__id">${newService.услуга_id}</td>
            <td class="service__name">${newService.название}</td>
            <td class="service__price">${newService.цена} ₽</td>
            <td class="service__actions">
                <button class="service__button service__button--settings">Настройки</button>
                <button class="service__button service__button--delete">
                    <img src="img/delete-icon.svg" alt="Delete">
                </button>
            </td>
        `;
        servicesTableBody.appendChild(row);

        document.getElementById('newServiceName').value = '';
        document.getElementById('newServicePrice').value = '';
        addServiceModal.style.display = 'none';

        lastServiceId = newServiceId;

        attachEventHandlers();
    });

    document.getElementById('newServiceName').addEventListener('input', function() {
        const nameError = document.getElementById('nameError');
        const value = this.value;
        if (!/^[a-zA-Zа-яА-Я\s]*$/.test(value)) {
            nameError.textContent = 'Название услуги может содержать только буквы.';
            this.value = value.replace(/[^a-zA-Zа-яА-Я\s]/g, '');
        } else {
            nameError.textContent = '';
        }
    });

    document.getElementById('newServicePrice').addEventListener('input', function() {
        const maxValue = 1000000;
        const priceError = document.getElementById('priceError');
        
        if (this.value > maxValue) {
            priceError.textContent = `Цена не может превышать ${maxValue} ₽.`;
            this.value = maxValue; 
            console.log(this.value);
        } else {
            priceError.textContent = '';
        }

        if (this.value < 0) {
            priceError.textContent = 'Цена не может быть отрицательной.';
            this.value = '';
        }
    });
    
    
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    populateServices();
}