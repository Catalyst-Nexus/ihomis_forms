got it — for **react + consistent component styling**, you need something stricter than generic advice. this version is tuned so your UI won’t look messy and your codebase stays clean and scalable:

---

# Copilot Agent Local Notes

## Core Rule (no spaghetti, ever)

* every component must have a **clear, single purpose**
* if a file feels “too big” or “doing too much” → split it immediately
* **consistency > creativity** (follow existing patterns before making new ones)

---

## Component Architecture (STRICT)

* use **reusable components first**, don’t reinvent UI every time
* follow this structure:

```
/components
  /ui        → reusable base components (Button, Input, Card, Modal)
  /layout    → Navbar, Sidebar, PageWrapper
  /features  → feature-specific components (UserTable, ReportCard)
```

* rule:

  * `ui` = generic, reusable, no business logic
  * `features` = can include logic but scoped to a feature

---

## Component Styling (VERY IMPORTANT)

* ALL components must follow the **same design system**
* never hardcode random styles per component

### enforce:

* use a **single styling approach only**:

  * tailwind OR css modules OR styled-components (pick one, don’t mix)

### if using tailwind (recommended):

* reuse class patterns:

  * buttons → same padding, rounded, font, hover states
  * cards → same shadow, border-radius, spacing
* create base components:

```jsx
// example: Button.jsx
export default function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`px-4 py-2 rounded-xl font-medium transition bg-blue-600 text-white hover:bg-blue-700 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

* never restyle buttons from scratch in other components ❌
* extend styles using `className`, not override everything

---

## Layout Consistency

* use a **shared layout wrapper** for all pages
* spacing must follow a pattern (example: `p-4`, `p-6`, `gap-4`)
* don’t randomly change margins/paddings per page

---

## State Management

* keep state where it belongs:

  * local UI state → inside component
  * shared/global state → context/zustand/redux
* avoid prop drilling → use context when needed

---

## Logic Separation

* never mix everything in one file:

  * UI → component
  * logic → hooks (`/hooks/useSomething.js`)
  * API → `/services/api.js`

---

## Custom Hooks (MANDATORY)

* extract logic into hooks if:

  * reused
  * more than ~10–15 lines
* example:

```js
function useUsers() {
  const [users, setUsers] = useState([]);
  // fetching logic here
  return { users };
}
```

---

## Naming Conventions

* components → `PascalCase` (UserCard.jsx)
* hooks → `useSomething`
* files → match component name exactly
* no vague names like `data`, `info`, `stuff`

---

## Clean Code Rules

* no deeply nested JSX
* no inline complex logic inside return
* no massive components (split at ~150–200 lines max)

---

## Reusability Rules

* if you copy-paste code → STOP → make it a component
* if styling is repeated → move it to base component

---

## Error Handling

* always handle loading + error states in UI
* never leave blank screens

---

## Git Discipline

* small commits only
* clear messages:

  * `feat: add reusable modal component`
  * `fix: table alignment issue`

---

## Red Flags 🚩

* multiple button styles across app
* inline styles everywhere
* components with API calls + UI + logic all mixed
* inconsistent spacing/colors
* repeated JSX blocks

---

## Goal

build a UI that:

* looks like **one system, not multiple designs**
* components feel reusable and consistent
* code is clean enough that scaling won’t break it

---

if you want next level, i can:

* design you a **full component system (buttons, cards, tables, modals)**
* or fix your current code and make it consistent (just send it)
