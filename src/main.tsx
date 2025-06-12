import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Survey from "./pages/Survey";
import SurveyResultsPage from "./pages/SurveyResults";
import BusinessDashboard from "./pages/BusinessDashboard";
import InstagramData from "./pages/InstagramData";
import Campaign from "./pages/Campaign";
import Settings from "./pages/Settings";
import Share from "./pages/Share";
import Webhooks from "./pages/Webhooks";
import Chat from "./pages/Chat";
import Debug from "./pages/Debug";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/survey/:id",
    element: <Survey />,
  },
  {
    path: "/survey/results/:id",
    element: <SurveyResultsPage />,
  },
  {
    path: "/business/:id",
    element: <BusinessDashboard />,
  },
  {
    path: "/instagram/:id",
    element: <InstagramData />,
  },
  {
    path: "/campaign/:id",
    element: <Campaign />,
  },
  {
    path: "/settings/:id",
    element: <Settings />,
  },
  {
    path: "/share/:id",
    element: <Share />,
  },
  {
    path: "/webhooks/:id",
    element: <Webhooks />,
  },
  {
    path: "/chat/:id",
    element: <Chat />,
  },
  {
    path: "/debug",
    element: <Debug />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
