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
    const loginForm = document.getElementById('login-form');
    const loginLink = document.getElementById('login-link');
    const logoutButton = document.getElementById('logout-button');
    const imageManagement = document.getElementById('image-management');
    const loginModal = document.getElementById('login-modal');
    const closeModal = loginModal.querySelector('.close');
    const galleryContainer = document.getElementById('gallery-container');
    const uploadForm = document.getElementById('upload-form');
    const imageManagementLink = document.getElementById('image-management-link');

    function updateUIForLoggedInUser() {
        loginLink.style.display = 'none';
        logoutButton.style.display = 'inline-block';
        imageManagementLink.style.display = 'inline-block';
        imageManagement.style.display = 'block';
        loadImages();
    }
    
    function updateUIForLoggedOutUser() {
        loginLink.style.display = 'inline-block';
        logoutButton.style.display = 'none';
        imageManagementLink.style.display = 'none';
        imageManagement.style.display = 'none';
        loadImages();
    }

    function checkAuthStatus() {
        const token = localStorage.getItem('auth-token');
        if (token) {
            updateUIForLoggedInUser();
        } else {
            updateUIForLoggedOutUser();
        }
    }

    checkAuthStatus();

    loginLink.addEventListener('click', function(e) {
        e.preventDefault();
        loginModal.style.display = 'block';
    });

    closeModal.addEventListener('click', function() {
        loginModal.style.display = 'none';
    });

    window.addEventListener('click', function(e) {
        if (e.target == loginModal) {
            loginModal.style.display = 'none';
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const API_URL = 'https://mon-portfolio-backend.onrender.com';
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const token = await response.text();
                localStorage.setItem('auth-token', token);
                showNotification('Connexion réussie !');
                loginModal.style.display = 'none';
                updateUIForLoggedInUser();
            } else {
                const error = await response.text();
                showNotification(`Erreur de connexion : ${error}`, 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showNotification('Une erreur est survenue lors de la connexion', 'error');
        }
    });

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('auth-token');
        updateUIForLoggedOutUser();
        showNotification('Vous êtes déconnecté');
    });

    async function loadImages() {
        try {
            const response = await fetch('https://mon-portfolio-backend.onrender.com/images');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const images = await response.json();
            displayImages(images);
        } catch (error) {
            console.error('Erreur lors du chargement des images:', error);
            galleryContainer.innerHTML = `<p>Erreur lors du chargement des images: ${error.message}</p>`;
        }
    }


    function displayImages(images) {
        const isAdmin = !!localStorage.getItem('auth-token');
        galleryContainer.innerHTML = images.map(image => `
            <div class="gallery-item" data-id="${image._id}">
                <div class="image-container">
                    <img src="${image.path}" alt="${image.filename}">
                </div>
                <p>${image.description || 'Pas de description'}</p>
                ${isAdmin ? `
                    <div class="admin-controls">
                        <button class="edit-btn"></button>
                        <button class="delete-btn"></button>
                    </div>
                ` : ''}
            </div>
        `).join('');

        if (isAdmin) {
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', deleteImage);
            });
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', editImage);
            });
        }
    }

    async function deleteImage(event) {
        if (!localStorage.getItem('auth-token')) return;
        const imageId = event.target.closest('.gallery-item').dataset.id;
        if (confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) {
            try {
                const response = await fetch(`https://mon-portfolio-backend.onrender.com/image/${imageId}`, {
                    method: 'DELETE',
                    headers: {
                        'auth-token': localStorage.getItem('auth-token')
                    }
                });
                if (response.ok) {
                    showNotification('Image supprimée avec succès');
                    loadImages();
                } else {
                    const error = await response.text();
                    showNotification(`Erreur lors de la suppression : ${error}`, 'error');
                }
            } catch (error) {
                console.error('Erreur:', error);
                showNotification('Une erreur est survenue lors de la suppression', 'error');
            }
        }
    }

    function editImage(event) {
        if (!localStorage.getItem('auth-token')) return;
        const imageItem = event.target.closest('.gallery-item');
        const imageId = imageItem.dataset.id;
        const currentDescription = imageItem.querySelector('p').textContent;
        
        const newDescription = prompt('Entrez la nouvelle description:', currentDescription);
        
        if (newDescription !== null && newDescription !== currentDescription) {
            updateImageDescription(imageId, newDescription);
        }
    }

    async function updateImageDescription(imageId, newDescription) {
        try {
            const response = await fetch(`https://mon-portfolio-backend.onrender.com/image/${imageId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('auth-token')
                },
                body: JSON.stringify({ description: newDescription })
            });
            if (response.ok) {
                showNotification('Description mise à jour avec succès');
                loadImages();
            } else {
                const error = await response.text();
                showNotification(`Erreur lors de la mise à jour : ${error}`, 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showNotification('Une erreur est survenue lors de la mise à jour', 'error');
        }
    }

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(uploadForm);

        try {
            const response = await fetch('https://mon-portfolio-backend.onrender.com/upload-image', {
                method: 'POST',
                headers: {
                    'auth-token': localStorage.getItem('auth-token')
                },
                body: formData
            });

            if (response.ok) {
                showNotification('Image uploadée avec succès');
                loadImages();
            } else {
                const error = await response.text();
                showNotification(`Erreur lors de l'upload : ${error}`, 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showNotification('Une erreur est survenue lors de l\'upload', 'error');
        }
    });

    const topLink = document.getElementById('top-link');
    
    topLink.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    const fileInput = document.getElementById('image-upload');
    const fileLabel = document.querySelector('.custom-file-upload');

    if (fileLabel) {
        fileLabel.addEventListener('click', function(e) {
            e.preventDefault();
            fileInput.click();
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const fileName = e.target.files[0] ? e.target.files[0].name : 'Aucun fichier choisi';
            fileLabel.textContent = fileName;
        });
    }

    if (imageManagementLink) {
        imageManagementLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (imageManagement) {
                imageManagement.style.display = 'block';
                imageManagement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    loadImages();

    // Initialisation AOS
    AOS.init({
        duration: 2000,
        once: true,
        offset: 300
    });

    // Réinitialise la position de défilement
    window.scrollTo(0, 0);

    // Animation du texte d'accueil
    function initTypewriter() {
        const text = document.getElementById('typed-text');
        if (!text) return;
        
        const string = text.textContent;
        text.innerHTML = '';
        
        function addLetter(index) {
            if (index < string.length) {
                const letter = document.createElement('span');
                letter.className = 'letter';
                letter.textContent = string[index];
                text.appendChild(letter);
                setTimeout(() => addLetter(index + 1), 50);
            }
        }
        
        setTimeout(() => addLetter(0), 500);
    }

    // Gestion du menu mobile
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');
    
    menuToggle?.addEventListener('click', () => {
        mainNav.classList.toggle('show');
        menuToggle.classList.toggle('active');
    });

    // Gestion du formulaire de contact
    const contactForm = document.getElementById('contact-form');
    const messageInput = document.getElementById('message');
    const charCount = document.getElementById('char-count');
    const messageError = document.getElementById('message-error');
    const MIN_CHARS = 50;

    messageInput?.addEventListener('input', function() {
        const remainingChars = MIN_CHARS - this.value.length;
        charCount.textContent = `(${this.value.length}/${MIN_CHARS} caractères minimum)`;
        
        if (remainingChars > 0) {
            messageError.style.display = 'block';
            messageError.textContent = `Il manque ${remainingChars} caractère${remainingChars > 1 ? 's' : ''}.`;
        } else {
            messageError.style.display = 'none';
        }
    });

    // Démarrer l'animation du texte
    initTypewriter();
});

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    const container = document.getElementById('notification-container');
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            container.removeChild(notification);
        }, 300);
    }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    // Fermer le menu quand on clique sur un lien
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', () => {
            mainNav.classList.remove('show');
        });
    });
});


