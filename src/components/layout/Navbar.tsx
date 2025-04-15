
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  BarChart2, 
  MessageSquare, 
  Database as DatabaseIcon, 
  MapPin,
  Instagram,
  BrainCircuit,
  Sparkles
} from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-64 h-screen bg-clari-darkCard border-r border-clari-darkAccent">
      <div className="p-4 border-b border-clari-darkAccent">
        <Link to="/" className="flex items-center gap-2">
          <BrainCircuit size={24} className="text-clari-gold" />
          <h1 className="text-xl font-bold text-clari-gold">Clariquest</h1>
        </Link>
      </div>
      <div className="p-4">
        <p className="text-xs text-clari-muted mb-4 uppercase font-semibold">Main Menu</p>
        <ul className="space-y-2">
          <li>
            <Link to="/">
              <Button variant="ghost" className="w-full justify-start gap-2 text-left">
                <LayoutDashboard size={18} />
                Dashboard
              </Button>
            </Link>
          </li>
          <li>
            <Link to="/survey-analysis">
              <Button variant="ghost" className="w-full justify-start gap-2 text-left">
                <BarChart2 size={18} />
                Survey Analysis
              </Button>
            </Link>
          </li>
          <li>
            <Link to="/question-engine">
              <Button variant="ghost" className="w-full justify-start gap-2 text-left">
                <Sparkles size={18} />
                Question Engine
              </Button>
            </Link>
          </li>
          <li>
            <Link to="/instagram-messaging">
              <Button variant="ghost" className="w-full justify-start gap-2 text-left">
                <Instagram size={18} />
                Instagram Messaging
              </Button>
            </Link>
          </li>
          <li>
            <Link to="/location-targeting">
              <Button variant="ghost" className="w-full justify-start gap-2 text-left">
                <MapPin size={18} />
                Location Targeting
              </Button>
            </Link>
          </li>
          <li>
            <Link to="/database">
              <Button variant="ghost" className="w-full justify-start gap-2 text-left">
                <DatabaseIcon size={18} />
                Database
              </Button>
            </Link>
          </li>
          <li>
            <Link to="/ai-insights">
              <Button variant="ghost" className="w-full justify-start gap-2 text-left">
                <BrainCircuit size={18} />
                AI Insights
              </Button>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
