'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight, Highlighter, Info, Loader2, MessageCircleMore, Paperclip, Plus, Send, Settings2, Share2, ZoomIn, ZoomOut } from 'lucide-react';
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

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';

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

    if (!response.data?.resume?.resumeUrl) {
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

  const previewComments = useMemo(() => comments.slice(0, 2), [comments]);
  const reviewerName = resume?.postedByName || 'AlumUnity User';
  const title = resume?.title || 'Resume Review';
  const commentCount = comments.length;
  const previewSrc = useMemo(() => {
    if (!resume?.resumeUrl) return '';

    const isPdf = resume.resumeUrl.toLowerCase().includes('.pdf');
    return isPdf
      ? `${resume.resumeUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH&zoom=160`
      : resume.resumeUrl;
  }, [resume?.resumeUrl]);

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

  const handleShare = async () => {
    if (typeof window === 'undefined') return;

    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Resume link copied');
    } catch {
      toast.error('Could not copy link');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fcfcfd] px-4 text-slate-700">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-violet-600" />
        Loading resume thread...
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#fcfcfd] px-4 text-slate-700">
        <p>Resume thread not found.</p>
        <Link
          href="/resumereview"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50"
        >
          Back to Resume Review
        </Link>
      </div>
    );
  }

  const headerAvatars = previewComments.slice(0, 2).map((item) => ({
    id: item.id || `${item.postedByName || 'Reviewer'}-${item.createdAt?.seconds || item.createdAt || ''}`,
    name: item.postedByName || 'Reviewer',
    photoURL: item.postedByPhotoURL || '',
  }));

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-[#fcfcfd] text-slate-900 antialiased">
      <header className="flex h-20 items-center justify-between border-b border-slate-100 bg-white px-8">
        <div className="flex min-w-0 items-center gap-6">
          <Link href="/resumereview" className="group flex items-center gap-3 text-slate-400 transition-colors hover:text-violet-600">
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-semibold uppercase tracking-tight">Overview</span>
          </Link>
          <div className="h-6 w-px bg-slate-100" />
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight text-slate-900">
              {reviewerName} — Senior UX Resume
            </h1>
            <p className="truncate text-xs font-medium text-slate-400">Reviewing for {title}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="mr-4 flex -space-x-2">
            {headerAvatars.map((avatar) => (
              <img
                key={avatar.id}
                alt={avatar.name}
                className="h-8 w-8 rounded-full border-2 border-white object-cover ring-1 ring-slate-100"
                src={avatar.photoURL || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(avatar.name)}`}
              />
            ))}
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-50 text-[10px] font-bold text-slate-400 ring-1 ring-slate-100">
              +{Math.max(commentCount - headerAvatars.length, 1)}
            </div>
          </div>
          <button
            type="button"
            onClick={handleShare}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50"
          >
            <span className="inline-flex items-center gap-2"><Share2 className="h-4 w-4" /> Share</span>
          </button>
          <button
            type="button"
            className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-600/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-600/30 active:translate-y-0"
          >
            Finish Review
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="relative flex flex-1 flex-col overflow-hidden bg-slate-50">
          <div className="glass-panel absolute left-1/2 top-6 z-10 flex -translate-x-1/2 items-center gap-6 rounded-2xl border border-white px-4 py-2 shadow-xl shadow-slate-200/50">
            <div className="flex items-center gap-1">
              <button type="button" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100/50" aria-label="Zoom out">
                <ZoomOut className="h-[18px] w-[18px]" />
              </button>
              <span className="w-12 text-center text-[13px] font-bold text-slate-700">100%</span>
              <button type="button" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100/50" aria-label="Zoom in">
                <ZoomIn className="h-[18px] w-[18px]" />
              </button>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <button type="button" className="rounded-xl bg-violet-600/10 p-2 text-violet-600" title="Add Comment" aria-label="Add comment">
                <MessageCircleMore className="h-5 w-5" />
              </button>
              <button type="button" className="rounded-xl p-2 text-slate-400 transition-colors hover:text-slate-600" title="Highlight" aria-label="Highlight">
                <Highlighter className="h-5 w-5" />
              </button>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-1">
              <button type="button" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100/50" aria-label="Previous page">
                <ChevronLeft className="h-[18px] w-[18px]" />
              </button>
              <span className="mx-1 text-[13px] font-bold text-slate-700">1 / 2</span>
              <button type="button" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100/50" aria-label="Next page">
                <ChevronRight className="h-[18px] w-[18px]" />
              </button>
            </div>
          </div>

          <div className="custom-scrollbar flex flex-1 flex-col items-center overflow-y-auto px-12 pb-20 pt-28">
            <div className="resume-paper relative w-full max-w-[840px] rounded-sm bg-white p-16">
              <div className="mb-16 flex items-start justify-between">
                <div>
                  <h2 className="mb-2 text-4xl font-black tracking-tight text-slate-900">{reviewerName}</h2>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600">{title}</p>
                </div>
                <div className="text-right text-[13px] font-medium leading-relaxed text-slate-400">
                  <p>{resume.postedByEmail || 'No email'}</p>
                  <p>{formatDate(resume.createdAt)}</p>
                  <p>{resume.fileName || 'Resume file'}</p>
                </div>
              </div>

              <div className="space-y-12">
                <section>
                  <h3 className="mb-6 border-b border-slate-100 pb-3 text-sm font-bold uppercase tracking-widest text-slate-900">Professional Summary</h3>
                  <div className="rounded-sm bg-slate-50">
                    <iframe src={previewSrc} title={title} className="h-[82vh] w-full bg-white" />
                  </div>
                </section>

                <section className="relative">
                  <h3 className="mb-6 border-b border-slate-100 pb-3 text-sm font-bold uppercase tracking-widest text-slate-900">Experience</h3>
                  <div className="space-y-10">
                    <div className="relative">
                      <div className="absolute -right-[68px] top-1 cursor-pointer group">
                        {/* <div className="h-3 w-3 rounded-full bg-violet-600 ring-8 ring-violet-600/10 transition-all group-hover:scale-125" /> */}
                        <div className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white opacity-0 transition-opacity group-hover:opacity-100">
                          Comment L12
                        </div>
                      </div>
                      <div className="mb-2 flex items-baseline justify-between">
                        <h4 className="text-[17px] font-bold text-slate-900">Resume Snapshot</h4>
                        <span className="text-xs font-bold text-slate-300">LIVE</span>
                      </div>
                      <ul className="space-y-3">
                        <li className="flex gap-3 text-[15px] leading-relaxed text-slate-600">
                          <span className="mt-0.5 font-black text-violet-600">•</span>
                          <span>Review the document above and use the sidebar for precise feedback.</span>
                        </li>
                        <li className="flex gap-3 text-[15px] leading-relaxed text-slate-600">
                          <span className="mt-0.5 font-black text-violet-600">•</span>
                          <span>Focus comments on impact, clarity, and whether the experience reads as strong and specific.</span>
                        </li>
                        <li className="flex gap-3 text-[15px] leading-relaxed text-slate-600">
                          <span className="mt-0.5 font-black text-violet-600">•</span>
                          <span>Use the review panel to post actionable feedback and resolve suggestions.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>

        <aside className="flex w-full flex-col border-l border-slate-100 bg-white md:w-[400px]">
          <div className="flex items-center justify-between border-b border-slate-50 p-6">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900">Feedback</h3>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">{commentCount}</span>
            </div>
            {/* <div className="flex gap-1">
              <button type="button" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50" aria-label="Filter feedback">
                <Settings2 className="h-5 w-5" />
              </button>
              <button type="button" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50" aria-label="More actions">
                <Plus className="h-5 w-5 rotate-45" />
              </button>
            </div> */}
          </div>

          <div className="custom-scrollbar flex-1 overflow-y-auto p-6">
            <div className="mb-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
              <div className="mb-3 flex items-center gap-3">
                <Info className="h-5 w-5 text-violet-600" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Context</span>
              </div>
              <p className="text-[13px] italic leading-relaxed text-slate-500">
                {title} is ready for review. Please focus on impact driven keywords and clarity.
              </p>
            </div>

            <div className="space-y-8">
              {comments.length === 0 ? (
                <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-500 shadow-sm">
                  No comments yet. Be the first to leave feedback.
                </div>
              ) : (
                previewComments.map((item) => (
                  <div key={item.id} className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        {item.postedByPhotoURL ? (
                          <img
                            alt={item.postedByName || 'Reviewer'}
                            className="h-6 w-6 rounded-full object-cover ring-1 ring-slate-100"
                            src={item.postedByPhotoURL}
                          />
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-50 text-[10px] font-bold text-slate-400 ring-1 ring-slate-100">
                            {getInitials(item.postedByName || 'Reviewer')}
                          </div>
                        )}
                        <span className="truncate text-xs font-bold text-slate-900">{item.postedByName || 'Reviewer'}</span>
                        <span className="text-[10px] font-medium uppercase tracking-tighter text-slate-300">• {formatDate(item.createdAt)}</span>
                      </div>
                      <span className="rounded border border-violet-600/10 bg-violet-600/5 px-2 py-0.5 text-[10px] font-black text-violet-600">L12</span>
                    </div>

                    <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                      <div className="absolute bottom-0 left-0 top-0 w-1 scale-y-0 transform bg-violet-600 transition-transform group-hover:scale-y-100" />
                      <p className="text-[14px] leading-relaxed text-slate-600">{item.comment}</p>
                    </div>

                    <div className="flex gap-4 px-1">
                      <button type="button" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-violet-600">Reply</button>
                      <button type="button" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-emerald-500">Resolve</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-slate-50 bg-white p-6">
            <form onSubmit={handleCommentSubmit} className="relative">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="Add a general comment..."
                className="custom-scrollbar min-h-[100px] w-full resize-none rounded-2xl bg-slate-50/50 p-4 pr-12 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-violet-600/40 focus:bg-white focus:ring-2 focus:ring-violet-600/20"
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-1">
                {/* <button type="button" className="p-2 text-slate-400 hover:text-violet-600" aria-label="Attach file">
                  <Paperclip className="h-5 w-5" />
                </button> */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-slate-900 p-2.5 text-white transition-all hover:bg-black disabled:opacity-60"
                  aria-label="Send comment"
                >
                  {isSubmitting ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <Send className="h-[18px] w-[18px]" />}
                </button>
              </div>
            </form>
          </div>
        </aside>
      </div>
    </main>
  );
}
