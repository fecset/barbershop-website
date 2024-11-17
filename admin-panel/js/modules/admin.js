export function initAdmin() {
    const adminsTableBody = document.getElementById('adminsTableBody');
    const addAdminButton = document.getElementById('addAdminButton');
    const addAdminModal = document.getElementById('addAdminModal');
    const closeAddAdminModal = document.getElementById('closeAddAdminModal');
    const adminSettingsModal = document.getElementById('adminSettingsModal');
    const closeAdminModal = document.getElementById('closeAdminModal');
    let currentAdminRow;

    async function loadAdminsFromJson() {
        const response = await fetch('db/barbershop_db.json');
        if (!response.ok) {
            console.error('Ошибка загрузки данных:', response.status);
            throw new Error('Ошибка загрузки данных');
        }
        const data = await response.json();
        
        const adminsTable = data.find(table => table.name === "Администратор");
        if (!adminsTable) {
            console.error('Таблица администраторов не найдена');
            throw new Error('Таблица администраторов не найдена');
        }
        
        const admins = adminsTable.data.map(admin => ({
            id: parseInt(admin.администратор_id, 10),
            name: admin.имя,
            login: admin.логин,
            password: admin.пароль
        }));
    
        saveAdminsToLocalStorage(admins);
        return admins;
    }
  
    function getAdminsFromLocalStorage() {
        const admins = localStorage.getItem('admins');
        return admins ? JSON.parse(admins) : [];
    }
    
    function saveAdminsToLocalStorage(admins) {
        localStorage.setItem('admins', JSON.stringify(admins));
    }

    function generateNewAdminId() {
        const admins = getAdminsFromLocalStorage();
        if (admins.length > 0) {
            return Math.max(...admins.map(admin => parseInt(admin.id, 10))) + 1;
        }
        return 1;
    }

    async function initializeAdmins() {
        let admins = getAdminsFromLocalStorage();
        if (!admins || admins.length === 0) {
            admins = await loadAdminsFromJson();
        }
        populateAdmins();
    }
    function togglePasswordView(index) {
        const passwordSpan = document.getElementById(`password-${index}`);
        const toggleButton = document.querySelector(`#togglePassword-${index} img`);
    
        if (!passwordSpan) {
            return;
        }
    
        
        const admins = getAdminsFromLocalStorage();
        const admin = admins[index];
    
        if (!admin) {
            return;
        }
    
        const password = admin.password; 
    
        if (passwordSpan.classList.contains('password-hidden')) {
            passwordSpan.textContent = password; 
            passwordSpan.classList.remove('password-hidden');
            toggleButton.src = "img/eye-off-icon.svg"; 
        } else {
            passwordSpan.textContent = '*'.repeat(password.length); 
            passwordSpan.classList.add('password-hidden');
            toggleButton.src = "img/eye-icon.svg"; 
        }
    }
    
    window.togglePasswordView = togglePasswordView;
    

    function populateAdmins() {
        const admins = getAdminsFromLocalStorage();
        adminsTableBody.innerHTML = ''; 
    
        admins.forEach((admin, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="admin-id">${admin.id}</td>
                <td class="admin-name">${admin.name}</td>
                <td class="admin-login">${admin.login}</td>
                <td class="admin-password">
                    <span id="password-${index}" class="password-hidden">
                        ${'*'.repeat(admin.password.length)}
                    </span>
                    <button id="togglePassword-${index}" class="toggle-password">
                        <img src="img/eye-icon.svg" alt="Show password" width="20px">
                    </button>
                </td>
                <td class="admin-actions">
                    <button class="admin-button admin-button--settings">Настройки</button>
                    <button class="admin-button admin-button--delete">
                        <img src="img/delete-icon.svg" alt="Delete">
                    </button>
                </td>
            `;
            adminsTableBody.appendChild(row);
    
            
            document.getElementById(`togglePassword-${index}`).addEventListener('click', () => {
                togglePasswordView(index);
            });
        });
    
        attachEventHandlers();
    }
    
    
    function attachEditIconHandlers() {
        const editIcons = document.querySelectorAll('.edit-icon');
        editIcons.forEach(icon => {
            icon.addEventListener('click', function () {
                const fieldToEdit = this.closest('td').querySelector('span');
                fieldToEdit.contentEditable = 'true';
                fieldToEdit.focus();
    
                
                fieldToEdit.addEventListener('keydown', function (event) {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        fieldToEdit.contentEditable = 'false'; 
                    }
                });
            });
        });
    }
    
    function attachEventHandlers() {
        document.querySelectorAll('.admin-button--delete').forEach(button => {
            button.addEventListener('click', function () {
                const row = this.closest('tr');
                const adminId = row.querySelector('.admin-id').textContent;
    
                let admins = getAdminsFromLocalStorage();
                admins = admins.filter(admin => admin.id !== parseInt(adminId, 10));
                saveAdminsToLocalStorage(admins);
    
                populateAdmins();

                if (admins.length === 0) {
                    loadAdminsFromJson().then(newAdmins => {
                        saveAdminsToLocalStorage(newAdmins);
                    });
                }
            });
        });
    
        document.querySelectorAll('.admin-button--settings').forEach(button => {
            button.addEventListener('click', function () {
                currentAdminRow = this.closest('tr');
                const adminId = currentAdminRow.querySelector('.admin-id').textContent.trim();
                const adminName = currentAdminRow.querySelector('.admin-name').textContent;
                const adminLogin = currentAdminRow.querySelector('.admin-login').textContent;
    
                const admin = getAdminsFromLocalStorage().find(admin => String(admin.id) === adminId);
                if (!admin) {
                    return;
                }
    
                document.getElementById('adminId').textContent = adminId;
                document.getElementById('adminName').textContent = adminName;
                document.getElementById('adminLogin').textContent = adminLogin;
    
                const passwordSpan = document.getElementById('adminPassword');
                passwordSpan.setAttribute('data-password', admin.password); 
                passwordSpan.textContent = admin.password; 
                passwordSpan.classList.add('password-hidden'); 
    
                adminSettingsModal.style.display = 'flex';
            });
        });
    }

    function restrictInputForAdminName(event) {
        const maxLength = 30; 
        const value = event.target.textContent.trim();
    
        
        if ([8, 9, 27, 13, 37, 38, 39, 40].includes(event.keyCode)) {
            return; 
        }
    
        
        if (!/^[a-zA-Zа-яА-Я\s]*$/.test(event.key)) {
            event.preventDefault(); 
        }
    
        
        if (value.length >= maxLength) {
            event.preventDefault(); 
        }
    }
    
    function restrictInputForAdminLogin(event) {
        const maxLength = 25; 
        const value = event.target.textContent.trim();
    
        
        if ([8, 9, 27, 13, 37, 38, 39, 40].includes(event.keyCode)) {
            return; 
        }
    
        
        if (!/^[^\s]+$/.test(event.key) || !/^[a-zA-Z0-9]*$/.test(event.key)) {
            event.preventDefault(); 
        }
    
        
        if (value.length >= maxLength) {
            event.preventDefault(); 
        }
    }
    
    function restrictInputForAdminPassword(event) {
        const maxLength = 30; 
        const value = event.target.textContent.trim();
    
        
        if ([8, 9, 27, 13, 37, 38, 39, 40].includes(event.keyCode)) {
            return; 
        }
    
        
        if (event.key === ' ') {
            event.preventDefault(); 
        }
    
        
        if (value.length >= maxLength) {
            event.preventDefault(); 
        }
    }
    
    
    document.getElementById('adminName').addEventListener('keydown', restrictInputForAdminName);
    document.getElementById('adminLogin').addEventListener('keydown', restrictInputForAdminLogin);
    document.getElementById('adminPassword').addEventListener('keydown', restrictInputForAdminPassword);
    

    addAdminButton.addEventListener('click', function () {
        document.getElementById('newAdminName').value = '';
        document.getElementById('newAdminLogin').value = '';
        document.getElementById('newAdminPassword').value = '';
        addAdminModal.style.display = 'flex';
    });

    closeAddAdminModal.addEventListener('click', function () {
        addAdminModal.style.display = 'none';
    });

    closeAdminModal.addEventListener('click', function () {
        adminSettingsModal.style.display = 'none';
    });


    
    function validateAdminInput() {
        const nameError = document.getElementById('adminNameError');
        const loginError = document.getElementById('loginError');
        const passwordError = document.getElementById('passwordError');
    
        const newAdminName = document.getElementById('newAdminName').value.trim();
        const newAdminLogin = document.getElementById('newAdminLogin').value.trim();
        const newAdminPassword = document.getElementById('newAdminPassword').value.trim();
    
        
        nameError.textContent = '';
        loginError.textContent = '';
        passwordError.textContent = '';
    
        
        if (!newAdminName || newAdminName.length < 2) {
            nameError.textContent = 'Имя администратора должно содержать не менее 2 символов.';
            return false;
        } else if (!/^[a-zA-Zа-яА-Я\s]+$/.test(newAdminName)) {
            nameError.textContent = 'Имя администратора может содержать только буквы.';
            return false;
        }
    
        
        if (!newAdminLogin || newAdminLogin.length < 5) {
            loginError.textContent = 'Логин администратора должен содержать не менее 5 символов.';
            return false;
        }
    
        
        if (!newAdminPassword || newAdminPassword.length < 8) {
            passwordError.textContent = 'Пароль администратора должен содержать не менее 8 символов.';
            return false;
        }
    
        return true; 
    }
    
    function toggleSaveButton() {
        const adminName = document.getElementById('adminName').textContent.trim();
        const adminLogin = document.getElementById('adminLogin').textContent.trim();
        const adminPassword = document.getElementById('adminPassword').textContent.trim();
        const saveButton = document.getElementById('saveAdminSettings');
    
        if (adminName && adminLogin && adminPassword) {
            saveButton.disabled = false; 
        } else {
            saveButton.disabled = true; 
        }
    }
    
    
    document.getElementById('adminName').addEventListener('input', function() {
        
        if (this.textContent.length > 30) {
            this.textContent = this.textContent.slice(0, 30);
        }
        toggleSaveButton(); 
    });
    
    
    document.getElementById('adminLogin').addEventListener('input', function() {
        
        this.textContent = this.textContent.replace(/\s/g, '');
        if (this.textContent.length > 25) {
            this.textContent = this.textContent.slice(0, 25); 
        }
        toggleSaveButton(); 
    });
    
    document.getElementById('adminPassword').addEventListener('input', function() {
        
        this.textContent = this.textContent.replace(/\s/g, '');
        if (this.textContent.length > 30) {
            this.textContent = this.textContent.slice(0, 30); 
        }
        toggleSaveButton(); 
    });
    
    
    document.getElementById('saveAdminSettings').disabled = true;

    document.getElementById('saveNewAdmin').addEventListener('click', function () {
        if (!validateAdminInput()) return; 
    
        const newAdminName = document.getElementById('newAdminName').value.trim();
        const newAdminLogin = document.getElementById('newAdminLogin').value.trim();
        const newAdminPassword = document.getElementById('newAdminPassword').value.trim();
    
        const newAdmin = {
            id: generateNewAdminId(),
            name: newAdminName,
            login: newAdminLogin,
            password: newAdminPassword
        };
    
        let admins = getAdminsFromLocalStorage();
        admins.push(newAdmin);
        saveAdminsToLocalStorage(admins);
    
        populateAdmins();
        addAdminModal.style.display = 'none';
    });
    

    document.getElementById('saveAdminSettings').addEventListener('click', function () {
        const adminId = document.getElementById('adminId').textContent.trim();
        const adminName = document.getElementById('adminName').textContent.trim();
        const adminLogin = document.getElementById('adminLogin').textContent.trim();
        const adminPassword = document.getElementById('adminPassword').textContent.trim();
    
        
        if (!adminName || !adminLogin || !adminPassword) {
            alert('Все поля должны быть заполнены.'); 
            return;
        }
    
        let admins = getAdminsFromLocalStorage();
        const adminIndex = admins.findIndex(admin => admin.id === parseInt(adminId, 10));
    
        if (adminIndex !== -1) {
            admins[adminIndex] = { 
                ...admins[adminIndex], 
                name: adminName, 
                login: adminLogin, 
                password: adminPassword 
            };
            saveAdminsToLocalStorage(admins);
            populateAdmins();
            adminSettingsModal.style.display = 'none';
        }
    });
    

    window.addEventListener('click', function (event) {
        if (event.target === adminSettingsModal) {
            adminSettingsModal.style.display = 'none';
        }
        if (event.target === addAdminModal) {
            addAdminModal.style.display = 'none';
        }
    });
    

    document.getElementById('newAdminName').addEventListener('input', function() {
        document.getElementById('adminNameError').textContent = '';
    });

    document.getElementById('newAdminLogin').addEventListener('input', function() {
        document.getElementById('loginError').textContent = '';
    });

    document.getElementById('newAdminPassword').addEventListener('input', function() {
        document.getElementById('passwordError').textContent = '';
    });


    initializeAdmins();
}
