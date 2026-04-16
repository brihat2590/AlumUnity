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
    <div className="max-w-5xl mx-auto px-6 py-12 md:px-8 min-h-screen font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-gray-100 pb-8">
        <div className="space-y-1">
          <h1
            className="mb-8 text-5xl font-extralight tracking-tight text-[#0f172a] md:text-6xl"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            The <span className="font-semibold italic">Events</span> 
          </h1>
          <p className="text-gray-500 text-sm font-light">Discover and join upcoming events scheduled for alumni and students.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-black text-white hover:bg-gray-900 rounded-md px-5 py-2.5 text-sm font-medium transition-colors">
              Create New Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px] rounded-lg bg-white border border-gray-200 shadow-xl p-0">
            <DialogHeader className="px-6 py-5 border-b border-gray-100">
              <DialogTitle className="text-lg font-medium text-gray-900">Add New Event</DialogTitle>
              <DialogDescription className="text-gray-500 text-sm mt-1">
                Fill in the details to host a new event.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 px-6 py-6">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Event Title
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Annual Alumni Meetup 2026"
                  value={eventData.title}
                  onChange={handleChange}
                  className="w-full border-gray-200 rounded-md shadow-sm focus:ring-1 focus:ring-black focus:border-black transition-all text-sm h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Description
                </Label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="What is this event about?"
                  value={eventData.description}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-md shadow-sm focus:ring-1 focus:ring-black focus:border-black transition-all px-3 py-2 text-sm outline-none resize-none"
                  rows={3}
                ></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5 ">
                  <Label htmlFor="date" className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Date & Time
                  </Label>
                  <Input
                    id="date"
                    name="date"
                    type="datetime-local"
                    value={eventData.date}
                    onChange={handleChange}
                    className="w-full border-gray-200 rounded-md shadow-sm focus:ring-1 focus:ring-black focus:border-black transition-all text-sm h-10 px-2 "
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="location" className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Location
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="e.g. Main Hall"
                    value={eventData.location}
                    onChange={handleChange}
                    className="w-full border-gray-200 rounded-md shadow-sm focus:ring-1 focus:ring-black focus:border-black transition-all text-sm h-10"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="meet_link" className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Virtual Link (Optional)
                </Label>
                <Input
                  id="meet_link"
                  name="meet_link"
                  placeholder="https://meet.google.com/..."
                  value={eventData.meet_link}
                  onChange={handleChange}
                  className="w-full border-gray-200 rounded-md shadow-sm focus:ring-1 focus:ring-black focus:border-black transition-all text-sm h-10"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3 rounded-b-lg">
              <Button
                variant="ghost"
                onClick={() => setIsDialogOpen(false)}
                className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 text-sm font-medium rounded-md px-4"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveEvent}
                className="bg-black hover:bg-gray-900 text-white shadow-sm text-sm font-medium rounded-md px-5"
              >
                Save Event
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Section to view all events */}
      <div className="mt-8">
        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event: any) => (
              <div
                key={event.id}
                className="group flex flex-col justify-between bg-white border border-gray-200 rounded-lg hover:border-gray-400 transition-colors duration-200"
              >
                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {new Date(event.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600">
                      Upcoming
                    </span>
                  </div>
                  
                  <h4 className="text-xl font-medium text-gray-900 mb-2 line-clamp-2 leading-tight">{event.title}</h4>
                  <p className="text-gray-500 text-sm mb-6 line-clamp-3 font-light leading-relaxed flex-grow">
                    {event.description}
                  </p>
                  
                  <div className="space-y-2 mt-auto pt-4 border-t border-gray-100/50">
                    <div className="flex items-center text-sm text-gray-600 font-light">
                      <span className="w-16 font-medium text-gray-900 text-xs uppercase tracking-wide">Time</span>
                      <span>{new Date(event.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    
                    {event.location && (
                      <div className="flex items-center text-sm text-gray-600 font-light">
                        <span className="w-16 font-medium text-gray-900 text-xs uppercase tracking-wide">Where</span>
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {event.meet_link && (
                  <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between rounded-b-lg">
                    <div className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Virtual
                    </div>
                    <ConfirmJoinLink meetLink={event.meet_link} />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-lg border border-gray-200 flex flex-col items-center justify-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming events</h3>
            <p className="text-gray-500 text-sm font-light mb-6">There are no events scheduled at the moment.</p>
            <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="text-sm font-medium border-gray-300 rounded-md">
              Create an event
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;