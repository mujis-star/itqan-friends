"use client";
import React, { useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Calendar, MapPin, Clock, Users, Download, Share2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface EventItem {
  id: number;
  title: string;
  category: "Upcoming" | "Today" | "Past";
  date: string;
  isoDate: string;
  time: string;
  location: string;
  seatsLeft?: number;
  description: string;
}

export const UpcomingMissions = () => {
  const [activeTab, setActiveTab] = useState<"Upcoming" | "Today" | "Past">("Upcoming");
  const { toast } = useToast();

  const missions: EventItem[] = [
    {
      id: 1,
      title: "Annual General Assembly 2026",
      category: "Upcoming",
      date: "OCT 15, 2026",
      isoDate: "20261015T100000Z",
      time: "10:00 AM - 02:00 PM",
      location: "Main Auditorium & Live Stream",
      seatsLeft: 14,
      description: "Gathering of all union members to unveil strategic roadmap, elect new wing leaders, and celebrate annual milestones.",
    },
    {
      id: 2,
      title: "Global Leadership Summit",
      category: "Upcoming",
      date: "NOV 02, 2026",
      isoDate: "20261102T140000Z",
      time: "02:00 PM - 06:00 PM",
      location: "ITQAN Digital Campus",
      seatsLeft: 28,
      description: "Keynote talks, panel discussions, and collaborative workshops with industry mentors and alumni leaders.",
    },
    {
      id: 3,
      title: "Creative Innovation Hackathon",
      category: "Past",
      date: "MAY 18, 2026",
      isoDate: "20260518T090000Z",
      time: "09:00 AM - 05:00 PM",
      location: "Innovation Wing Hub",
      description: "48-hour sprint building tech and social impact prototypes. Over 20 teams competed for seed support.",
    },
  ];

  const filteredMissions = missions.filter((m) => m.category === activeTab);

  const generateGoogleCalendarUrl = (mission: EventItem) => {
    const title = encodeURIComponent(mission.title);
    const details = encodeURIComponent(mission.description);
    const location = encodeURIComponent(mission.location);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  };

  const downloadICS = (mission: EventItem) => {
    const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ITQAN Friends//EN
BEGIN:VEVENT
SUMMARY:${mission.title}
DESCRIPTION:${mission.description}
LOCATION:${mission.location}
DTSTART:${mission.isoDate}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${mission.title.replace(/\s+/g, "_")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast("Calendar Event Downloaded", `${mission.title} added as .ics file.`, "success");
  };

  return (
    <section id="events" className="py-24 relative scroll-mt-24">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <SectionHeader
            eyebrow="Mission Control"
            title={
              <>
                Upcoming <span className="gradient-text font-bold">Missions</span>
              </>
            }
            description="Prepare for the next phase of our journey. Join interactive summits, assemblies, and hackathons."
            align="left"
          />

          {/* Timeline Filter Tabs */}
          <div className="flex items-center gap-2 p-1.5 rounded-xl glass border border-white/10 self-start md:self-auto">
            {(["Upcoming", "Past"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === tab
                    ? "bg-primary text-slate-950 shadow-md"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredMissions.map((mission) => (
            <Card
              key={mission.id}
              hoverEffect
              className="p-0 overflow-hidden flex flex-col sm:flex-row border-white/10 hover:border-primary/40 transition-colors"
            >
              {/* Date Block */}
              <div className="bg-slate-900/80 p-6 sm:w-44 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-white/5 text-center">
                <Calendar size={28} className="text-primary mb-2" />
                <div className="text-sm font-bold text-accent tracking-widest uppercase">
                  {mission.date}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                      </span>
                      Confirmed
                    </span>

                    {mission.seatsLeft && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-bold text-primary">
                        <Users size={12} /> {mission.seatsLeft} Seats Left
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{mission.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">
                    {mission.description}
                  </p>

                  <div className="flex flex-wrap gap-4 text-xs text-gray-300">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-primary" /> {mission.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-primary" /> {mission.time}
                    </div>
                  </div>
                </div>

                {/* Calendar Sync Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  <a
                    href={generateGoogleCalendarUrl(mission)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
                      <Share2 size={14} /> Google Cal
                    </Button>
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadICS(mission)}
                    className="text-xs gap-1.5 text-gray-300 hover:text-white"
                  >
                    <Download size={14} /> .ICS
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
