import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from './firebase.config';

// Fonction de connexion
async function loginAdmin(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Stockage du token dans localStorage
        const token = await user.getIdToken();
        localStorage.setItem('auth-token', token);
        
        // Afficher les éléments d'administration
        document.getElementById('image-management').style.display = 'block';
        showNotification('Connexion réussie');
        
        return user;
    } catch (error) {
        console.error('Erreur de connexion:', error);
        showNotification('Erreur de connexion: ' + error.message, 'error');
        throw error;
    }
}

// Fonction de déconnexion
async function logoutAdmin() {
    try {
        await signOut(auth);
        localStorage.removeItem('auth-token');
        document.getElementById('image-management').style.display = 'none';
        showNotification('Déconnexion réussie');
    } catch (error) {
        console.error('Erreur de déconnexion:', error);
        showNotification('Erreur de déconnexion: ' + error.message, 'error');
    }
}

// Observer l'état de l'authentification
auth.onAuthStateChanged((user) => {
    const adminElements = document.getElementById('image-management');
    if (user) {
        adminElements.style.display = 'block';
    } else {
        adminElements.style.display = 'none';
    }
});