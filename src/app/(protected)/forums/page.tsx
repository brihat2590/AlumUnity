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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createQuestion, getAllQuestions, createOrremoveUpvoteForQuestions, createOrremoveDownvoteForQuestions } from '@/firebase/questions.controller';
import { getUserInfo } from '@/firebase/user.controller';
import { useFirebase } from '@/firebase/firebase.config';
import Link from 'next/link';
import { ThumbsDown } from 'lucide-react';

const Forums = () => {
  const { loggedInUser } = useFirebase();
  const userId = loggedInUser?.uid || '';
  const [userMap, setUserMap] = useState<{ [userId: string]: string }>({});

  const [questionData, setQuestionData] = useState({
    question: '',
    date: new Date().toISOString(),
  });

  const [questions, setQuestions] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setQuestionData({ ...questionData, [name]: value });
  };

  const handleSaveQuestion = async () => {
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
    const response = await getAllQuestions();
    if (response.success) {
      const fetchedQuestions = response.questions || [];
      const userIds = [...new Set(fetchedQuestions.map((q: any) => q.posted_by))];

      const userFetches = await Promise.all(userIds.map(async (id) => {
        if (!userMap[id]) {
          const user = await getUserInfo(id);
          return { id, name: user?.data?.name || 'Unknown User' };
        } else {
          return { id, name: userMap[id] };
        }
      }));

      const updatedUserMap = { ...userMap };
      userFetches.forEach(({ id, name }) => {
        updatedUserMap[id] = name;
      });

      setUserMap(updatedUserMap);
      setQuestions(fetchedQuestions);
    } else {
      toast.error(`Failed to fetch questions: ${response.message}`);
    }
  };

  const handleUpvote = async (questionId: string) => {
    const response = await createOrremoveUpvoteForQuestions(questionId, userId);
    if (response.success) {
      fetchQuestions();
    } else {
      toast.error(`Failed to upvote: ${response.message}`);
    }
  };

  const handleDownvote = async (questionId: string) => {
    const response = await createOrremoveDownvoteForQuestions(questionId, userId);
    if (response.success) {
      fetchQuestions();
    } else {
      toast.error(`Failed to downvote: ${response.message}`);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="border-b-2 border-gray-100 pb-4 mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Community Forum</h2>
        <p className="text-gray-600 mt-2">Ask questions and engage with the community</p>
      </div>

      <div className="mb-10">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105">
              <PlusIcon className="w-5 h-5 mr-2" />
              Ask a Question
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-800">New Question</DialogTitle>
              <DialogDescription className="text-gray-600">
                Share your question with the community
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="question" className="text-gray-700 font-medium">
                  Your Question
                </Label>
                <textarea
                  id="question"
                  name="question"
                  value={questionData.question}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  rows={4}
                  placeholder="Type your question here..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={handleSaveQuestion}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Post Question
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Recent Questions</h3>
        {questions.length > 0 ? (
          <ul className="space-y-6">
            {questions.map((question: any) => (
              <Link 
                href={`/forums/${question.id}`}
                className="block p-6 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
                key={question.id}
              >
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-900">{question.question}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <UserIcon className="w-4 h-4 mr-1" />
                      <span>{userMap[question.posted_by] || 'Loading...'}</span>
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      <span>{new Date(question.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <Button
                      variant={question.upVotes?.includes(userId) ? 'primary' : 'outline'}
                      className="flex items-center gap-2 text-green-600 hover:text-green-700"
                      onClick={(e) => {
                        e.preventDefault();
                        handleUpvote(question.id);
                      }}
                    >
                      <ThumbsUpIcon className="w-4 h-4" />
                      {question.upVotes?.length || 0}
                    </Button>
                    <Button
                      variant={question.downVotes?.includes(userId) ? 'primary' : 'outline'}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDownvote(question.id);
                      }}
                    >
                      <ThumbsDown className="w-4 h-4" />
                      {question.downVotes?.length || 0}
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </ul>
        ) : (
          <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-xl">
            No questions yet. Be the first to ask!
          </div>
        )}
      </div>
    </div>
  );
};

// Icon components
const PlusIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

const ThumbsUpIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
  </svg>
);

const ThumbsDownIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 15h2.25m8.024-9.75c.011.05.028.1.052.148.591 1.2.924 2.55.924 3.977a8.96 8.96 0 01-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398C20.613 14.547 19.833 15 19 15h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 00.303-.54m.023-8.25H16.48c-.97 0-1.371.1-4.5.5c-1.031.197-1.9.53-2.6.911a15.09 15.09 0 00-2.517 1.608M17.5 15l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M7.5 15h2.25m-4.5 3h2.25" />
  </svg>
);

export default Forums;