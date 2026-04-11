import { addDoc, collection, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { firebasedb } from "./firebase.config";
import { getUserInfo } from './user.controller'; // Import getUserInfo to fetch user details

export const createQuestion = async (question: CreateQuestionParams) => {
    try {
        // Reference to the questions collection in Firestore
        const questionsRef = collection(firebasedb, 'questions');

        // Add the new question to the Firestore collection
        const docRef = await addDoc(questionsRef, question);

        // Return success response with the document ID
        return {
            success: true,
            message: "Question created successfully",
            questionId: docRef.id,
        };
    } catch (error: any) {
        // Handle errors and return failure response
        return {
            success: false,
            message: `Failed to create question: ${error.message}`,
        };
    }
}

export const getAllQuestions = async () => {
    // TODO : You need to populate the replies and user info before returning the questions
    // TODO : You need to sort the questions based on the upvotes and downvotes

    try {
        // Reference to the questions collection in Firestore
        const questionsRef = collection(firebasedb, 'questions');

        // Fetch all questions from the Firestore collection
        const snapshot = await getDocs(questionsRef);
        const questions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Return success response with the list of questions
        return {
            success: true,
            message: "Questions fetched successfully",
            questions,
        };
    } catch (error: any) {
        // Handle errors and return failure response
        return {
            success: false,
            message: `Failed to fetch questions: ${error.message}`,
        };
    }
}

export const getQuestionById = async (questionId: string) => {
    try {
        // Reference to the specific question document in Firestore
        const questionDocRef = doc(firebasedb, 'questions', questionId);

        // Fetch the question document from Firestore
        const questionSnapshot = await getDoc(questionDocRef);

        if (!questionSnapshot.exists()) {
            return {
                success: false,
                message: "Question not found",
            };
        }

        const questionData = questionSnapshot.data();

        // Fetch user info for the posted_by field
        const userInfoResponse = await getUserInfo(questionData.posted_by);
        const postedByUser = userInfoResponse.success ? userInfoResponse.data : { name: "Unknown User" };

        // Fetch detailed replies
        const replies = questionData.replies || [];
        const populatedReplies = await Promise.all(
            replies.map(async (replyId: string) => {
                const replyDocRef = doc(firebasedb, 'replies', replyId);
                const replySnapshot = await getDoc(replyDocRef);

                if (replySnapshot.exists()) {
                    const replyData = replySnapshot.data();
                    const replyUserInfoResponse = await getUserInfo(replyData.posted_by);
                    const replyPostedByUser = replyUserInfoResponse.success ? replyUserInfoResponse.data : { name: "Unknown User" };

                    return {
                        id: replyId,
                        ...replyData,
                        posted_by: replyPostedByUser, // Attach user info for the reply
                    };
                }
                return null;
            })
        );

        // Return success response with the populated question data
        return {
            success: true,
            message: "Question fetched successfully",
            question: {
                id: questionSnapshot.id,
                ...questionData,
                posted_by: postedByUser, // Attach user info for the question
                replies: populatedReplies.filter(reply => reply !== null), // Attach populated replies
            },
        };
    } catch (error: any) {
        // Handle errors and return failure response
        return {
            success: false,
            message: `Failed to fetch question: ${error.message}`,
        };
    }
}

export const updateQuestion = async (questionId: string, questionData: UpdateQuestionParams) => {
    try {
        // Reference to the specific question document in Firestore
        const questionDocRef = doc(firebasedb, 'questions', questionId);

        // Update the question document with the provided data
        await updateDoc(questionDocRef, { ...questionData });

        // Return success response
        return {
            success: true,
            message: "Question updated successfully",
        };
    } catch (error: any) {
        // Handle errors and return failure response
        return {
            success: false,
            message: `Failed to update question: ${error.message}`,
        };
    }
}

export const createReply = async (reply: CreateReplyParams) => {
    try {
        // Reference to the replies collection in Firestore
        const repliesRef = collection(firebasedb, 'replies');

        // Add the new reply to the Firestore collection
        const docRef = await addDoc(repliesRef, reply);

        // Update the replies[] field of the corresponding question document
        const updateResult = await updateQuestion(reply.question_id, {
            replies: [docRef.id], // Add the new reply ID to the replies array
        });

        // Check if the update was successful
        if (!updateResult.success) {
            throw new Error(updateResult.message);
        }

        // Return success response with the document ID
        return {
            success: true,
            message: "Reply created and question updated successfully",
            replyId: docRef.id,
        };
    } catch (error: any) {
        // Handle errors and return failure response
        return {
            success: false,
            message: `Failed to create reply: ${error.message}`,
        };
    }
};

export const createOrremoveUpvoteForQuestions = async (questionId: string, userId: string) => {
    try {
        // Reference to the specific question document in Firestore
        const questionDocRef = doc(firebasedb, 'questions', questionId);

        // Fetch the current question data
        const questionSnapshot = await getDoc(questionDocRef);

        if (!questionSnapshot.exists()) {
            return {
                success: false,
                message: "Question not found",
            };
        }
        const questionData = questionSnapshot.data();

        // Check if the user has already upvoted
        const upVotes = questionData.upVotes || [];
        const downVotes = questionData.downVotes || [];

        if (upVotes.includes(userId)) {
            // User has already upvoted, remove the upvote
            await updateDoc(questionDocRef, {
                upVotes: upVotes.filter((id: string) => id !== userId),
            });
            return {
                success: true,
                message: "Upvote removed successfully",
            };
        } else {
            // User has not upvoted, add the upvote
            await updateDoc(questionDocRef, {
                upVotes: [...upVotes, userId],
                downVotes: downVotes.filter((id: string) => id !== userId), // Remove from downvotes if present
            });
            return {
                success: true,
                message: "Upvote added successfully",
            };
        }
    } catch (error: any) {
        // Handle errors and return failure response
        return {
            success: false,
            message: `Failed to create or remove upvote: ${error.message}`,
        };
    }
}

export const createOrremoveDownvoteForQuestions = async (questionId: string, userId: string) => {
    try {
        // Reference to the specific question document in Firestore
        const questionDocRef = doc(firebasedb, 'questions', questionId);

        // Fetch the current question data
        const questionSnapshot = await getDoc(questionDocRef);

        if (!questionSnapshot.exists()) {
            return {
                success: false,
                message: "Question not found",
            };
        }
        const questionData = questionSnapshot.data();

        // Check if the user has already downvoted
        const downVotes = questionData.downVotes || [];
        const upVotes = questionData.upVotes || [];

        if (downVotes.includes(userId)) {
            // User has already downvoted, remove the downvote
            await updateDoc(questionDocRef, {
                downVotes: downVotes.filter((id: string) => id !== userId),
            });
            return {
                success: true,
                message: "Downvote removed successfully",
            };
        } else {
            // User has not downvoted, add the downvote
            await updateDoc(questionDocRef, {
                downVotes: [...downVotes, userId],
                upVotes: upVotes.filter((id: string) => id !== userId), // Remove from upvotes if present
            });
            return {
                success: true,
                message: "Downvote added successfully",
            };
        }
    } catch (error: any) {
        // Handle errors and return failure response
        return {
            success: false,
            message: `Failed to create or remove downvote: ${error.message}`,
        };
    }
}

export const createOrremoveUpvoteForReplies = async (replyId: string, userId: string) => {
    try {
        // Reference to the specific reply document in Firestore
        const replyDocRef = doc(firebasedb, 'replies', replyId);

        // Fetch the current reply data
        const replySnapshot = await getDoc(replyDocRef);

        if (!replySnapshot.exists()) {
            return {
                success: false,
                message: "Reply not found",
            };
        }
        const replyData = replySnapshot.data();

        // Check if the user has already upvoted
        const upVotes = replyData.upVotes || [];
        const downVotes = replyData.downVotes || [];

        if (upVotes.includes(userId)) {
            // User has already upvoted, remove the upvote
            await updateDoc(replyDocRef, {
                upVotes: upVotes.filter((id: string) => id !== userId),
            });
            return {
                success: true,
                message: "Upvote removed successfully",
            };
        } else {
            // User has not upvoted, add the upvote
            await updateDoc(replyDocRef, {
                upVotes: [...upVotes, userId],
                downVotes: downVotes.filter((id: string) => id !== userId), // Remove from downvotes if present
            });
            return {
                success: true,
                message: "Upvote added successfully",
            };
        }
    } catch (error: any) {
        // Handle errors and return failure response
        return {
            success: false,
            message: `Failed to create or remove upvote: ${error.message}`,
        };
    }
}

export const createOrremoveDownvoteForReplies = async (replyId: string, userId: string) => {
    try {
        // Reference to the specific reply document in Firestore
        const replyDocRef = doc(firebasedb, 'replies', replyId);

        // Fetch the current reply data
        const replySnapshot = await getDoc(replyDocRef);

        if (!replySnapshot.exists()) {
            return {
                success: false,
                message: "Reply not found",
            };
        }
        const replyData = replySnapshot.data();

        // Check if the user has already downvoted
        const downVotes = replyData.downVotes || [];
        const upVotes = replyData.upVotes || [];

        if (downVotes.includes(userId)) {
            // User has already downvoted, remove the downvote
            await updateDoc(replyDocRef, {
                downVotes: downVotes.filter((id: string) => id !== userId),
            });
            return {
                success: true,
                message: "Downvote removed successfully",
            };
        } else {
            // User has not downvoted, add the downvote
            await updateDoc(replyDocRef, {
                downVotes: [...downVotes, userId],
                upVotes: upVotes.filter((id: string) => id !== userId), // Remove from upvotes if present
            });
            return {
                success: true,
                message: "Downvote added successfully",
            };
        }
    } catch (error: any) {
        // Handle errors and return failure response
        return {
            success: false,
            message: `Failed to create or remove downvote: ${error.message}`,
        };
    }
}

export const getThreeQuestionsWithMostUpvotes = async () => {
    // TODO : Need to populate the replies and user info before returning the questions
    try {
        // Reference to the questions collection in Firestore
        const questionsRef = collection(firebasedb, 'questions');

        // Fetch all questions from the Firestore collection
        const snapshot = await getDocs(questionsRef);
        const questions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sort questions by upvotes in descending order and get the top 3
        const sortedQuestions = questions.sort((a: any, b: any) => (b.upVotes || []).length - (a.upVotes || []).length).slice(0, 3);

        // Return success response with the list of top 3 questions
        return {
            success: true,
            message: "Top 3 questions fetched successfully",
            questions: sortedQuestions,
        };
    } catch (error: any) {
        // Handle errors and return failure response
        return {
            success: false,
            message: `Failed to fetch top 3 questions: ${error.message}`,
        };
    }
}