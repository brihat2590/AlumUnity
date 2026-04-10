import {
  addDoc,
  collection,
  doc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { firebasedb } from './firebase.config';
import { getUserInfo } from './user.controller';

const RESUMES_COLLECTION = 'resumes';

export const createResumePost = async (payload: CreateResumePostParams) => {
  try {
    const resumesRef = collection(firebasedb, RESUMES_COLLECTION);
    const docRef = await addDoc(resumesRef, {
      ...payload,
      commentsCount: 0,
      createdAt: serverTimestamp(),
    });

    return {
      success: true,
      message: 'Resume uploaded successfully',
      resumeId: docRef.id,
      slug: payload.slug,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to create resume post: ${error.message}`,
    };
  }
};

export const getAllResumePosts = async () => {
  try {
    const resumesRef = collection(firebasedb, RESUMES_COLLECTION);
    const q = query(resumesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const resumes = snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    })) as ResumePost[];

    return {
      success: true,
      data: resumes,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to fetch resumes: ${error.message}`,
      data: [] as ResumePost[],
    };
  }
};

const getResumeBySlugOnly = async (slug: string) => {
  const resumesRef = collection(firebasedb, RESUMES_COLLECTION);
  const q = query(resumesRef, where('slug', '==', slug), limit(1));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const docSnap = snapshot.docs[0];
  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as ResumePost;
};

export const getResumeBySlug = async (slug: string) => {
  try {
    const resume = await getResumeBySlugOnly(slug);

    if (!resume) {
      return {
        success: false,
        message: 'Resume not found',
      };
    }

    const commentsRef = collection(firebasedb, RESUMES_COLLECTION, resume.id, 'comments');
    const commentsQuery = query(commentsRef, orderBy('createdAt', 'desc'));
    const commentsSnapshot = await getDocs(commentsQuery);

    const comments = commentsSnapshot.docs.map((commentDoc) => ({
      id: commentDoc.id,
      resumeId: resume.id,
      ...commentDoc.data(),
    })) as ResumeComment[];

    const userCache: Record<string, string | undefined> = {};
    const commentsWithAvatars = await Promise.all(
      comments.map(async (comment) => {
        if (comment.postedByPhotoURL) {
          return comment;
        }

        if (!comment.postedBy) {
          return comment;
        }

        if (!(comment.postedBy in userCache)) {
          const userInfoResponse = await getUserInfo(comment.postedBy);
          userCache[comment.postedBy] =
            userInfoResponse.success && userInfoResponse.data
              ? (userInfoResponse.data as UserData).profilePic
              : undefined;
        }

        return {
          ...comment,
          postedByPhotoURL: userCache[comment.postedBy],
        };
      })
    );

    return {
      success: true,
      data: {
        resume,
        comments: commentsWithAvatars,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to fetch resume details: ${error.message}`,
    };
  }
};

export const addCommentToResume = async (payload: CreateResumeCommentParams) => {
  try {
    const resume = await getResumeBySlugOnly(payload.slug);

    if (!resume) {
      return {
        success: false,
        message: 'Resume not found',
      };
    }

    const commentsRef = collection(firebasedb, RESUMES_COLLECTION, resume.id, 'comments');
    await addDoc(commentsRef, {
      comment: payload.comment,
      postedBy: payload.postedBy,
      postedByName: payload.postedByName,
      postedByEmail: payload.postedByEmail,
      postedByPhotoURL: payload.postedByPhotoURL || '',
      createdAt: serverTimestamp(),
    });

    await updateDoc(doc(firebasedb, RESUMES_COLLECTION, resume.id), {
      commentsCount: increment(1),
    });

    return {
      success: true,
      message: 'Comment added successfully',
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to add comment: ${error.message}`,
    };
  }
};