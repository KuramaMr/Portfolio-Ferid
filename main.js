import { auth } from './firebase.config.js';
import { 
    signInWithEmailAndPassword, 
    signOut 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { 
    collection, 
    addDoc, 
    deleteDoc, 
    updateDoc, 
    getDocs, 
    doc 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { 
    ref, 
    uploadBytes, 
    getDownloadURL, 
    deleteObject 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';
import { uploadImage, deleteImage } from './storage.js';
import { 
    addImageMetadata, 
    getImagesWithMetadata, 
    deleteImageMetadata,
    updateImageDescription 
} from './database.js';

// Au début du fichier, après les imports
let currentUser = null;

// Initialisation de la galerie
document.addEventListener('DOMContentLoaded', () => {
    // Ajouter l'écouteur d'état d'authentification
    auth.onAuthStateChanged((user) => {
        currentUser = user;
        if (user) {
            // Utilisateur connecté
            document.getElementById('admin-btn').textContent = 'DÉCONNEXION';
            document.getElementById('image-management').style.display = 'block';
        } else {
            // Utilisateur déconnecté
            document.getElementById('admin-btn').textContent = 'ADMIN';
            document.getElementById('image-management').style.display = 'none';
        }
    });

    loadGallery();
    setupEventListeners();
    setupContactForm();
    console.log('Page chargée'); // Pour déboguer
});

// Chargement de la galerie
async function loadGallery() {
    try {
        const images = await getImagesWithMetadata();
        displayImages(images);
    } catch (error) {
        showNotification('Erreur de chargement de la galerie', 'error');
    }
}

// Affichage des images
function displayImages(images) {
    const galleryContainer = document.getElementById('gallery-container');
    galleryContainer.innerHTML = '';

    images.forEach(image => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.dataset.id = image.id;

        item.innerHTML = `
            <img src="${image.url}" alt="${image.description}">
            <p>${image.description}</p>
            ${auth.currentUser ? `
                <div class="admin-controls">
                    <button class="edit-btn"></button>
                    <button class="delete-btn"></button>
                </div>
            ` : ''}
        `;

        galleryContainer.appendChild(item);
    });
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    const adminBtn = document.getElementById('admin-btn');
    const modal = document.getElementById('login-modal');
    const closeBtn = modal.querySelector('.close');

    // Vérifier l'état de connexion au chargement
    auth.onAuthStateChanged((user) => {
        currentUser = user;
        if (user) {
            // Utilisateur connecté
            animateStateChange(adminBtn, 'DÉCONNEXION');
            adminBtn.removeEventListener('click', openModal);
            adminBtn.addEventListener('click', handleLogout);
            modal.style.display = 'none';
        } else {
            // Utilisateur déconnecté
            animateStateChange(adminBtn, 'ADMIN');
            adminBtn.removeEventListener('click', handleLogout);
            adminBtn.addEventListener('click', openModal);
        }
    });

    function animateStateChange(button, newText) {
        button.classList.add('animating');
        setTimeout(() => {
            button.textContent = newText;
        }, 250); // Change le texte au milieu de l'animation
        setTimeout(() => {
            button.classList.remove('animating');
        }, 500); // Retire la classe d'animation à la fin
    }

    function openModal(e) {
        e.preventDefault();
        modal.style.display = 'block';
    }

    const loginForm = document.getElementById('login-form');
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('admin-email').value;
        const password = document.getElementById('admin-password').value;
        
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Stocker le message de notification
            localStorage.setItem('notification', JSON.stringify({
                message: 'Connexion réussie',
                type: 'success'
            }));
            window.location.reload();
        } catch (error) {
            console.error('Erreur de connexion:', error);
            showNotification('Erreur de connexion: ' + error.message, 'error');
        }
    });

    async function handleLogout(e) {
        e.preventDefault();
        try {
            await signOut(auth);
            // Stocker le message de notification
            localStorage.setItem('notification', JSON.stringify({
                message: 'Déconnexion réussie',
                type: 'success'
            }));
            window.location.reload();
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
            showNotification('Erreur lors de la déconnexion', 'error');
        }
    }

    // Vérifier s'il y a une notification en attente
    const pendingNotification = localStorage.getItem('notification');
    if (pendingNotification) {
        const { message, type } = JSON.parse(pendingNotification);
        setTimeout(() => {
            showNotification(message, type);
        }, 100); // Petit délai pour s'assurer que le DOM est prêt
        localStorage.removeItem('notification'); // Nettoyer après affichage
    }

    closeBtn?.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Gestion du formulaire d'upload
    const uploadForm = document.getElementById('upload-form');
    const fileInput = document.getElementById('image-upload');
    const fileLabel = document.querySelector('.custom-file-upload');
    const fileNameDisplay = document.createElement('div');
    fileNameDisplay.className = 'file-name';
    fileLabel.after(fileNameDisplay);

    fileInput?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            fileNameDisplay.textContent = file.name;
            fileNameDisplay.style.display = 'block';
        } else {
            fileNameDisplay.textContent = '';
            fileNameDisplay.style.display = 'none';
        }
    });

    uploadForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const file = fileInput.files[0];
        const description = document.getElementById('image-description').value;

        try {
            const imageUrl = await uploadImage(file);
            await addImageMetadata(imageUrl, description);
            loadGallery();
            showNotification('Image ajoutée avec succès');
            
            // Réinitialiser le formulaire et l'affichage du nom de fichier
            uploadForm.reset();
            fileNameDisplay.textContent = '';
            fileNameDisplay.style.display = 'none';
            
        } catch (error) {
            showNotification('Erreur lors de l\'ajout de l\'image', 'error');
        }
    });

    // Gestion des clics sur la galerie (édition et suppression)
    document.getElementById('gallery-container').addEventListener('click', async (e) => {
        if (!auth.currentUser) return;

        const galleryItem = e.target.closest('.gallery-item');
        if (!galleryItem) return;

        if (e.target.classList.contains('edit-btn')) {
            handleEdit(galleryItem);
        } else if (e.target.classList.contains('delete-btn')) {
            handleDelete(galleryItem);
        }
    });
}

