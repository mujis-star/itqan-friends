"use client";
import React from "react";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { BookOpen, Award, Palette } from "lucide-react";

export const AboutExperience = () => {
  const cards = [
    {
      title: "Knowledge",
      subtitle: "Academic Excellence",
      icon: <BookOpen className="text-primary mb-4" size={32} />,
      desc: "Cultivating a culture of continuous learning and intellectual growth through rigorous academic discourse and shared resources.",
      delay: 0.1,
    },
    {
      title: "Leadership",
      subtitle: "Future Makers",
      icon: <Award className="text-accent mb-4" size={32} />,
      desc: "Empowering students to take charge, make decisions, and lead initiatives that shape the future of our digital campus.",
      delay: 0.2,
    },
    {
      title: "Creativity",
      subtitle: "Arts & Media",
      icon: <Palette className="text-primary mb-4" size={32} />,
      desc: "Fostering an environment where artistic expression meets technological innovation, giving voice to unique perspectives.",
      delay: 0.3,
    },
  ];

  return (
    <section id="about" className="pt-28 md:pt-36 pb-24 relative z-10 scroll-mt-28">
      <div className="container mx-auto px-6">
        <SectionHeader
          eyebrow="The ITQAN Experience"
          title={
            <>
              Where <span className="gradient-text">Potential</span> meets Opportunity
            </>
          }
          description="ITQAN Union is more than a student club. It's a comprehensive ecosystem designed to forge the leaders of tomorrow."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-16">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: card.delay, duration: 0.5 }}
            >
              <Card hoverEffect className="h-full flex flex-col justify-between p-7 border-white/10">
                <div>
                  {card.icon}
                  <h3 className="text-2xl font-bold mb-1 text-white">{card.title}</h3>
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-3">
                    {card.subtitle}
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed font-normal">
                    {card.desc}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
