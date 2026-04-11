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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createEvent, getAllEvents } from '@/firebase/event.controller';
import { toast } from 'sonner';
import { useFirebase } from '@/firebase/firebase.config';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Events = () => {
  const { loggedInUser } = useFirebase();
  const userId = loggedInUser?.uid || '';

  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    date: '',
    meet_link: '',
    location: '',
  });

  const [events, setEvents] = useState<{id:string}[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State to control dialog visibility

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEventData({ ...eventData, [name]: value });
  };

  const handleSaveEvent = async () => {
    const data = { ...eventData, author: userId };
    const response = await createEvent(data);
    if (response.success) {
      toast.success('Event created successfully!');
      fetchEvents(); // Refresh the list of events
      setEventData({ // Clear the form state
        title: '',
        description: '',
        date: '',
        meet_link: '',
        location: '',
      });
      setIsDialogOpen(false); // Close the dialog
    } else {
      toast.error(`Failed to create event: ${response.message}`);
    }
  };
   function ConfirmJoinLink({ meetLink }: { meetLink: string }) {
    const router = useRouter();
  
    const handleConfirm = () => {
      window.location.href=meetLink
    };
  
    return (
      <Dialog>
        <DialogTrigger asChild>
          <span className="text-indigo-600 hover:text-indigo-800 cursor-pointer underline">
            Join Here
          </span>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Meeting</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to join this meeting?</p>
          <DialogFooter>
            <Button variant="secondary">Cancel</Button>
            <Button onClick={handleConfirm}>Yes, Join</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const fetchEvents = async () => {
    const response = await getAllEvents();
    if(!response.success){
      toast.error(`Failed to fetch events: ${response.message}`);
      return;
    }
    if (response.success) {
      setEvents(response.data || []);
    } else {
      toast.error(`Failed to fetch events: ${response.message}`);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 bg-white min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Events</h2>
          <p className="text-gray-500 mt-1">Discover and join upcoming community events.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-black text-white hover:bg-gray-800 shadow-sm transition-all duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create New Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-xl bg-white border border-gray-100 shadow-2xl">
            <DialogHeader className="pb-4 border-b border-gray-100">
              <DialogTitle className="text-xl font-bold text-gray-900">Add New Event</DialogTitle>
              <DialogDescription className="text-gray-500 mt-1.5">
                Fill in the details to host a new event for the community.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 py-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                  Event Title
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g. Annual Alumni Meetup 2026"
                  value={eventData.title}
                  onChange={handleChange}
                  className="w-full border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description
                </Label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="What is this event about?"
                  value={eventData.description}
                  onChange={handleChange}
                  className="w-full border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent rounded-lg px-3 py-2 outline-none transition-colors resize-none"
                  rows={4}
                ></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                    Date & Time
                  </Label>
                  <Input
                    id="date"
                    name="date"
                    type="datetime-local"
                    value={eventData.date}
                    onChange={handleChange}
                    className="w-full border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                    Location
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="e.g. Main Hall"
                    value={eventData.location}
                    onChange={handleChange}
                    className="w-full border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="meet_link" className="text-sm font-medium text-gray-700">
                  Virtual Meeting Link (Optional)
                </Label>
                <Input
                  id="meet_link"
                  name="meet_link"
                  placeholder="https://meet.google.com/..."
                  value={eventData.meet_link}
                  onChange={handleChange}
                  className="w-full border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                />
              </div>
            </div>
            <DialogFooter className="pt-4 border-t border-gray-100 sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="mr-2 text-gray-600 border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveEvent}
                className="bg-black hover:bg-gray-800 text-white shadow-sm"
              >
                Save Event
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Section to view all events */}
      <div className="mt-8">
        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: any) => (
              <div
                key={event.id}
                className="group flex flex-col justify-between bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-gray-300 hover:shadow-xl transition-all duration-300"
              >
                <div className="p-6 flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                      Upcoming
                    </div>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-black transition-colors">{event.title}</h4>
                  <p className="text-gray-500 text-sm mb-6 line-clamp-3">
                    {event.description}
                  </p>
                  
                  <div className="space-y-3 mt-auto">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium text-gray-900">{new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="mx-2 text-gray-300">•</span>
                      <span>{new Date(event.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    
                    {event.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {event.meet_link && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Virtual
                    </div>
                    <ConfirmJoinLink meetLink={event.meet_link} />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No upcoming events</h3>
            <p className="text-gray-500 max-w-sm mx-auto">There are no events scheduled at the moment. Create one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;