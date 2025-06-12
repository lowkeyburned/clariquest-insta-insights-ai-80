
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
import Debug from "./pages/Debug";
import NotFound from "./pages/NotFound";

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
    path: "/debug",
    element: <Debug />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
