'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowDown, ArrowLeft, ArrowUp } from 'lucide-react';
import { Inter, Manrope } from 'next/font/google';
import { useFirebase } from '@/firebase/firebase.config';
import { getQuestionById, createOrremoveUpvoteForQuestions, createOrremoveDownvoteForQuestions } from '@/firebase/questions.controller';
import { getUserInfo } from '@/firebase/user.controller';
import { Button } from '@/components/ui/button';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-manrope',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
});

type ForumUserMeta = {
  name: string;
  profilePic: string;
  role: string;
};

type ForumReply = {
  id: string;
  reply: string;
  date: string;
  posted_by?: {
    name?: string;
  };
};

type ForumQuestionDetail = {
  id: string;
  question: string;
  date: string;
  posted_by: string | { name?: string };
  upVotes?: string[];
  downVotes?: string[];
  replies?: ForumReply[];
};

const getRelativeTime = (dateInput: string) => {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    return 'Just now';
  }

  const diffMs = Date.now() - date.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) {
    return 'Now';
  }
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const formatVoteCount = (count: number) => {
  if (count >= 1000) {
    const compact = count / 1000;
    return `${compact >= 10 ? Math.round(compact) : compact.toFixed(1)}k`;
  }
  return `${count}`;
};

export default function ForumDetailPage() {
  const { forumId } = useParams<{ forumId: string }>();
  const { loggedInUser } = useFirebase();
  const userId = loggedInUser?.uid || '';

  const [question, setQuestion] = useState<ForumQuestionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [poster, setPoster] = useState<ForumUserMeta>({
    name: 'AlumUnity User',
    profilePic: '',
    role: 'AlumUnity User',
  });

  const fetchQuestion = async () => {
    if (!forumId) {
      return;
    }

    setLoading(true);
    const response = await getQuestionById(forumId);
    if (response.success) {
      const fetchedQuestion = response.question as ForumQuestionDetail;
      setQuestion(fetchedQuestion);

      const postedById = typeof fetchedQuestion.posted_by === 'string' ? fetchedQuestion.posted_by : '';
      if (postedById) {
        const user = await getUserInfo(postedById);
        const userData = user?.data as UserData | undefined;
        setPoster({
          name: userData?.name || 'AlumUnity User',
          profilePic: userData?.profilePic || '',
          role: userData?.Role || 'AlumUnity User',
        });
      } else {
        setPoster({
          name: typeof fetchedQuestion.posted_by === 'object' && fetchedQuestion.posted_by !== null ? (fetchedQuestion.posted_by as any).name || 'AlumUnity User' : 'AlumUnity User',
          profilePic: '',
          role: 'AlumUnity User',
        });
      }
    } else {
      toast.error(response.message || 'Question not found');
      setQuestion(null);
    }
    setLoading(false);
  };

  const handleUpvote = async () => {
    if (!question?.id) {
      return;
    }

    const response = await createOrremoveUpvoteForQuestions(question.id, userId);
    if (response.success) {
      fetchQuestion();
    } else {
      toast.error(`Failed to upvote: ${response.message}`);
    }
  };

  const handleDownvote = async () => {
    if (!question?.id) {
      return;
    }

    const response = await createOrremoveDownvoteForQuestions(question.id, userId);
    if (response.success) {
      fetchQuestion();
    } else {
      toast.error(`Failed to downvote: ${response.message}`);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, [forumId]);

  if (loading) {
    return (
      <div className={`${manrope.variable} ${inter.variable} min-h-screen bg-white px-6 py-28 text-center text-slate-600`}>
        Loading discussion...
      </div>
    );
  }

  if (!question) {
    return (
      <div className={`${manrope.variable} ${inter.variable} min-h-screen bg-white px-6 py-28 text-center`}>
        <p className="text-slate-700">Discussion not found.</p>
        <Link href="/forums" className="mt-6 inline-flex text-[#4647d3] underline underline-offset-4">
          Back to forums
        </Link>
      </div>
    );
  }

  const score = (question.upVotes?.length || 0) - (question.downVotes?.length || 0);

  return (
    <div className={`${manrope.variable} ${inter.variable} min-h-screen bg-white text-[#1a1a2e]`}>
      <main className="mx-auto min-h-screen max-w-3xl px-6 pb-28 pt-10">
        <Link
          href="/forums"
          className="mb-12 inline-flex items-center gap-2 text-sm font-semibold text-[#4647d3] transition-colors hover:text-[#3c3db8]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Forum
        </Link>

        <article className="group">
          <div className="mb-8 flex items-center gap-4">
            <div className="h-10 w-10 overflow-hidden rounded-full">
              {poster.profilePic ? (
                <img alt={poster.name} className="h-full w-full object-cover" src={poster.profilePic} />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-200 text-xs font-semibold text-slate-600">
                  {poster.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#1a1a2e]" style={{ fontFamily: 'var(--font-manrope)' }}>
                {poster.name}
              </h4>
              <p className="mt-0.5 text-[10px] uppercase tracking-widest text-slate-400">
                {poster.role} • {getRelativeTime(question.date)}
              </p>
            </div>
          </div>

          <div className="mb-10">
            <h1
              className="mb-6 text-3xl font-bold leading-[1.3] text-[#1a1a2e] md:text-5xl"
              style={{ fontFamily: 'var(--font-manrope)' }}
            >
              {question.question}
            </h1>
            <p className="text-lg leading-relaxed text-slate-500 opacity-90" style={{ fontFamily: 'var(--font-inter)' }}>
              Discussion thread from the alumni network. Cast your vote and share a thoughtful response on the thread page.
            </p>
          </div>

          <div className="flex items-center gap-5 rounded-full bg-[#4647d3]/[0.06] px-4 py-2.5 w-fit">
            <Button
              
              className={`h-11 w-11 rounded-full border-0 p-0 transition-all ${
                question.upVotes?.includes(userId)
                  ? 'bg-[#4647d3] text-white shadow-[0_12px_25px_-14px_rgba(70,71,211,0.8)]'
                  : 'bg-white text-[#4647d3]/50 hover:text-[#4647d3]'
              }`}
              onClick={handleUpvote}
            >
              <ArrowUp className="h-[24px] w-[24px]" />
            </Button>

            <div className="text-center">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#4647d3]/70">Score</p>
              <span className="text-lg font-extrabold tabular-nums text-[#1a1a2e]" style={{ fontFamily: 'var(--font-manrope)' }}>
                {formatVoteCount(score)}
              </span>
            </div>

            <Button
              
              className={`h-11 w-11 rounded-full border-0 p-0 transition-all ${
                question.downVotes?.includes(userId)
                  ? 'bg-[#1a1a2e] text-white shadow-[0_12px_25px_-14px_rgba(26,26,46,0.75)]'
                  : 'bg-white text-slate-300 hover:text-[#4647d3]'
              }`}
              onClick={handleDownvote}
            >
              <ArrowDown className="h-[24px] w-[24px]" />
            </Button>
          </div>

          <div className="mt-20 h-px w-full bg-gradient-to-r from-transparent via-slate-100 to-transparent" />

          <section className="mt-14">
            <h2 className="mb-4 text-xl font-bold text-[#1a1a2e]" style={{ fontFamily: 'var(--font-manrope)' }}>
              Replies
            </h2>
            {question.replies && question.replies.length > 0 ? (
              <div className="space-y-4">
                {question.replies.map((reply) => (
                  <div key={reply.id} className="rounded-xl bg-slate-50 p-5">
                    <p className="text-slate-700">{reply.reply}</p>
                    <p className="mt-3 text-xs uppercase tracking-wide text-slate-400">
                      {reply.posted_by?.name || 'AlumUnity User'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-slate-50 p-6 text-sm text-slate-500">No replies yet.</div>
            )}
          </section>
        </article>
      </main>
    </div>
  );
}
