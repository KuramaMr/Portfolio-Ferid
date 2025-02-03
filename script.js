const scrollIndicator = document.querySelector('.scroll-indicator');

window.addEventListener('scroll', () => {
  const scrollPosition = window.scrollY;
  const windowHeight = window.innerHeight;
  
  if (scrollPosition > 0) {
    const opacity = 1 - (scrollPosition / (windowHeight * 0.5));
    scrollIndicator.style.opacity = opacity > 0 ? opacity : 0;
    scrollIndicator.style.visibility = opacity <= 0 ? 'hidden' : 'visible';
  } else {
    scrollIndicator.style.opacity = 1;
    scrollIndicator.style.visibility = 'visible';
  }
});

document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('#menu-toggle');
    const mainNav = document.querySelector('#main-nav');
    
    console.log('Éléments du menu :', { menuToggle, mainNav });

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Menu toggle cliqué');
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