// Gestion de l'édition
async function handleEdit(galleryItem) {
    const imageId = galleryItem.dataset.id;
    const currentDescription = galleryItem.querySelector('p').textContent;
    const newDescription = prompt('Nouvelle description:', currentDescription);

    if (newDescription && newDescription !== currentDescription) {
        try {
            await updateImageDescription(imageId, newDescription);
            loadGallery();
        } catch (error) {
            showNotification('Erreur lors de la modification', 'error');
        }
    }
}

// Gestion de la suppression
async function handleDelete(galleryItem) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) return;

    try {
        const imageId = galleryItem.dataset.id;
        const imageUrl = galleryItem.querySelector('img').src;
        await deleteImage(imageUrl);
        await deleteImageMetadata(imageId);
        loadGallery();
    } catch (error) {
        showNotification('Erreur lors de la suppression', 'error');
    }
}

// Fonction utilitaire pour les notifications
export function showNotification(message, type = 'success') {
    // Créer le conteneur de notification s'il n'existe pas
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        document.body.appendChild(container);
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    container.appendChild(notification);

    // Déclencher l'animation d'entrée
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Supprimer la notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            container.removeChild(notification);
        }, 300);
    }, 3000);
}

// Fonctions d'authentification
async function loginAdmin(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Activer la persistance
        await auth.setPersistence('LOCAL');
        
        showNotification('Connexion réussie');
        return user;
    } catch (error) {
        showNotification('Erreur de connexion: ' + error.message, 'error');
        throw error;
    }
}

async function logoutAdmin() {
    try {
        await signOut(auth);
        document.getElementById('image-management').style.display = 'none';
        showNotification('Déconnexion réussie');
    } catch (error) {
        showNotification('Erreur de déconnexion: ' + error.message, 'error');
    }
}

// Export des fonctions nécessaires
export {
    loginAdmin,
    logoutAdmin,
    loadGallery
};

// Définir l'URL du backend
const BACKEND_URL = '/.netlify/functions';

// Gestion du formulaire de contact
function setupContactForm() {
    const contactForm = document.getElementById('contact-form');
    const messageInput = document.getElementById('message');
    const charCount = document.getElementById('char-count');
    const messageError = document.getElementById('message-error');
    const MIN_CHARS = 50;

    // Mise à jour du compteur de caractères en temps réel
    messageInput?.addEventListener('input', function() {
        const remainingChars = MIN_CHARS - this.value.length;
        const currentLength = this.value.length;
        
        charCount.textContent = `(${currentLength}/${MIN_CHARS} caractères minimum)`;
        charCount.style.color = currentLength >= MIN_CHARS ? 'var(--gold)' : '#ff6b6b';
        
        if (remainingChars > 0) {
            messageError.style.display = 'block';
            messageError.textContent = `Il manque ${remainingChars} caractère${remainingChars > 1 ? 's' : ''}.`;
        } else {
            messageError.style.display = 'none';
        }
    });

    contactForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (messageInput.value.length < MIN_CHARS) {
            showNotification('Le message est trop court', 'error');
            return;
        }

        const submitButton = contactForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Envoi en cours...';

        try {
            const formData = new FormData(contactForm);
            const response = await fetch(`${BACKEND_URL}/submitForm`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nom: formData.get('nom'),
                    email: formData.get('email'),
                    message: formData.get('message')
                }),
            });

            if (response.ok) {
                showNotification('Message envoyé avec succès !');
                contactForm.reset();
                charCount.textContent = `(0/${MIN_CHARS} caractères minimum)`;
                charCount.style.color = '#ff6b6b';
            } else {
                const errorText = await response.text();
                throw new Error(errorText || 'Erreur lors de l\'envoi du message');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showNotification('Erreur lors de l\'envoi : ' + error.message, 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Envoyer';
        }
    });
} 