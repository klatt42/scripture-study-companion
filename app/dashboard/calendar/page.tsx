'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import DashboardHeader from '@/components/DashboardHeader';

interface Event {
  id: string;
  title: string;
  event_type: string;
  start_time: string;
  end_time?: string;
  location?: string;
  description?: string;
  reminder_minutes?: number;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('service');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('10:00');
  const [duration, setDuration] = useState('60');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [reminder, setReminder] = useState('1440'); // 24 hours default

  useEffect(() => {
    fetchEvents();
    // Set default date to next Sunday at 10 AM
    const nextSunday = getNextSunday();
    setEventDate(nextSunday.toISOString().split('T')[0]);
  }, []);

  const getNextSunday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + daysUntilSunday);
    return nextSunday;
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/calendar');
      const data = await response.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error('Failed to fetch events');
    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    // Combine date and time into ISO format
    const startDateTime = `${eventDate}T${eventTime}:00`;

    // Calculate end time based on duration
    const start = new Date(startDateTime);
    const end = new Date(start.getTime() + parseInt(duration) * 60000);

    try {
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          event_type: eventType,
          event_date: start.toISOString(),
          end_time: end.toISOString(),
          location,
          description,
          reminder_minutes: parseInt(reminder),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      setShowForm(false);
      resetForm();
      fetchEvents();
    } catch (err: any) {
      alert('Failed to save event: ' + err.message);
    }
  };

  const resetForm = () => {
    setTitle('');
    setEventType('service');
    const nextSunday = getNextSunday();
    setEventDate(nextSunday.toISOString().split('T')[0]);
    setEventTime('10:00');
    setDuration('60');
    setLocation('');
    setDescription('');
    setReminder('1440');
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      service: 'bg-purple-100 text-purple-800',
      meeting: 'bg-blue-100 text-blue-800',
      event: 'bg-green-100 text-green-800',
      holiday: 'bg-red-100 text-red-800',
      study: 'bg-yellow-100 text-yellow-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getEventTypeIcon = (type: string) => {
    const icons = {
      service: '⛪',
      meeting: '👥',
      event: '📅',
      holiday: '🎉',
      study: '📖',
    };
    return icons[type as keyof typeof icons] || '📅';
  };

  // Group events by date
  const groupedEvents = events.reduce((acc, event) => {
    const date = new Date(event.start_time).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  const sortedDates = Object.keys(groupedEvents).sort((a, b) =>
    new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <div className="min-h-screen">
      {/* Shared Header with gold color scheme */}
      <DashboardHeader
        showBackLink
        pageTitle="Ministry Calendar"
        pageIcon="📅"
        colorScheme="gold"
        rightContent={
          <button
            onClick={() => setShowForm(true)}
            className="text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)';
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
            }}
          >
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        }
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Event Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6">Schedule New Event</h2>
            <form onSubmit={handleSaveEvent} className="space-y-4">
              {/* Event Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Sunday Morning Service"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Event Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="service">Sunday Service</option>
                  <option value="meeting">Meeting</option>
                  <option value="event">Special Event</option>
                  <option value="holiday">Holiday/Celebration</option>
                  <option value="study">Bible Study</option>
                </select>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Duration and Location */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                    <option value="180">3 hours</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Main Sanctuary"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Reminder */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reminder</label>
                <select
                  value={reminder}
                  onChange={(e) => setReminder(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="60">1 hour before</option>
                  <option value="720">12 hours before</option>
                  <option value="1440">1 day before</option>
                  <option value="2880">2 days before</option>
                  <option value="10080">1 week before</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes/Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Sermon topic, special music, guest speaker, etc."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
                >
                  Save Event
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); resetForm(); }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Events List */}
        {events.length === 0 && !showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No events scheduled</h3>
            <p className="text-gray-600 mb-6">Start by adding your upcoming services and ministry events</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Add Your First Event
            </button>
          </div>
        )}

        {sortedDates.map((date) => (
          <div key={date} className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              📆 {new Date(date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </h2>
            <div className="space-y-3">
              {groupedEvents[date]
                .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                .map((event) => (
                <div key={event.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{getEventTypeIcon(event.event_type)}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.event_type)}`}>
                            {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
                          </span>
                        </div>
                      </div>

                      <div className="ml-11 space-y-1 text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                          🕐 {new Date(event.start_time).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                          {event.end_time && (
                            <span>
                              - {new Date(event.end_time).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </span>
                          )}
                        </p>
                        {event.location && (
                          <p className="flex items-center gap-2">
                            📍 {event.location}
                          </p>
                        )}
                        {event.description && (
                          <p className="mt-2 text-gray-700">{event.description}</p>
                        )}
                        {event.reminder_minutes && (
                          <p className="text-xs text-gray-500 mt-2">
                            🔔 Reminder: {event.reminder_minutes >= 1440
                              ? `${Math.floor(event.reminder_minutes / 1440)} day(s) before`
                              : `${event.reminder_minutes} minutes before`}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
