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
  const [previewMode, setPreviewMode] = useState<'inline' | 'viewer'>('inline');

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
        inlineSrc: '',
        viewerSrc: '',
      };
    }

    const fileHint = `${resume.fileName || ''} ${resume.resumeUrl || ''}`.toLowerCase();
    const isPdf = fileHint.includes('.pdf') || fileHint.includes('/pdf/');
    const inlineSrc = isPdf ? `${resume.resumeUrl}#view=FitH` : resume.resumeUrl;
    const viewerSrc = `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(resume.resumeUrl)}`;

    return {
      isPdf,
      inlineSrc,
      viewerSrc,
    };
  }, [resume]);

  useEffect(() => {
    if (!resume) return;

    const fileHint = `${resume.fileName || ''} ${resume.resumeUrl || ''}`.toLowerCase();
    const isPdf = fileHint.includes('.pdf') || fileHint.includes('/pdf/');
    setPreviewMode(isPdf ? 'inline' : 'viewer');
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
    <section className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-10 md:px-8 md:py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_6%,rgba(165,180,252,0.14),transparent_38%)]" />
      <div className="relative mx-auto max-w-7xl space-y-7">
        <Link
          href="/resumereview"
          className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-sm text-indigo-600 shadow-[0_12px_26px_-20px_rgba(79,70,229,0.95)] ring-1 ring-indigo-100/75 backdrop-blur transition hover:-translate-y-0.5"
        >
          <ArrowLeft className="h-4 w-4" /> Back to all resumes
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <article className="rounded-[30px] bg-white/86 p-5 shadow-[0_30px_65px_-45px_rgba(79,70,229,0.82)] ring-1 ring-indigo-100/80 backdrop-blur md:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">{resume.title}</h1>
                <p className="mt-2 text-sm text-slate-600">
                  Uploaded by {resume.postedByName} • {formatDate(resume.createdAt)}
                </p>
              </div>

              <div className="inline-flex items-center px-1 py-1 text-xs font-medium text-indigo-700">
                <FileText className="mr-1 h-3.5 w-3.5" /> {resume.fileName || 'resume'}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewMode('inline')}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  previewMode === 'inline'
                    ? 'bg-indigo-600 text-white shadow-[0_12px_26px_-20px_rgba(79,70,229,0.8)]'
                    : 'bg-white/80 text-indigo-700 ring-1 ring-indigo-100 hover:bg-white'
                }`}
              >
                Inline preview
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('viewer')}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  previewMode === 'viewer'
                    ? 'bg-indigo-600 text-white shadow-[0_12px_26px_-20px_rgba(79,70,229,0.8)]'
                    : 'bg-white/80 text-indigo-700 ring-1 ring-indigo-100 hover:bg-white'
                }`}
              >
                Compatibility viewer
              </button>
            </div>

            {!previewConfig.isPdf && previewMode === 'inline' && (
              <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                This file may not render inline in all browsers. Use Compatibility viewer or open in new tab.
              </p>
            )}

            <div className="mt-4 overflow-hidden rounded-2xl bg-white ring-1 ring-indigo-100/80">
              <iframe
                src={previewMode === 'inline' ? previewConfig.inlineSrc : previewConfig.viewerSrc}
                title={resume.title}
                className="h-[72vh] w-full"
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={resume.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-full bg-white/85 px-4 py-2 text-sm text-indigo-700 shadow-[0_12px_26px_-20px_rgba(79,70,229,0.95)] ring-1 ring-indigo-100/80 transition hover:-translate-y-0.5"
              >
                <ExternalLink className="mr-1.5 h-4 w-4" /> Open resume in new tab
              </a>
            </div>
          </article>

          <aside className="rounded-[30px] bg-white/86 p-5 shadow-[0_24px_52px_-44px_rgba(79,70,229,0.82)] ring-1 ring-indigo-100/80 backdrop-blur md:p-6">
            <h2 className="mb-4 inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
              <MessageCircle className="h-5 w-5 text-indigo-600" /> Comments ({comments.length})
            </h2>

            <form onSubmit={handleCommentSubmit} className="mb-5 space-y-3">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="Share constructive feedback..."
                className="w-full rounded-2xl bg-white/95 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none ring-1 ring-indigo-100 transition focus:ring-2 focus:ring-indigo-200"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_34px_-20px_rgba(79,70,229,0.75)] transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
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
                <div className="rounded-2xl bg-indigo-50/40 p-4 text-sm text-slate-600 ring-1 ring-indigo-100/70">
                  No comments yet. Be the first to leave feedback.
                </div>
              ) : (
                comments.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-indigo-50/45 p-3 ring-1 ring-indigo-100/70">
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