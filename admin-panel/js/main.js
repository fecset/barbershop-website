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

