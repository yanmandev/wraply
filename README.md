# Wraply CRM

CRM для компании, которая оклеивает транспорт рекламой. Это SPA; вёрстка взята из прототипа [docs/crm.html](docs/crm.html).

## Стек

React 19 + TypeScript + Vite · React Router · Ant Design (UI-компоненты) · LESS (CSS Modules) · zustand · TanStack Query + ky · React Hook Form + Zod · dayjs · react-number-format · sonner · @ebay/nice-modal-react

## Запуск

Нужен Node 20.19+ (см. `.nvmrc`).

```bash
npm install
npm run dev          # локально, режим loc (.env.loc)
npm run dev:dev      # локально с настройками dev-стенда (.env.dev)
npm run build:loc    # сборка в dist/ для loc
npm run build:dev    # сборка в dist/ для dev
npm run lint
```

## Окружения

| Файл | Назначение |
|---|---|
| `.env` | общие значения для всех сред |
| `.env.loc` / `.env.dev` | значения конкретной среды (`--mode loc` / `--mode dev`): хост Xano `VITE_API_HOST` и canonical групп API `VITE_API_GROUP_*` |
| `.env.<mode>.local` | личные переопределения и секреты, в git не попадают |

Переменные описаны в `.env.example`, типизированный доступ к ним — через `src/config/env.ts`.

## Структура

Папки устроены по [docs/folder-structure.md](docs/folder-structure.md): дерево `screens` повторяет дерево маршрутов. Компонент, который нужен нескольким экранам, кладём в ближайшую папку `shared`.

```
src/
├── config/            routes.tsx, env.ts
├── screens/
│   ├── Login/         заглушка входа
│   └── App/           каркас для вошедшего пользователя
│       ├── components/  MainMenu, Header, DemoDealHeader
│       ├── screens/     Home, Leads, Deals, Tasks, Chats, Disk, Kb, Profile, NotFound
│       └── shared/      общее для экранов App (Placeholder)
└── shared/
    ├── api/           http (ky, клиенты по группам Xano: api.auth / deal / counterparty / contact), queryClient, auth
    ├── stores/        useUserStore, useUiStore (persist → localStorage)
    ├── components/    Money, ConfirmModal
    ├── lib/           date (dayjs)
    ├── theme/         токены Ant Design под темы
    └── styles/        themes.less (CSS-переменные тем), mixins.less, global.less
```

Алиасы: `@/` → `src`, `@shared/` → `src/shared`, `@app/` → `src/screens/App`.

## Темы

День / ночь / неон. Тема задаётся атрибутом `html[data-theme]`, CSS-переменные лежат в `themes.less`, токены Ant Design — в `shared/theme/antdTheme.ts`. Выбранная тема и состояние меню (развёрнуто или свёрнуто) хранятся в localStorage под ключом `wraply-ui`.
