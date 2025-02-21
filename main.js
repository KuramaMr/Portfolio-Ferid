import { auth } from './firebase.config.js';
import { 
    signInWithEmailAndPassword, 
    signOut 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { 
    uploadImage, 
    uploadVideo, 
    deleteImage, 
    deleteVideo 
} from './storage.js';
import { 
    addImageMetadata, 
    addVideoMetadata,
    getImagesWithMetadata,
    getVideosWithMetadata,
    deleteImageMetadata,
    deleteVideoMetadata,
    updateMediaDescription
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

    const heroImage = document.querySelector('.hero-image');
    const heroContent = document.querySelector('.hero-content');

    // Fonction pour créer l'effet 3D
    function create3DEffect(container, image) {
        let rafId = null;

        container.addEventListener('mousemove', (e) => {
            if (rafId) {
                cancelAnimationFrame(rafId);
            }

            rafId = requestAnimationFrame(() => {
                const rect = container.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const moveX = (x - centerX) / 30;
                const moveY = (y - centerY) / 30;
                
                image.style.transform = `
                    translate3d(0, 0, 0)
                    rotateY(${moveX}deg)
                    rotateX(${-moveY}deg)
                `;
            });
        });

        container.addEventListener('mouseleave', () => {
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
            image.style.transform = 'translate3d(0, 0, 0) rotateY(0) rotateX(0)';
        });
    }

    // Appliquer l'effet aux deux images
    create3DEffect(heroContent, heroImage);

    const imageContainer = document.querySelector('.image-container');
    const borderedImage = imageContainer.querySelector('.bordered-image');
    create3DEffect(imageContainer, borderedImage);
});

// Fonction pour charger tous les médias
async function loadGallery() {
    try {
        const [images, videos] = await Promise.all([
            getImagesWithMetadata(),
            getVideosWithMetadata()
        ]);
        
        displayMedia([...images, ...videos]);
    } catch (error) {
        console.error('Erreur chargement galerie:', error);
        showNotification('Erreur lors du chargement de la galerie', 'error');
    }
}

// Fonction pour afficher les médias
function displayMedia(mediaItems) {
    const galleryContainer = document.getElementById('gallery-container');
    galleryContainer.innerHTML = '';

    mediaItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    mediaItems.forEach(item => {
        const mediaElement = document.createElement('div');
        mediaElement.className = 'gallery-item';
        mediaElement.dataset.id = item.id;
        mediaElement.dataset.type = item.type; // Utiliser le type des métadonnées

        const content = item.type === 'video'
            ? `<video src="${item.url}" controls preload="metadata"></video>`
            : `<img src="${item.url}" alt="${item.description}">`;

        mediaElement.innerHTML = `
            ${content}
            <p class="gallery-description">${item.description}</p>
            ${auth.currentUser ? `
                <div class="admin-controls">
                    <button class="edit-btn" title="Modifier"></button>
                    <button class="delete-btn" title="Supprimer"></button>
                </div>
            ` : ''}
        `;

        galleryContainer.appendChild(mediaElement);
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
    const fileInput = document.getElementById('media-upload');
    const mediaType = document.getElementById('media-type');
    const fileNameDisplay = document.getElementById('selected-file-name');
    
    uploadForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const file = fileInput.files[0];
        const type = mediaType.value;
        const description = document.getElementById('media-description').value;

        try {
            let mediaUrl;
            if (type === 'video') {
                mediaUrl = await uploadVideo(file);
                await addVideoMetadata(mediaUrl, description);
            } else {
                mediaUrl = await uploadImage(file);
                await addImageMetadata(mediaUrl, description);
            }

            loadGallery();
            uploadForm.reset();
            showNotification(`${type === 'video' ? 'Vidéo' : 'Image'} ajoutée avec succès`);
        } catch (error) {
            console.error('Erreur:', error);
            showNotification(`Erreur lors de l'ajout: ${error.message}`, 'error');
        }
    });

    fileInput.addEventListener('change', (e) => {
        const fileName = e.target.files[0]?.name;
        fileNameDisplay.textContent = fileName ? `Fichier sélectionné : ${fileName}` : '';
    });

    // Gestion des clics sur la galerie (édition et suppression)
    document.getElementById('gallery-container').addEventListener('click', async (e) => {
        if (!auth.currentUser) return;

        const mediaElement = e.target.closest('.gallery-item');
        if (!mediaElement) return;

        if (e.target.classList.contains('edit-btn')) {
            handleEdit(mediaElement);
        } else if (e.target.classList.contains('delete-btn')) {
            handleDelete(mediaElement);
        }
    });
}

// Gestion de l'édition
async function handleEdit(mediaElement) {
    const id = mediaElement.dataset.id;
    const type = mediaElement.dataset.type;
    const currentDescription = mediaElement.querySelector('p').textContent;
    const newDescription = prompt('Nouvelle description:', currentDescription);

    if (newDescription && newDescription !== currentDescription) {
        try {
            await updateMediaDescription(id, newDescription, type);
            loadGallery();
            showNotification('Description mise à jour avec succès');
        } catch (error) {
            console.error('Erreur modification:', error);
            showNotification('Erreur lors de la modification', 'error');
        }
    }
}

// Gestion de la suppression
async function handleDelete(mediaElement) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce média ?')) return;

    try {
        const id = mediaElement.dataset.id;
        const isVideo = mediaElement.dataset.type === 'video';
        
        // Extraire l'URL complète du média
        const mediaUrl = isVideo 
            ? mediaElement.querySelector('video').src 
            : mediaElement.querySelector('img').src;
            
        // Extraire le chemin relatif de l'URL complète
        const fullPath = decodeURIComponent(mediaUrl.split('/o/')[1].split('?')[0]);
        
        console.log('Type:', isVideo ? 'video' : 'image');
        console.log('URL complète:', mediaUrl);
        console.log('Chemin relatif:', fullPath);

        // 1. D'abord supprimer de la base de données
        try {
            if (isVideo) {
                await deleteVideoMetadata(id);
            } else {
                await deleteImageMetadata(id);
            }
        } catch (error) {
            console.error('Erreur suppression métadonnées:', error);
            throw error;
        }

        // 2. Ensuite supprimer du storage
        try {
            if (isVideo) {
                await deleteVideo(fullPath);
            } else {
                await deleteImage(fullPath);
            }
        } catch (error) {
            console.error('Erreur suppression fichier:', error);
            throw error;
        }

        // 3. Supprimer l'élément du DOM immédiatement
        mediaElement.remove();
        
        // 4. Recharger la galerie pour s'assurer que tout est à jour
        await loadGallery();
        
        showNotification(`${isVideo ? 'Vidéo' : 'Image'} supprimée avec succès`);
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        showNotification('Erreur lors de la suppression: ' + error.message, 'error');
        // En cas d'erreur, recharger la galerie pour s'assurer de l'état correct
        await loadGallery();
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