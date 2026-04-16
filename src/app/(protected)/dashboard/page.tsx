'use client'
import React, { useEffect, useState } from 'react';
import { getUserInfo } from '@/firebase/user.controller';
import { getLatestThreeEvents } from '@/firebase/event.controller';
import { getThreeQuestionsWithMostUpvotes } from '@/firebase/questions.controller';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useFirebase } from '@/firebase/firebase.config';
import { toast } from 'sonner';
import { FaSpinner } from 'react-icons/fa';

type DashboardEvent = {
  id: string;
  title: string;
  date: string;
  description: string;
  location?: string;
  meet_link?: string;
};

type DashboardQuestion = {
  id: string;
  question: string;
  posted_by: string;
  upVotes?: string[];
};

const Dashboard = () => {
  const { loggedInUser, authloading } = useFirebase();
  const userId = loggedInUser?.uid || '';

  const [userInfo, setUserInfo] = useState<UserData | null>(null);
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [questions, setQuestions] = useState<DashboardQuestion[]>([]);
  const [userMap, setUserMap] = useState<{ [userId: string]: string }>({});
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);

  useEffect(() => {
    if (authloading) {
      return;
    }

    if (!userId) {
      setIsDashboardLoading(false);
      return;
    }

    let isMounted = true;

    const fetchUserInfo = async () => {
      const response = await getUserInfo(userId);
      if (response.success && response.data) {
        if (isMounted) {
          setUserInfo(response.data as UserData);
        }
      } else {
        toast.error(`Failed to fetch user profile: ${response.message}`);
      }
    };
    

    const fetchEvents = async () => {
      const response = await getLatestThreeEvents();
      if (response.success) {
        if (isMounted) {
          setEvents((response.data || []) as DashboardEvent[]);
        }
      }
    };

    const fetchQuestions = async () => {
      const response = await getThreeQuestionsWithMostUpvotes();
      // if (response.success) {
      //   setQuestions(response.questions);
      // }
      if (response.success) {
        const fetchedQuestions = (response.questions || []) as DashboardQuestion[];
  
        // Extract unique userIds
        const userIds = [...new Set(fetchedQuestions.map((q) => q.posted_by))];
  
        // Fetch user info if not already cached
        const userFetches = await Promise.all(userIds.map(async (id) => {
          if (!userMap[id]) {
            const user = await getUserInfo(id);
            // console.log(user)
            // console.log(user?.data?.name)
            return { id, name: user?.data?.name || 'Unknown User' };
          } else {
            return { id, name: userMap[id] }; // Already cached
          }
        }));
  
        // Update userMap with new names
        const updatedUserMap = { ...userMap };
        userFetches.forEach(({ id, name }) => {
          updatedUserMap[id] = name;
        });

        if (isMounted) {
          setUserMap(updatedUserMap);
          setQuestions(fetchedQuestions);
        }
      } else {
        toast.error(`Failed to fetch questions: ${response.message}`);
      }
    };

    const fetchDashboardData = async () => {
      setIsDashboardLoading(true);
      await Promise.all([fetchUserInfo(), fetchEvents(), fetchQuestions()]);
      if (isMounted) {
        setIsDashboardLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, [authloading, userId]);

  if (authloading || isDashboardLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
              <FaSpinner className="animate-spin text-xl" />
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-gray-500 text-lg">Unable to load dashboard right now.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* User Profile Card */}
      <section className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="md:flex">
          {/* Profile Image Section */}
          <div className="md:w-1/3 bg-gray-100 p-6 flex flex-col items-center justify-center">
            {userInfo?.profilePic ? (
              <img 
                src={userInfo.profilePic} 
                alt="Profile" 
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 text-4xl font-bold">
                {userInfo?.name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="mt-4 text-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                {userInfo?.Role || 'USER'}
              </div>
            </div>
          </div>
          
          {/* Profile Details Section */}
          <div className="md:w-2/3 p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {userInfo.name || 'User Name'}
            </h1>
            <p className="text-gray-600 mb-6">{userInfo.Bio || 'No bio available'}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Batch</h3>
                <p className="text-gray-800">{userInfo?.batch || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Education</h3>
                <p className="text-gray-800">{userInfo?.Education || 'N/A'}</p>
              </div>
            </div>
            
            {/* Skills & Interests */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {userInfo?.skills?.length ? (
                  userInfo.skills.map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No skills listed</p>
                )}
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {userInfo?.interests?.length ? (
                  userInfo.interests.map((interest, index) => (
                    <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      {interest}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No interests listed</p>
                )}
              </div>
            </div>
            
            {/* Social Links */}
            <div className="flex flex-wrap gap-4">
              {userInfo?.linkedIn && (
                <a href={userInfo.linkedIn} target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-700 hover:text-blue-600">
                  <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                  </svg>
                  LinkedIn
                </a>
              )}
              {userInfo?.github && (
                <a href={userInfo.github} target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-700 hover:text-gray-900">
                  <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  GitHub
                </a>
              )}
              {userInfo?.twitter && (
                <a href={userInfo.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-700 hover:text-blue-400">
                  <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                  Twitter
                </a>
              )}
              {userInfo?.portfolio && (
                <a href={userInfo.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-700 hover:text-indigo-600">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  Portfolio
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Upcoming Events</h2>
          <Link href="/events">
            <Button variant="outline" className="text-indigo-600 border-indigo-600 hover:bg-indigo-50">
              View All Events
            </Button>
          </Link>
        </div>
        
        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map(event => (
              <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    {event.location && (
                      <div className="flex items-center text-gray-500">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.location}
                      </div>
                    )}
                    {event.meet_link && (
                      <a href={event.meet_link} target="_blank" rel="noopener noreferrer" className="flex items-center text-indigo-600 hover:text-indigo-800">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Join Online
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-gray-500 italic">No upcoming events available.</p>
          </div>
        )}
      </section>

      {/* Forums Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Top Forum Questions</h2>
          <Link href="/forums">
            <Button variant="outline" className="text-indigo-600 border-indigo-600 hover:bg-indigo-50">
              View All Questions
            </Button>
          </Link>
        </div>
        
        {questions.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {questions.map((question, index) => (
                <li key={question.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex items-start">
                    <div className="flex flex-col items-center mr-4">
                      <span className="text-indigo-600 font-semibold">{question.upVotes?.length || 0}</span>
                      <span className="text-xs text-gray-500">votes</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">{question.question}</h3>
                      <p className="text-sm text-gray-500">Posted by {userMap[question.posted_by] || 'Loading...'}</p>
                    </div>
                    {index === 0 && (
                      <span className="ml-auto px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        Most Popular
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-gray-500 italic">No forum questions available.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
