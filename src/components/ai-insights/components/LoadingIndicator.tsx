
const LoadingIndicator = () => {
  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] rounded-lg p-4 bg-clari-darkBg border border-clari-darkAccent">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-clari-gold/60 animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-clari-gold/60 animate-pulse delay-75"></div>
          <div className="w-2 h-2 rounded-full bg-clari-gold/60 animate-pulse delay-150"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;
