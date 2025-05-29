
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SurveyQuestion } from "@/utils/types/database";
import { Trash2 } from "lucide-react";

interface QuestionPreviewProps {
  questions: SurveyQuestion[];
  onRemoveQuestion: (index: number) => void;
}

const QuestionPreview: React.FC<QuestionPreviewProps> = ({ questions, onRemoveQuestion }) => {
  const renderQuestionOptions = (question: SurveyQuestion) => {
    if (!question.options) return null;
    
    // Handle both string[] and Record<string, any> types
    const options = Array.isArray(question.options) 
      ? question.options 
      : Object.values(question.options);
    
    return (
      <div className="mt-2 space-y-1">
        {options.map((option, index) => (
          <div key={index} className="text-sm text-gray-600 ml-4">
            • {typeof option === 'string' ? option : String(option)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Question Preview</h3>
      {questions.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No questions added yet</p>
      ) : (
        questions.map((question, index) => (
          <Card key={question.id} className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-sm">
                  Question {index + 1} - {question.question_type}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveQuestion(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-2">{question.question_text}</p>
              {question.required && (
                <span className="text-xs text-red-400">Required</span>
              )}
              {renderQuestionOptions(question)}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default QuestionPreview;
