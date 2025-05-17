
import { Loader2 } from "lucide-react";

interface LoadingIndicatorProps {
  message?: string;
}

const LoadingIndicator = ({ message }: LoadingIndicatorProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 text-clari-muted animate-pulse">
      <Loader2 className="h-6 w-6 animate-spin mb-2" />
      {message ? <p className="text-sm">{message}</p> : <p className="text-sm">Loading...</p>}
    </div>
  );
};

export default LoadingIndicator;
