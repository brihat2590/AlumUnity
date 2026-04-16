'use client'
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { createQuestion, getAllQuestions, createOrremoveUpvoteForQuestions, createOrremoveDownvoteForQuestions } from '@/firebase/questions.controller';
import { getUserInfo } from '@/firebase/user.controller';
import { useFirebase } from '@/firebase/firebase.config';
import Link from 'next/link';
import { ArrowDown, ArrowUp, Plus } from 'lucide-react';
import { Inter, Manrope } from 'next/font/google';
import { FaSpinner } from 'react-icons/fa';

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

type ForumQuestion = {
  id: string;
  question: string;
  posted_by: string;
  date: string;
  upVotes?: string[];
  downVotes?: string[];
};

type ForumUserMeta = {
  name: string;
  profilePic: string;
  role: string;
};

const formatVoteCount = (count: number) => {
  if (count >= 1000) {
    const compact = count / 1000;
    return `${compact >= 10 ? Math.round(compact) : compact.toFixed(1)}k`;
  }
  return `${count}`;
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

const Forums = () => {
  const { loggedInUser } = useFirebase();
  const userId = loggedInUser?.uid || '';
  const [userMap, setUserMap] = useState<Record<string, ForumUserMeta>>({});

  const [questionData, setQuestionData] = useState({
    question: '',
    date: new Date().toISOString(),
  });

  const [questions, setQuestions] = useState<ForumQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [voteLoading, setVoteLoading] = useState<Record<string, 'up' | 'down' | null>>({});

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setQuestionData({ ...questionData, [name]: value });
  };

  const handleSaveQuestion = async () => {
    const cleanQuestion = questionData.question.trim();
    if (!cleanQuestion) {
      toast.error('Please add your question before posting.');
      return;
    }

    const data = { ...questionData, posted_by: userId };
    const response = await createQuestion(data);
    if (response.success) {
      toast.success('Question created successfully!');
      fetchQuestions();
      setQuestionData({
        question: '',
        date: new Date().toISOString(),
      });
      setIsDialogOpen(false);
    } else {
      toast.error(`Failed to create question: ${response.message}`);
    }
  };

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await getAllQuestions();
      if (response.success) {
        const fetchedQuestions = (response.questions || []) as ForumQuestion[];
        const userIds = [...new Set(fetchedQuestions.map((q) => q.posted_by).filter(Boolean))];

        const userFetches = await Promise.all(
          userIds.map(async (id) => {
            if (userMap[id]) {
              return { id, ...userMap[id] };
            }

            const user = await getUserInfo(id);
            const userData = user?.data as UserData | undefined;
            return {
              id,
              name: userData?.name || 'AlumUnity User',
              profilePic: userData?.profilePic || '',
              role: userData?.Role || 'AlumUnity User',
            };
          })
        );

        const updatedUserMap = { ...userMap };
        userFetches.forEach(({ id, name, profilePic, role }) => {
          updatedUserMap[id] = { name, profilePic, role };
        });

        setUserMap(updatedUserMap);
        setQuestions(fetchedQuestions);
      } else {
        toast.error(`Failed to fetch questions: ${response.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpvote = async (questionId: string) => {
    setVoteLoading((prev) => ({ ...prev, [questionId]: 'up' }));
    const response = await createOrremoveUpvoteForQuestions(questionId, userId);
    if (response.success) {
      await fetchQuestions();
    } else {
      toast.error(`Failed to upvote: ${response.message}`);
    }
    setVoteLoading((prev) => ({ ...prev, [questionId]: null }));
  };

  const handleDownvote = async (questionId: string) => {
    setVoteLoading((prev) => ({ ...prev, [questionId]: 'down' }));
    const response = await createOrremoveDownvoteForQuestions(questionId, userId);
    if (response.success) {
      await fetchQuestions();
    } else {
      toast.error(`Failed to downvote: ${response.message}`);
    }
    setVoteLoading((prev) => ({ ...prev, [questionId]: null }));
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  return (
    <div className={`${manrope.variable} ${inter.variable} min-h-screen text-[#1a1a2e]`}>
      <main className="mx-auto min-h-screen max-w-4xl pb-32 pt-10">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#1a1a2e] md:text-4xl" style={{ fontFamily: 'var(--font-manrope)' }}>
              Forums
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500" style={{ fontFamily: 'var(--font-inter)' }}>
              Share ideas, ask questions, and engage with thoughtful conversations from the alumni community.
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-11 w-11 rounded-full bg-[#4647d3] p-0 text-white transition-all duration-300 hover:bg-[#3c3db8]" aria-label="Create forum">
                <Plus className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl border-slate-100 p-7 sm:max-w-[560px]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-[#1a1a2e]" style={{ fontFamily: 'var(--font-manrope)' }}>
                  New Question
                </DialogTitle>
                <DialogDescription className="text-slate-500">
                  Share your insight or challenge with the alumni community.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2.5">
                  <Label htmlFor="question" className="font-medium text-slate-700">
                    Your Question
                  </Label>
                  <textarea
                    id="question"
                    name="question"
                    value={questionData.question}
                    onChange={handleChange}
                    className="min-h-[140px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#4647d3]/30 focus:ring-2 focus:ring-[#4647d3]/10"
                    rows={4}
                    placeholder="Type your question here..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  onClick={handleSaveQuestion}
                  className="rounded-full bg-[#4647d3] px-7 text-white transition-all hover:bg-[#3c3db8]"
                >
                  Post Question
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        <section className="space-y-10">
          {isLoading ? (
            <div className="flex items-center justify-center h-[40vh]">
              <FaSpinner className="animate-spin text-xl" />
            </div>
          ) : questions.length > 0 ? (
            questions.map((question, index) => {
              const postedBy = userMap[question.posted_by] || {
                name: 'AlumUnity User',
                profilePic: '',
                role: 'AlumUnity User',
              };

              return (
                <article className="group" key={question.id}>
                  <div className="mb-8 flex items-center gap-4">
                    <div className="h-10 w-10 overflow-hidden rounded-full">
                      {postedBy.profilePic ? (
                        <img alt={postedBy.name} className="h-full w-full object-cover" src={postedBy.profilePic} />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-200 text-xs font-semibold text-slate-600">
                          {postedBy.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1a1a2e]" style={{ fontFamily: 'var(--font-manrope)' }}>
                        {postedBy.name}
                      </h4>
                      <p className="mt-0.5 text-[10px] uppercase tracking-widest text-slate-400">
                        {postedBy.role} • {getRelativeTime(question.date)}
                      </p>
                    </div>
                  </div>

                  <div className="mb-5">
                    <Link href={`/forums/${question.id}`}>
                      <h2
                        className="mb-1 text-2xl font-bold leading-[1.3] text-[#1a1a2e] transition-colors duration-500 group-hover:text-[#4647d3] md:text-3xl"
                        style={{ fontFamily: 'var(--font-manrope)' }}
                      >
                        {question.question}
                      </h2>
                    </Link>
                  </div>

                  <div className="flex items-center gap-10">
                    <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-2 py-1.5">
                      <Button
                        variant={question.upVotes?.includes(userId) ? 'default' : 'outline'}
                        className={`h-11 w-11 rounded-full border-0 p-0 transition-all ${
                          question.upVotes?.includes(userId)
                            ? 'bg-indigo-700 text-white shadow-[0_10px_22px_-14px_rgba(255,106,0,0.9)]'
                            : 'bg-white text-slate-400 hover:text-[#ff6a00]'
                        }`}
                        disabled={Boolean(voteLoading[question.id])}
                        onClick={(e) => {
                          e.preventDefault();
                          handleUpvote(question.id);
                        }}
                      >
                        {voteLoading[question.id] === 'up' ? (
                          <Loader2 className="h-[20px] w-[20px] animate-spin" />
                        ) : (
                          <ArrowUp className="h-[24px] w-[24px]" />
                        )}
                      </Button>

                      <div className="min-w-[52px] text-center">
                        <span className="text-xl font-extrabold tabular-nums text-[#1a1a2e]" style={{ fontFamily: 'var(--font-manrope)' }}>
                          {formatVoteCount((question.upVotes?.length || 0) - (question.downVotes?.length || 0))}
                        </span>
                      </div>

                      <Button
                        variant={question.downVotes?.includes(userId) ? 'default' : 'outline'}
                        className={`h-11 w-11 rounded-full border-0 p-0 transition-all ${
                          question.downVotes?.includes(userId)
                            ? 'bg-[#6c7fa2] text-white shadow-[0_10px_22px_-14px_rgba(108,127,162,0.8)]'
                            : 'bg-white text-slate-300 hover:text-[#6c7fa2]'
                        }`}
                        disabled={Boolean(voteLoading[question.id])}
                        onClick={(e) => {
                          e.preventDefault();
                          handleDownvote(question.id);
                        }}
                      >
                        {voteLoading[question.id] === 'down' ? (
                          <Loader2 className="h-[20px] w-[20px] animate-spin" />
                        ) : (
                          <ArrowDown className="h-[24px] w-[24px]" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {index < questions.length - 1 ? (
                    <div className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-slate-100 to-transparent" />
                  ) : null}
                </article>
              );
            })
          ) : (
            <div className="rounded-xl bg-slate-50/70 p-10 text-center text-slate-500">
              No questions yet. Be the first to ask.
            </div>
          )}
        </section>
      </main>

      <div className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-slate-50 bg-white/90 px-6 py-6 pb-8 backdrop-blur-lg md:hidden">
        <div className="flex flex-col items-center justify-center text-[#4647d3] transition-all">
          <span className="text-sm font-bold uppercase tracking-[0.15em]">Feed</span>
        </div>
        <div className="flex flex-col items-center justify-center text-slate-300 transition-all hover:text-[#4647d3]">
          <span className="text-sm font-bold uppercase tracking-[0.15em]">Network</span>
        </div>
        <div className="flex flex-col items-center justify-center text-slate-300 transition-all hover:text-[#4647d3]">
          <span className="text-sm font-bold uppercase tracking-[0.15em]">Inbox</span>
        </div>
        <div className="flex flex-col items-center justify-center text-slate-300 transition-all hover:text-[#4647d3]">
          <span className="text-sm font-bold uppercase tracking-[0.15em]">Me</span>
        </div>
      </div>
    </div>
  );
};

export default Forums;