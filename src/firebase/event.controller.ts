import { addDoc, collection, getDocs } from "firebase/firestore";
import { firebasedb } from "./firebase.config";

export const createEvent = async (eventData: EventData) => {
    try {
        // Reference to the events collection in Firestore
        const eventsCollectionRef = collection(firebasedb, 'events');

        // Add the event data to the Firestore collection
        const docRef = await addDoc(eventsCollectionRef, eventData);

        // Return success response with the document ID
        return {
            success: true,
            message: "Event created successfully",
            eventId: docRef.id,
        };
    } catch (error: any) {
        // Handle errors and return failure response
        return {
            success: false,
            message: `Failed to create event: ${error.message}`,
        };
    }
}

export const getAllEvents = async () => {
    try {
        // Reference to the events collection in Firestore
        const eventsCollectionRef = collection(firebasedb, 'events');

        // Fetch all events from the Firestore collection
        const querySnapshot = await getDocs(eventsCollectionRef);

        // Map through the documents and return the data
        const events = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        return {
            success: true,
            data: events,
        };
    } catch (error: any) {
        // Handle errors and return failure response
        return {
            success: false,
            message: `Failed to fetch events: ${error.message}`,
        };
    }
}

export const getLatestThreeEvents = async () => {
    // TODO : not working very accurately , need to check the date format
    try {
        // Reference to the events collection in Firestore
        const eventsCollectionRef = collection(firebasedb, 'events');

        // Fetch all events from the Firestore collection
        const querySnapshot = await getDocs(eventsCollectionRef);

        // Map through the documents and return the data
        const events = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        // Sort events by date and get the latest three
        const latestEvents = events.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);

        return {
            success: true,
            data: latestEvents,
        };
    } catch (error: any) {
        // Handle errors and return failure response
        return {
            success: false,
            message: `Failed to fetch latest events: ${error.message}`,
        };
    }
}
