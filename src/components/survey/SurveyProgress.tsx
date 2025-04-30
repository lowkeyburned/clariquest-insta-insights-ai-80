
interface SurveyProgressProps {
  currentQuestion: number;
  totalQuestions: number;
}

const SurveyProgress = ({ currentQuestion, totalQuestions }: SurveyProgressProps) => {
  const progressPercentage = Math.round(((currentQuestion + 1) / totalQuestions) * 100);
  
  return (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        <span className="text-sm text-clari-muted">
          Question {currentQuestion + 1} of {totalQuestions}
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
