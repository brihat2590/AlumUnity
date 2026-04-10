interface CreateResumePostParams {
  title: string;
  slug: string;
  resumeUrl: string;
  publicId: string;
  fileName: string;
  postedBy: string;
  postedByName: string;
  postedByEmail: string;
}

interface ResumePost {
  id: string;
  title: string;
  slug: string;
  resumeUrl: string;
  publicId: string;
  fileName: string;
  postedBy: string;
  postedByName: string;
  postedByEmail: string;
  commentsCount?: number;
  createdAt?: any;
}

interface CreateResumeCommentParams {
  slug: string;
  comment: string;
  postedBy: string;
  postedByName: string;
  postedByEmail: string;
  postedByPhotoURL?: string;
}

interface ResumeComment {
  id: string;
  resumeId: string;
  comment: string;
  postedBy: string;
  postedByName: string;
  postedByEmail: string;
  postedByPhotoURL?: string;
  createdAt?: any;
}