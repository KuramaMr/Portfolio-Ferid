import { storage } from './firebase.config.js';
import { showNotification } from './main.js';
import { 
    ref, 
    uploadBytes, 
    getDownloadURL, 
    deleteObject,
    listAll
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';

// Upload d'une image
export async function uploadImage(file) {
    try {
        const storageRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        showNotification('Image uploadée avec succès');
        return downloadURL;
    } catch (error) {
        console.error('Erreur upload:', error);
        showNotification('Erreur lors de l\'upload: ' + error.message, 'error');
        throw error;
    }
}

// Suppression d'une image
export async function deleteImage(imageUrl) {
    try {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
        showNotification('Image supprimée avec succès');
    } catch (error) {
        console.error('Erreur suppression:', error);
        showNotification('Erreur lors de la suppression: ' + error.message, 'error');
        throw error;
    }
}

// Récupération de toutes les images
async function getAllImages() {
    try {
        const listRef = ref(storage, 'gallery');
        const res = await listAll(listRef);
        const urls = await Promise.all(
            res.items.map(itemRef => getDownloadURL(itemRef))
        );
        return urls;
    } catch (error) {
        console.error('Erreur récupération:', error);
        throw error;
    }
}
