import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import App from './app/App';
import { CrashScreen } from './app/CrashScreen';
import { applyTheme, readPreference } from './core/theme';
import Today from './pages/Today';
import Dashboard from './pages/Dashboard';
import Train from './pages/Train';
import Guided from './pages/Guided';
import Simulation from './pages/Simulation';
import Sprint from './pages/Sprint';
import Tips from './pages/Tips';
import Learn from './pages/Learn';
import Settings from './pages/Settings';
import Bilan from './pages/Bilan';
import Mental from './pages/Mental';
import Culture from './pages/Culture';
import { CultureDashboard } from './culture/pages/CultureDashboard';
import { CultureReviewPage } from './culture/pages/CultureReviewPage';
import { CultureQuizPage } from './culture/pages/CultureQuizPage';
import { CultureErrorsPage } from './culture/pages/CultureErrorsPage';
import { CultureSimulationPage } from './culture/pages/CultureSimulationPage';
import { CultureLessonsPage } from './culture/pages/CultureLessonsPage';
import { CultureFavoritesPage } from './culture/pages/CultureFavoritesPage';
import { CultureExpressPage } from './culture/pages/CultureExpressPage';
import { CultureDrillsPage } from './culture/pages/CultureDrillsPage';
import { CultureAirFrancePage } from './culture/pages/CultureAirFrancePage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    // Un plantage ne doit jamais donner l'impression d'avoir tout perdu.
    errorElement: <CrashScreen />,
    children: [
      { index: true, element: <Today /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'train', element: <Train /> },
      { path: 'guided', element: <Guided /> },
      { path: 'simulation', element: <Simulation /> },
      { path: 'sprint', element: <Sprint /> },
      { path: 'tips', element: <Tips /> },
      { path: 'tips/:id', element: <Tips /> },
      { path: 'mental', element: <Mental /> },
      { path: 'mental/:id', element: <Mental /> },
      {
        path: 'culture',
        element: <Culture />,
        children: [
          { index: true, element: <CultureDashboard /> },
          { path: 'air-france', element: <CultureAirFrancePage /> },
          { path: 'review', element: <CultureReviewPage /> },
          { path: 'quiz', element: <CultureQuizPage /> },
          { path: 'errors', element: <CultureErrorsPage /> },
          { path: 'simulation', element: <CultureSimulationPage /> },
          { path: 'lessons', element: <CultureLessonsPage /> },
          { path: 'favorites', element: <CultureFavoritesPage /> },
          { path: 'express', element: <CultureExpressPage /> },
          { path: 'drills', element: <CultureDrillsPage /> },
        ],
      },
      { path: 'learn', element: <Learn /> },
      { path: 'learn/:id', element: <Learn /> },
      { path: 'settings', element: <Settings /> },
      { path: 'bilan', element: <Bilan /> },
    ],
  },
]);

// Le script de index.html a déjà posé l'attribut ; on resynchronise ici, et on
// suit les changements du système tant que la préférence est « systeme ».
applyTheme(readPreference());
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (readPreference() === 'systeme') applyTheme('systeme');
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
