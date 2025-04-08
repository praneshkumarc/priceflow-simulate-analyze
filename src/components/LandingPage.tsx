
import React from 'react';
import { Hero } from '@/components/ui/hero';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background">
      <Hero 
        title="Dynamic Price Prediction for iPhone"
        subtitle="Optimize your pricing strategy with AI-powered analytics and real-time market insights."
        actions={[
          {
            label: "Login",
            href: "/auth",
            variant: "default"
          }
        ]}
        titleClassName="text-5xl md:text-6xl font-extrabold text-app-blue-600"
        subtitleClassName="text-lg md:text-xl max-w-[600px]"
        actionsClassName="mt-8"
      />
    </div>
  );
};

export default LandingPage;
