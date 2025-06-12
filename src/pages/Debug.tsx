
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SurveyDebugPanel from '@/components/debug/SurveyDebugPanel';

const Debug = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-clari-darkBg p-6">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="outline" 
          onClick={() => navigate('/')} 
          className="mb-6 border-clari-gold text-clari-gold hover:bg-clari-gold hover:text-black"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-clari-text mb-2">Survey Debug Panel</h1>
          <p className="text-clari-muted">
            View all available surveys in your database and get working URLs
          </p>
        </div>

        <SurveyDebugPanel />
      </div>
    </div>
  );
};

export default Debug;
