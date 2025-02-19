// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    // Gestion du menu mobile
    const menuToggle = document.querySelector('#menu-toggle');
    const mainNav = document.querySelector('#main-nav');
    
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            mainNav.classList.toggle('show');
            menuToggle.classList.toggle('active');
        });

        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('show');
                menuToggle.classList.remove('active');
            });
        });

        document.addEventListener('click', function(e) {
            if (!mainNav.contains(e.target) && !menuToggle.contains(e.target)) {
                mainNav.classList.remove('show');
                menuToggle.classList.remove('active');
            }
        });
    }

    // Gestion des liens de contact
    const contactButton = document.querySelector('.contact-btn');
    if (contactButton) {
        contactButton.addEventListener('click', function(e) {
            e.preventDefault();
            const targetHref = this.getAttribute('href');
            window.location.href = targetHref;
            
            setTimeout(() => {
                const yOffset = -150;
                const targetId = targetHref.split('#')[1];
                const element = document.querySelector('#' + targetId);
                if (element) {
                    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({top: y, behavior: 'smooth'});
                }
            }, 100);
        });
    }
});

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.setAttribute('role', 'alert');
    notification.textContent = message;
    
    const container = document.getElementById('notification-container') || document.body;
    container.appendChild(notification);
    
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });

    setTimeout(() => {
        notification.classList.remove('show');
        notification.addEventListener('transitionend', () => {
            container.removeChild(notification);
        }, { once: true });
    }, 3000);
}


