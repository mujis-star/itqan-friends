"use client";
import React from 'react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calendar, MapPin, Clock } from 'lucide-react';

export const UpcomingMissions = () => {
  const missions = [
    {
      id: 1,
      title: "Annual General Assembly 2026",
      date: "OCT 15",
      year: "2026",
      daysLeft: 92,
      location: "Main Auditorium",
      time: "10:00 AM"
    },
    {
      id: 2,
      title: "Global Leadership Summit",
      date: "NOV 02",
      year: "2026",
      daysLeft: 110,
      location: "Digital Campus",
      time: "02:00 PM"
    }
  ];

  return (
    <section id="events" className="py-24 relative">
      <div className="container mx-auto px-6">
        <SectionHeader 
          eyebrow="Mission Control"
          title={<>Upcoming <span className="gradient-text">Missions</span></>}
          description="Prepare for the next phase of our journey. Register for upcoming events and summits."
          align="left"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {missions.map((mission) => (
            <Card hoverEffect key={mission.id} className="p-0 overflow-hidden flex flex-col sm:flex-row group border-white/10 hover:border-accent/50 transition-colors">
              
              {/* Date Block */}
              <div className="bg-black/50 p-6 sm:w-40 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-white/5">
                <div className="text-xl font-bold text-accent tracking-widest">{mission.date}</div>
                <div className="text-3xl font-black text-white/50 tracking-tighter">{mission.year}</div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm text-highlight font-semibold mb-3">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-highlight opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-highlight"></span>
                    </span>
                    {mission.daysLeft} Days Remaining
                  </div>
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-accent transition-colors">{mission.title}</h3>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-6">
                    <div className="flex items-center gap-1.5"><MapPin size={16} /> {mission.location}</div>
                    <div className="flex items-center gap-1.5"><Clock size={16} /> {mission.time}</div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    View Mission <span className="ml-2">&rarr;</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
