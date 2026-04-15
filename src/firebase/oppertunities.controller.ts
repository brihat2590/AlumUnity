import { addDoc, collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { firebasedb } from "./firebase.config";

export const createOpportunity = async (opportunityData: oppertunityData) => {
    try {
        // Reference to the "opportunities" collection in Firestore
        const opportunitiesCollectionRef = collection(firebasedb, 'opportunities');

        // Add the new opportunity document to the collection
        const docRef = await addDoc(opportunitiesCollectionRef, opportunityData);

        // Return success response with the document ID
        return {
            success: true,
            message: "Opportunity created successfully",
            docId: docRef.id,
        };
    } catch (error: any) {
        // Handle errors and return failure response
        return {
            success: false,
            message: `Failed to create opportunity: ${error.message}`,
        };
    }
}

export const updateOpportunity = async (docId: string, opportunityData: Partial<oppertunityData>) => {
    try {
        const docRef = doc(firebasedb, 'opportunities', docId);
        await updateDoc(docRef, opportunityData);
        
        return {
            success: true,
            message: "Opportunity updated successfully",
        };
    } catch (error: any) {
        return {
            success: false,
            message: `Failed to update opportunity: ${error.message}`,
        };
    }
}

export const getAllOpportunities = async () => {
    try {
        // Reference to the "opportunities" collection in Firestore
        const opportunitiesCollectionRef = collection(firebasedb, 'opportunities');

        // Fetch all documents from the collection
        const querySnapshot = await getDocs(opportunitiesCollectionRef);

        // Map through the documents and return their data
        const opportunities = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        return {
            success: true,
            data: opportunities,
        };
    } catch (error: any) {
        // Handle errors and return failure response
        return {
            success: false,
            message: `Failed to fetch opportunities: ${error.message}`,
        };
    }
}

