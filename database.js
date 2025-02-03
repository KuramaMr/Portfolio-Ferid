import { db } from './firebase.config.js';
import { 
    collection, 
    addDoc, 
    deleteDoc, 
    updateDoc, 
    getDocs, 
    doc 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Structure de la collection
const imagesCollection = collection(db, 'images');
const videosCollection = collection(db, 'videos');

// Ajouter une nouvelle image avec ses métadonnées
export async function addImageMetadata(imageUrl, description) {
    try {
        return await addDoc(imagesCollection, {
            url: imageUrl,
            description: description,
            type: 'image',
            createdAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Erreur ajout métadonnées:', error);
        throw error;
    }
}

// Mise à jour de la description d'un média (image ou vidéo)
export async function updateMediaDescription(id, newDescription, type) {
    try {
        const collection = type === 'video' ? videosCollection : imagesCollection;
        const mediaDoc = doc(collection, id);
        await updateDoc(mediaDoc, {
            description: newDescription
        });
    } catch (error) {
        console.error('Erreur mise à jour:', error);
        throw error;
    }
}

// Récupérer toutes les images avec leurs métadonnées
export async function getImagesWithMetadata() {
    try {
        const querySnapshot = await getDocs(imagesCollection);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Erreur récupération:', error);
        throw error;
    }
}

export async function deleteImageMetadata(imageId) {
    try {
        await deleteDoc(doc(db, 'images', imageId));
    } catch (error) {
        console.error('Erreur suppression métadonnées:', error);
        throw error;
    }
}

// Nouvelle fonction pour les métadonnées des vidéos
export async function addVideoMetadata(videoUrl, description) {
    try {
        return await addDoc(videosCollection, {
            url: videoUrl,
            description: description,
            type: 'video',
            createdAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Erreur ajout métadonnées vidéo:', error);
        throw error;
    }
}

// Récupérer toutes les vidéos avec leurs métadonnées
export async function getVideosWithMetadata() {
    try {
        const querySnapshot = await getDocs(videosCollection);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Erreur récupération vidéos:', error);
        throw error;
    }
}

// Supprimer une vidéo
export async function deleteVideoMetadata(videoId) {
    try {
        await deleteDoc(doc(db, 'videos', videoId));
    } catch (error) {
        console.error('Erreur suppression métadonnées vidéo:', error);
        throw error;
    }
}