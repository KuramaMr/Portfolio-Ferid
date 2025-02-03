import { storage } from './firebase.config.js';
import { showNotification } from './main.js';
import { 
    ref, 
    uploadBytes, 
    getDownloadURL, 
    deleteObject
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';

// Upload d'une image
export async function uploadImage(file) {
    try {
        const storageRef = ref(storage, `images/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error('Erreur upload:', error);
        throw error;
    }
}

// Suppression d'une image
export async function deleteImage(imageUrl) {
    try {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
    } catch (error) {
        console.error('Erreur suppression:', error);
        throw error;
    }
}

// Upload d'une vidéo
export async function uploadVideo(file) {
    try {
        const storageRef = ref(storage, `videos/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error('Erreur upload vidéo:', error);
        throw error;
    }
}

// Suppression d'une vidéo
export async function deleteVideo(videoUrl) {
    try {
        const videoRef = ref(storage, videoUrl);
        await deleteObject(videoRef);
    } catch (error) {
        console.error('Erreur suppression vidéo:', error);
        throw error;
    }
}