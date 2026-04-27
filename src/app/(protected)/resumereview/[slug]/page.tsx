'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ExternalLink, FileText, Loader2, MessageCircle, SendHorizonal } from 'lucide-react';
import { toast } from 'sonner';
import { useFirebase } from '@/firebase/firebase.config';
import { addCommentToResume, getResumeBySlug } from '@/firebase/resume.controller';

const formatDate = (input: any) => {
  const date = input?.seconds ? new Date(input.seconds * 1000) : new Date(input);
  if (Number.isNaN(date.getTime())) {
    return 'Just now';
  }

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function ResumeReviewDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const { loggedInUser } = useFirebase();

  const [resume, setResume] = useState<ResumePost | null>(null);
  const [comments, setComments] = useState<ResumeComment[]>([]);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const loadResume = async () => {
    if (!slug) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const response = await getResumeBySlug(slug);

    if (!response.success) {
      toast.error(response.message || 'Could not load resume');
      setIsLoading(false);
      return;
    }
    if(!response.data || !response.data.resume||!response.data.resume.resumeUrl){
      toast.error('Resume not found');
      setIsLoading(false);
      return;
    }

    setResume(response.data.resume);
    setComments(response.data.comments || []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadResume();
  }, [slug]);

  const previewConfig = useMemo(() => {
    if (!resume) {
      return {
        isPdf: false,
        previewSrc: '',
      };
    }

    const fileHint = `${resume.fileName || ''} ${resume.resumeUrl || ''}`.toLowerCase();
    const isPdf = fileHint.includes('.pdf') || fileHint.includes('/pdf/');
    const previewSrc = isPdf ? `${resume.resumeUrl}#view=FitH` : resume.resumeUrl;

    return {
      isPdf,
      previewSrc,
    };
  }, [resume]);

  const handleCommentSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!slug) return;
    if (!loggedInUser?.uid) {
      toast.error('Please sign in to comment');
      return;
    }

    const cleanComment = comment.trim();
    if (!cleanComment) {
      toast.error('Comment cannot be empty');
      return;
    }

    setIsSubmitting(true);
    const response = await addCommentToResume({
      slug,
      comment: cleanComment,
      postedBy: loggedInUser.uid,
      postedByName: loggedInUser.displayName || loggedInUser.email?.split('@')[0] || 'Anonymous',
      postedByEmail: loggedInUser.email || 'No email',
      postedByPhotoURL: loggedInUser.photoURL || '',
    });

    if (!response.success) {
      toast.error(response.message || 'Failed to post comment');
      setIsSubmitting(false);
      return;
    }

    setComment('');
    toast.success('Comment posted');
    await loadResume();
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 text-slate-700">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading resume thread...
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-slate-700">
        <p>Resume thread not found.</p>
        <Link
          href="/resumereview"
          className="rounded-full bg-white/85 px-4 py-2 text-sm text-indigo-700 shadow-[0_12px_24px_-20px_rgba(79,70,229,0.9)] ring-1 ring-indigo-100/80 transition hover:-translate-y-0.5"
        >
          Back to Resume Review
        </Link>
      </div>
    );
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-white px-4 py-10 md:px-8 md:py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(129,140,248,0.1),transparent_34%),radial-gradient(circle_at_86%_14%,rgba(99,102,241,0.08),transparent_40%)]" />
      <div className="relative mx-auto max-w-7xl space-y-7">
        <Link
          href="/resumereview"
          className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium text-indigo-600 backdrop-blur-sm transition hover:-translate-y-0.5 hover:text-indigo-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to all resumes
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <article className="rounded-[34px] bg-gradient-to-br from-white via-white to-indigo-50/25 p-5 shadow-[0_45px_90px_-58px_rgba(79,70,229,0.65)] backdrop-blur md:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">{resume.title}</h1>
                <p className="mt-2 text-sm text-slate-600">
                  Uploaded by {resume.postedByName} • {formatDate(resume.createdAt)}
                </p>
              </div>

              <div className="inline-flex items-center text-xs font-semibold text-indigo-700">
                <FileText className="mr-1 h-3.5 w-3.5" /> {resume.fileName || 'resume'}
              </div>
            </div>

            <p className="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-indigo-500">Inline preview</p>

            {!previewConfig.isPdf && (
              <p className="mt-3 rounded-2xl bg-amber-50/60 px-3 py-2 text-xs text-amber-700">
                This file type may not render in all browsers. Use open in new tab for the best experience.
              </p>
            )}

            <div className="mt-4 overflow-hidden rounded-3xl bg-white shadow-[0_32px_70px_-56px_rgba(79,70,229,0.6)]">
              <iframe
                src={previewConfig.previewSrc}
                title={resume.title}
                className="h-[72vh] w-full"
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={resume.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-indigo-700 transition hover:-translate-y-0.5 hover:text-indigo-800"
              >
                <ExternalLink className="mr-1.5 h-4 w-4" /> Open resume in new tab
              </a>
            </div>
          </article>

          <aside className="rounded-[34px] bg-gradient-to-br from-white via-white to-indigo-50/20 p-5 shadow-[0_36px_75px_-55px_rgba(79,70,229,0.65)] backdrop-blur md:p-6">
            <h2 className="mb-4 inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
              <MessageCircle className="h-5 w-5 text-indigo-600" /> Comments ({comments.length})
            </h2>

            <form onSubmit={handleCommentSubmit} className="mb-5 space-y-3">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="Share constructive feedback..."
                className="w-full rounded-3xl bg-white px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none shadow-[0_14px_30px_-26px_rgba(79,70,229,0.6)] transition focus:shadow-[0_16px_34px_-24px_rgba(79,70,229,0.7)]"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_18px_34px_-22px_rgba(79,70,229,0.78)] transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Posting...
                  </>
                ) : (
                  <>
                    <SendHorizonal className="h-4 w-4" /> Post comment
                  </>
                )}
              </button>
            </form>

            <div className="max-h-[52vh] space-y-3 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <div className="rounded-3xl bg-slate-50/70 p-4 text-sm text-slate-600">
                  No comments yet. Be the first to leave feedback.
                </div>
              ) : (
                comments.map((item) => (
                  <div key={item.id} className="rounded-3xl bg-white p-3.5 shadow-[0_18px_36px_-30px_rgba(79,70,229,0.45)]">
                    <div className="flex items-start gap-3">
                      {((item.postedBy === loggedInUser?.uid && loggedInUser?.photoURL) || item.postedByPhotoURL) ? (
                        <img
                          src={(item.postedBy === loggedInUser?.uid && loggedInUser?.photoURL) || item.postedByPhotoURL}
                          alt={item.postedByName || 'User avatar'}
                          className="mt-0.5 h-8 w-8 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
                          {(item.postedByName || 'A').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm text-slate-800">{item.comment}</p>
                        <p className="mt-2 text-xs text-slate-500">
                          {item.postedByName} • {formatDate(item.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}