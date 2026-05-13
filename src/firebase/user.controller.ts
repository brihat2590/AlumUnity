import { firebasedb } from './firebase.config';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';

export const saveUserAfterLogin = async (userId: string, email?: string | null, name?: string | null) => {
    try {
        if (!userId) {
            return {
                success: false,
                message: 'User ID is required',
            };
        }

        const userDocRef = doc(firebasedb, 'users', userId);

        await setDoc(
            userDocRef,
            {
                ...(email ? { email } : {}),
                ...(name ? { name } : {}),
            },
            { merge: true }
        );

        return {
            success: true,
            message: 'User profile initialized successfully',
            userId,
        };
    } catch (error: any) {
        return {
            success: false,
            message: `Failed to add user email to db: ${error.message}`,
        };
    }
};

export const getAllUsers = async () => {
    try {
        const usersCollectionRef = collection(firebasedb, 'users');
        const querySnapshot = await getDocs(usersCollectionRef);

        const users = querySnapshot.docs.map((userDoc) => ({
            id: userDoc.id,
            ...(userDoc.data() as UserData),
        }));

        return {
            success: true,
            data: users,
        };
    } catch (error: any) {
        return {
            success: false,
            message: `Failed to fetch users: ${error.message}`,
        };
    }
};

export const updateUserInfo = async (userId: string, userInfo: UserData) => {
    try {
        if (!userId) {
            return {
                success: false,
                message: 'User ID is required',
            };
        }

        const userDocRef = doc(firebasedb, 'users', userId);

        await setDoc(userDocRef, { ...userInfo }, { merge: true });

        return {
            success: true,
            message: "User information updated successfully",
        };
    } catch (error: any) {
        return {
            success: false,
            message: `Failed to update user information: ${error.message}`,
        };
    }
};

export const getUserInfo = async (userId: string) => {
    try {
        if (!userId) {
            return {
                success: false,
                message: 'User ID is required',
            };
        }

        const userDocRef = doc(firebasedb, 'users', userId);

        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            return {
                success: true,
                data: userDoc.data(),
            };
        } else {
            return {
                success: false,
                message: "User not found",
            };
        }
    } catch (error: any) {
        return {
            success: false,
            message: `Failed to fetch user information: ${error.message}`,
        };
    }
}