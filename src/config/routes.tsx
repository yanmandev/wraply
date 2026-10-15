import { createBrowserRouter } from 'react-router';
import type { ComponentType } from 'react';
import { RequireAuth } from '@shared/components/RequireAuth';
import App from '@/screens/App';

// Экраны грузятся лениво — отдельный чанк на каждый
const screen = (load: () => Promise<{ default: ComponentType }>) => async () => ({
  Component: (await load()).default,
});

// Дерево маршрутов повторяет структуру папок src/screens (см. docs/folder-structure.md)
export const router = createBrowserRouter([
  { path: '/login', lazy: screen(() => import('@/screens/Login')) },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <App />,
        children: [
          { index: true, lazy: screen(() => import('@app/screens/Home')) },
          { path: 'leads', lazy: screen(() => import('@app/screens/Leads')) },
          { path: 'deals', lazy: screen(() => import('@app/screens/Deals')) },
          { path: 'tasks', lazy: screen(() => import('@app/screens/Tasks')) },
          { path: 'chats', lazy: screen(() => import('@app/screens/Chats')) },
          { path: 'disk', lazy: screen(() => import('@app/screens/Disk')) },
          { path: 'kb', lazy: screen(() => import('@app/screens/Kb')) },
          { path: 'profile', lazy: screen(() => import('@app/screens/Profile')) },
          { path: '*', lazy: screen(() => import('@app/screens/NotFound')) },
        ],
      },
    ],
  },
]);
