async function loadAdmins() {
    const adminsData = localStorage.getItem('admins');
    if (adminsData) {
        const admins = JSON.parse(adminsData);
        return admins.map(admin => ({
            ...admin,
            role: "Admin" 
        }));
    }
    return [];
}


async function loadSuperAdmins() {
    
    const response = await fetch('db/barbershop_db.json');
    const data = await response.json();

    const superAdminsTable = data.find(table => table.name === "Суперадминистратор");
    if (!superAdminsTable) {
        throw new Error('Таблица суперадминистраторов не найдена');
    }

    
    return superAdminsTable.data.map(admin => ({
        id: admin.суперадминистратор_id,
        name: admin.имя,
        login: admin.логин,
        password: admin.пароль,
        role: "Superadmin"
    }));
}

document.getElementById('authForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const authError = document.getElementById('authError');
    authError.style.display = 'none';

    try {
        
        const superAdmins = await loadSuperAdmins();
        const admins = await loadAdmins();

        
        let currentUser = superAdmins.find(user => user.login === username && user.password === password);

        
        if (!currentUser) {
            currentUser = admins.find(user => user.login === username && user.password === password);
        }

        if (currentUser) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('role', currentUser.role); 
            localStorage.setItem('currentUser', JSON.stringify(currentUser)); 
            window.location.href = 'index.html';
        } else {
            authError.textContent = 'Неверный логин или пароль';
            authError.style.display = 'block';
        }

    } catch (error) {
        authError.textContent = 'Неверный логин или пароль';
        authError.style.display = 'block';
    }
});

