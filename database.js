import { db } from './firebase.config.js';
import { 
    collection, 
    addDoc, 
    deleteDoc, 
    updateDoc, 
    getDocs, 
    doc 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Structure de la collection images dans Firestore
const imagesCollection = collection(db, 'images');

// Ajouter une nouvelle image avec ses métadonnées
export async function addImageMetadata(imageUrl, description) {
    try {
        return await addDoc(imagesCollection, {
            url: imageUrl,
            description: description,
            createdAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Erreur ajout métadonnées:', error);
        throw error;
    }
}

// Mettre à jour la description d'une image
export async function updateImageDescription(imageId, newDescription) {
    try {
        const imageRef = doc(db, 'images', imageId);
        await updateDoc(imageRef, {
            description: newDescription,
            updatedAt: new Date().toISOString()
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
