"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Star, Target, Flag, ArrowLeft, Award, Medal } from "lucide-react";
import Link from "next/link";

interface Stat {
  label: string;
  value: string;
}

interface Campaign {
  year: string;
  title: string;
  stats: Stat[];
  media: string;
  festivals: string;
  honors: string;
}

interface AwardWinner {
  name: string;
  award: string;
}

interface AwardCategory {
  category: string;
  winners: AwardWinner[];
}

export default function AchievementsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [awards, setAwards] = useState<AwardCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/achievements.json")
      .then((res) => res.json())
      .then((data) => {
        setCampaigns(data.campaigns || []);
        setAwards(data.awards || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load achievements", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-highlight border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <Link href="/#timeline" className="inline-flex items-center text-gray-400 hover:text-highlight transition-colors mb-12">
        <ArrowLeft className="mr-2" size={20} />
        Back to Home
      </Link>
      
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
          ITQAN <span className="text-highlight">Hall of Fame</span>
        </h1>
        <p className="text-xl text-gray-400">
          A detailed portfolio of our institutional campaigns, records, and student honors.
        </p>
      </div>

      {/* Campaigns Section */}
      <div className="mb-24">
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Target className="text-highlight" size={32} />
          Campaign Records
        </h2>
        <div className="space-y-8">
          {campaigns.map((camp, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              key={camp.year}
              className="glass p-8 rounded-3xl border border-white/10 hover:border-highlight/30 transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-highlight/5 rounded-full blur-3xl -z-10"></div>
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-white">{camp.title}</h3>
                  <div className="text-highlight font-semibold">{camp.year}</div>
                </div>
                
                {/* Stats */}
                <div className="flex gap-4">
                  {camp.stats.map((stat, sIdx) => (
                    <div key={sIdx} className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-center min-w-[100px]">
                      <div className="text-2xl font-black text-white">{stat.value}</div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-black/30 p-5 rounded-2xl border border-white/5">
                  <div className="text-gray-400 text-sm font-semibold mb-2 flex items-center gap-2"><Flag size={16}/> Honors</div>
                  <p className="text-sm text-gray-200">{camp.honors}</p>
                </div>
                <div className="bg-black/30 p-5 rounded-2xl border border-white/5">
                  <div className="text-gray-400 text-sm font-semibold mb-2 flex items-center gap-2"><Trophy size={16}/> Festivals</div>
                  <p className="text-sm text-gray-200">{camp.festivals}</p>
                </div>
                <div className="bg-black/30 p-5 rounded-2xl border border-white/5">
                  <div className="text-gray-400 text-sm font-semibold mb-2 flex items-center gap-2"><Star size={16}/> Media</div>
                  <p className="text-sm text-gray-200">{camp.media}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Awards Section */}
      <div>
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Award className="text-secondary" size={32} />
          Student Honors & Awards
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {awards.map((category, index) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              key={category.category}
              className="bg-white/5 border border-white/10 p-6 rounded-3xl"
            >
              <h3 className="text-xl font-bold text-white mb-6 pb-4 border-b border-white/10">
                {category.category}
              </h3>
              <ul className="space-y-4">
                {category.winners.map((winner, wIdx) => (
                  <li key={wIdx} className="flex gap-4 items-start">
                    <Medal className="text-secondary shrink-0 mt-1" size={20} />
                    <div>
                      <div className="font-bold text-gray-200">{winner.name}</div>
                      <div className="text-sm text-gray-400">{winner.award}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
}
