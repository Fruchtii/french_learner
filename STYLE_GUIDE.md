# Vokab Style Guide

> **This file documents the mandatory styling conventions for the project.**
> Every contributor (human or AI) MUST follow these rules to prevent recurring readability and consistency issues.

---

## Critical Rules

### 1. Text Must Always Be Readable Against Its Background

The app uses light backgrounds everywhere:
- Page background: `bg-gradient-to-br from-slate-50 to-blue-50`
- Card backgrounds: `bg-white`
- Input backgrounds: `bg-slate-50` or `bg-white`

**NEVER use light text colors on these backgrounds.** All body text must use high-contrast dark colors.

| Element | Required Classes | Forbidden |
|---------|-----------------|-----------|
| Headings | `text-slate-900` | `text-slate-300`, `text-gray-400`, `text-white` on light bg |
| Body text | `text-slate-600` or `text-slate-700` | `text-slate-400` for primary text |
| Input text | `text-slate-900` | `text-gray-300`, `text-slate-400`, no explicit text color |
| Answer display | `text-slate-900` | Any color lighter than `text-slate-700` |
| Muted/secondary | `text-slate-500` | `text-slate-300` or lighter |
| Placeholder | `placeholder:text-slate-400` | No placeholder styling (browser default may be invisible) |

### 2. Input Fields

All text input fields MUST use the shared `.vk-input` class (defined in `globals.css`) or at minimum include ALL of these properties:

```
bg-slate-50 text-slate-900 border-2 border-slate-200
focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10
placeholder:text-slate-400
rounded-xl px-5 py-3 text-lg text-center font-mono
outline-none transition-all duration-200
```

**Key rules:**
- Background: `bg-slate-50` (NOT `bg-white`, NOT transparent, NOT `bg-gray-50` without text color)
- Text: `text-slate-900` (ALWAYS explicit, never rely on inheritance)
- Border: `border-2 border-slate-200` (visible boundary)
- Focus: `focus:border-blue-500` (clear focus indicator)
- Placeholder: `placeholder:text-slate-400` (visible but distinct)

### 3. State-Dependent Input Colors

When an input changes state (correct/incorrect), use these exact combinations:

| State | Background | Border | Text |
|-------|-----------|--------|------|
| Default | `bg-slate-50` | `border-slate-200` | `text-slate-900` |
| Focused | `bg-slate-50` | `border-blue-500` | `text-slate-900` |
| Correct | `bg-green-50` | `border-green-500` | `text-slate-900` |
| Incorrect | `bg-red-50` | `border-red-500` | `text-slate-900` |
| Disabled | `bg-slate-100` | `border-slate-200` | `text-slate-500` |

**The text color is ALWAYS `text-slate-900` except when disabled.** Never change text color based on correctness.

### 4. Card Components

All study cards use white backgrounds with subtle shadows:

```
bg-white rounded-2xl shadow-xl shadow-{color}-200/50 border border-{color}-200 overflow-hidden
```

Content inside cards must always use dark text (`text-slate-900` for headings, `text-slate-600` for body).

### 5. Buttons

| Type | Classes |
|------|---------|
| Primary | `bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-semibold` |
| Success | `bg-green-600 text-white hover:bg-green-700 rounded-xl font-semibold` |
| Danger/Incorrect | `bg-red-50 text-red-700 border-2 border-red-200 hover:bg-red-100` |
| Success/Correct | `bg-green-50 text-green-700 border-2 border-green-200 hover:bg-green-100` |
| Override | `bg-amber-100 text-amber-700 hover:bg-amber-200` |
| Ghost | `bg-slate-100 text-slate-600 hover:bg-slate-200` |
| Toggle Active | `bg-indigo-100 text-indigo-700 border-2 border-indigo-300` |
| Toggle Inactive | `bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-slate-200` |

### 6. Color Palette by Feature

| Feature | Primary Color | Accent |
|---------|--------------|--------|
| Typing mode | Blue (`blue-600`) | `from-blue-600 to-blue-700` |
| Flashcard mode | Teal (`teal-500`) | `from-teal-500 to-cyan-500` |
| ProDeck mode | Purple (`purple-600`) | `from-purple-600 to-indigo-600` |
| Correct feedback | Green | `bg-green-50`, `text-green-600` |
| Incorrect feedback | Red | `bg-red-50`, `text-red-600` |
| Box/Progress | Amber for learning | `text-amber-600` |
| Mastered | Green | `text-green-600` |

### 7. ProDeck Tense Colors

These are fixed and must not change:

| Tense | Background Gradient | Border | Badge |
|-------|-------------------|--------|-------|
| Pr&eacute;sent | `from-blue-50 to-blue-100` | `border-blue-200` | `bg-blue-100 text-blue-700` |
| Pass&eacute; Compos&eacute; | `from-green-50 to-green-100` | `border-green-200` | `bg-green-100 text-green-700` |
| Imparfait | `from-amber-50 to-amber-100` | `border-amber-200` | `bg-amber-100 text-amber-700` |
| Futur Simple | `from-rose-50 to-rose-100` | `border-rose-200` | `bg-rose-100 text-rose-700` |

---

## Shared CSS Classes

The following utility classes are defined in `src/app/globals.css` and should be used whenever possible:

| Class | Use For |
|-------|---------|
| `.vk-input` | All text input fields |
| `.vk-input-correct` | Input in correct state (add alongside `.vk-input`) |
| `.vk-input-incorrect` | Input in incorrect state (add alongside `.vk-input`) |
| `.vk-card` | Study card containers |
| `.vk-btn-primary` | Primary action buttons |
| `.vk-btn-grade-correct` | "I knew it" / correct grading buttons |
| `.vk-btn-grade-incorrect` | "I forgot" / incorrect grading buttons |

---

## Anti-Patterns (DO NOT DO)

1. **Never** use `text-white` or light text on `bg-white` or `bg-slate-50`
2. **Never** omit `text-slate-900` from input fields hoping inheritance works
3. **Never** use `bg-transparent` for inputs (they become invisible)
4. **Never** use `text-gray-*` variants — always use `text-slate-*` for consistency
5. **Never** set input background to match the page background (`from-slate-50`)
6. **Never** remove border from input fields (they need visible boundaries)
7. **Never** use colored text (e.g., `text-blue-600`) for user-typed answer text
