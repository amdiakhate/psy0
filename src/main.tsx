import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import App from './app/App';
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

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Today /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'train', element: <Train /> },
      { path: 'guided', element: <Guided /> },
      { path: 'simulation', element: <Simulation /> },
      { path: 'sprint', element: <Sprint /> },
      { path: 'tips', element: <Tips /> },
      { path: 'tips/:id', element: <Tips /> },
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
