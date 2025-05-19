
interface SurveyProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  // For backward compatibility
  current?: number;
  total?: number;
}

const SurveyProgress = ({ currentQuestion, totalQuestions, current, total }: SurveyProgressProps) => {
  // Use current/total if provided for backward compatibility
  const currentQ = current !== undefined ? current : currentQuestion;
  const totalQ = total !== undefined ? total : totalQuestions;
  
  const progressPercentage = Math.round(((currentQ) / totalQ) * 100);
  
  return (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        <span className="text-sm text-clari-muted">
          Question {currentQ} of {totalQ}
        </span>
        <span className="text-sm text-clari-muted">
          {progressPercentage}% complete
        </span>
      </div>
      <div className="w-full bg-clari-darkBg rounded-full h-2.5">
        <div 
          className="bg-clari-gold h-2.5 rounded-full" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default SurveyProgress;
