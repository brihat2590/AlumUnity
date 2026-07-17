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
import { Calendar, Clock, MapPin, Plus, Video, ArrowUpRight } from 'lucide-react';
import { Inter, Manrope } from 'next/font/google';

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

  const [events, setEvents] = useState<{ id: string }[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEventData({ ...eventData, [name]: value });
  };

  const handleSaveEvent = async () => {
    const data = { ...eventData, author: userId };
    const response = await createEvent(data);
    if (response.success) {
      toast.success('Event created successfully!');
      fetchEvents();
      setEventData({
        title: '',
        description: '',
        date: '',
        meet_link: '',
        location: '',
      });
      setIsDialogOpen(false);
    } else {
      toast.error(`Failed to create event: ${response.message}`);
    }
  };

  function ConfirmJoinLink({ meetLink }: { meetLink: string }) {
    const handleConfirm = () => {
      window.location.href = meetLink;
    };

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="h-9 rounded-full border border-[#4647d3]/20 bg-indigo-50/60 px-4 text-xs font-semibold text-[#4647d3] transition-all hover:bg-[#4647d3] hover:text-white"
          >
            Join Now <ArrowUpRight className="ml-1 h-3 w-3" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-100 bg-white p-6 shadow-xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#1a1a2e]">Join Meeting</DialogTitle>
            <DialogDescription className="text-slate-500">Are you sure you want to join this virtual meeting?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-full border-slate-200 text-slate-600 hover:bg-slate-50">
                Cancel
              </Button>
            </DialogTrigger>
            <Button onClick={handleConfirm} className="rounded-full bg-[#4647d3] text-white hover:bg-[#3c3db8]">
              Yes, Join
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const fetchEvents = async () => {
    const response = await getAllEvents();
    if (!response.success) {
      toast.error(`Failed to fetch events: ${response.message}`);
      return;
    }
    if (response.success) {
      const sorted = (response.data || []).sort(
        (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      setEvents(sorted);
    } else {
      toast.error(`Failed to fetch events: ${response.message}`);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const formatEventTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  const formatEventDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      month: d.toLocaleDateString(undefined, { month: 'short' }),
      day: d.getDate(),
      full: d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }),
    };
  };

  const isUpcoming = (dateStr: string) => new Date(dateStr) >= new Date();

  return (
    <div className={`${manrope.variable} ${inter.variable} min-h-screen text-[#1a1a2e]`}>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 md:px-8">
        <header className="mb-10 sm:mb-14">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <h1
                className="text-3xl font-extrabold tracking-tight text-[#1a1a2e] sm:text-4xl md:text-5xl"
                style={{ fontFamily: 'var(--font-manrope)' }}
              >
                The Events
              </h1>
              <p
                className="max-w-lg text-sm leading-relaxed text-slate-500"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                Discover and join upcoming events scheduled for alumni and students.
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="h-11 gap-2 rounded-full bg-[#4647d3] px-5 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:bg-[#3c3db8]">
                  <Plus className="h-4 w-4" />
                  Create New Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-100 bg-white p-0 shadow-xl sm:max-w-[520px]">
                <div className="border-b border-slate-100 px-6 py-5">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-[#1a1a2e]" style={{ fontFamily: 'var(--font-manrope)' }}>
                      Create New Event
                    </DialogTitle>
                    <DialogDescription className="text-sm text-slate-500">
                      Fill in the details below to host a new event for the community.
                    </DialogDescription>
                  </DialogHeader>
                </div>
                <div className="grid gap-5 px-6 py-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Event Title
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Annual Alumni Meetup 2026"
                      value={eventData.title}
                      onChange={handleChange}
                      className="h-11 rounded-xl border-slate-200 bg-slate-50 text-sm transition-all focus:border-[#4647d3]/30 focus:bg-white focus:ring-2 focus:ring-[#4647d3]/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Description
                    </Label>
                    <textarea
                      id="description"
                      name="description"
                      placeholder="What is this event about?"
                      value={eventData.description}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-[#4647d3]/30 focus:bg-white focus:ring-2 focus:ring-[#4647d3]/10"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Date & Time
                      </Label>
                      <Input
                        id="date"
                        name="date"
                        type="datetime-local"
                        value={eventData.date}
                        onChange={handleChange}
                        className="h-11 rounded-xl border-slate-200 bg-slate-50 px-3 text-sm transition-all focus:border-[#4647d3]/30 focus:bg-white focus:ring-2 focus:ring-[#4647d3]/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Location
                      </Label>
                      <Input
                        id="location"
                        name="location"
                        placeholder="Main Hall, Block A"
                        value={eventData.location}
                        onChange={handleChange}
                        className="h-11 rounded-xl border-slate-200 bg-slate-50 text-sm transition-all focus:border-[#4647d3]/30 focus:bg-white focus:ring-2 focus:ring-[#4647d3]/10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meet_link" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Virtual Link <span className="font-normal normal-case tracking-normal text-slate-400">(Optional)</span>
                    </Label>
                    <Input
                      id="meet_link"
                      name="meet_link"
                      placeholder="https://meet.google.com/xyz-abc-def"
                      value={eventData.meet_link}
                      onChange={handleChange}
                      className="h-11 rounded-xl border-slate-200 bg-slate-50 text-sm transition-all focus:border-[#4647d3]/30 focus:bg-white focus:ring-2 focus:ring-[#4647d3]/10"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                  <Button
                    variant="ghost"
                    onClick={() => setIsDialogOpen(false)}
                    className="h-10 rounded-full px-5 text-sm font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveEvent}
                    className="h-10 rounded-full bg-[#4647d3] px-6 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#3c3db8]"
                  >
                    Save Event
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <section>
          {events.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event: any) => {
                const dateInfo = formatEventDate(event.date);
                const upcoming = isUpcoming(event.date);
                return (
                  <article
                    key={event.id}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#4647d3]/25 hover:shadow-[0_20px_40px_-20px_rgba(70,71,211,0.35)]"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-14 w-14 flex-col items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-[#4647d3]">
                          <span className="text-xs font-semibold uppercase leading-none tracking-wider">{dateInfo.month}</span>
                          <span className="text-xl font-extrabold leading-none" style={{ fontFamily: 'var(--font-manrope)' }}>
                            {dateInfo.day}
                          </span>
                        </div>
                        <div>
                          <h3
                            className="line-clamp-1 text-base font-bold text-[#1a1a2e] transition-colors group-hover:text-[#4647d3]"
                            style={{ fontFamily: 'var(--font-manrope)' }}
                          >
                            {event.title}
                          </h3>
                          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock className="h-3 w-3" />
                            <span>{formatEventTime(event.date)}</span>
                          </div>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          upcoming
                            ? 'bg-indigo-50 text-[#4647d3]'
                            : 'bg-slate-50 text-slate-400'
                        }`}
                      >
                        {upcoming ? 'Upcoming' : 'Past'}
                      </span>
                    </div>

                    <p
                      className="mb-4 line-clamp-3 flex-grow text-sm leading-relaxed text-slate-500"
                      style={{ fontFamily: 'var(--font-inter)' }}
                    >
                      {event.description}
                    </p>

                    <div className="space-y-2.5 border-t border-slate-50 pt-4">
                      {event.location && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50">
                            <MapPin className="h-3.5 w-3.5 text-[#4647d3]" />
                          </div>
                          <span className="text-sm font-medium">{event.location}</span>
                        </div>
                      )}
                      {event.meet_link && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50">
                              <Video className="h-3.5 w-3.5 text-[#4647d3]" />
                            </div>
                            <span className="text-sm font-medium">Virtual</span>
                          </div>
                          <ConfirmJoinLink meetLink={event.meet_link} />
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-20 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-50">
                <Calendar className="h-10 w-10 text-[#4647d3]" />
              </div>
              <h3
                className="mb-2 text-xl font-bold text-[#1a1a2e]"
                style={{ fontFamily: 'var(--font-manrope)' }}
              >
                No upcoming events
              </h3>
              <p
                className="mb-6 max-w-sm text-sm leading-relaxed text-slate-500"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                There are no events scheduled at the moment. Create one and bring the community together.
              </p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="h-11 gap-2 rounded-full bg-[#4647d3] px-6 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#3c3db8]"
              >
                <Plus className="h-4 w-4" />
                Create an event
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Events;
