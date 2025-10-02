# StreakMaster - Quick Reference Card

## 🚀 Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
```

## 📊 XP Values

| Difficulty | XP  | Example Habits |
|-----------|-----|----------------|
| Easy      | 5   | Skincare, scent, dress sharp |
| Medium    | 10  | Sleep, meditation, water |
| Hard      | 20  | No alcohol, PPL training, no sugar |

**Multipliers:**
- Weekly tasks: 1.5×
- Monthly tasks: 3×
- Sunday Challenge: 3× (Level 10+)

## 🔥 Streak Rules

- **Grace Period:** 3 hours past midnight
- **Threshold:** 80% of daily tasks
- **Anti-Gaming:** 5-min cooldown, no future tasks
- **Retroactive:** Up to 3 hours back

## 🏆 Badges

| Badge | Requirement | Icon |
|-------|-------------|------|
| Rising Star | 7-day streak | ⭐ |
| Unstoppable | 30-day streak | 🔥 |
| Mastery Mode | 100-day streak | 👑 |
| Sunday Warrior | All tasks on Sunday | ⚔️ |

## 🎯 Level Unlocks

| Level | XP Needed | Unlocks |
|-------|-----------|---------|
| 5 | 1,000 | Streak Insurance |
| 10 | 4,500 | Sunday Challenge |
| 20 | 19,000 | Custom Habits |

## 🧬 Pillars & Habit Count

| Pillar | Habits | Focus |
|--------|--------|-------|
| 🧼 Hygiene | 7 | Sleep, grooming, appearance |
| 💪 Fitness | 6 | Training, nutrition, movement |
| 🧠 Self-Mastery | 6 | Mind, learning, growth |
| 🥗 Diet | 6 | Nutrition, hydration, avoidance |
| 📚 Learning | 2 | Skills, education |
| 💰 Financial | 7 | Money, business, investing |

**Total: 34 habits**

## 🛡️ Streak Insurance

- **Cost:** 50 XP
- **Benefit:** Protects 1 missed day
- **Limit:** 2 uses/month
- **Unlock:** Level 5

## 📈 Progressive Overload

**Reading (self_reading):**
- Day 1-29: 10 pages
- Day 30-59: 15 pages
- Day 60+: 20 pages

**Steps (fitness_steps):**
- Day 1-29: 10,000 steps
- Day 30-59: 12,000 steps
- Day 60+: 15,000 steps

## 🎨 Theme Colors

```css
Background:    #000000 (Pure black)
Text:          #FFFFFF (White)
Accent:        #CCCCCC (Light gray)
Border:        #333333 (Dark gray)

Heatmap:
  Empty:       #1A1A1A
  Low:         #333333
  Medium:      #555555
  High:        #888888
```

## 📱 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| F12 | Open DevTools |
| Ctrl+R | Refresh |
| Ctrl+Shift+I | Inspect Element |

## 🗂️ Storage

**IndexedDB:**
- `userProgress` - User state
- `completedTasks` - Task history

**localStorage:**
- Backup of user progress

## 🔧 Key Files

| File | Purpose |
|------|---------|
| `prd.json` | All app configuration |
| `src/store/useStore.ts` | Global state |
| `src/utils/streakEngine.ts` | Streak logic |
| `src/utils/xpSystem.ts` | XP & levels |

## 📐 Formulas

**Level Up:**
```
XP for Level N = N × 100
Total XP to reach Level N = Σ(i × 100) for i=1 to N-1
```

**Streak Threshold:**
```
Min tasks to maintain streak = ceil(daily_habits × 0.8)
```

**Heatmap Intensity:**
```
Level 0: 0 tasks
Level 1: 1-4 tasks
Level 2: 5-9 tasks
Level 3: 10+ tasks
```

## 🌐 Deployment Targets

| Platform | Config File | Command |
|----------|-------------|---------|
| Vercel | `vercel.json` | `vercel --prod` |
| Netlify | `netlify.toml` | `netlify deploy --prod` |
| GitHub Pages | Update base in vite.config | `npx gh-pages -d dist` |

## 🐛 Quick Debug

**App won't load:**
```bash
rm -rf node_modules dist
npm install
npm run dev
```

**Data not saving:**
1. F12 → Application → IndexedDB
2. Check `streak-master-db`
3. Clear if corrupted

**Build errors:**
```bash
npm run build
# Read terminal errors
```

## 📝 Environment

**Development:**
- Node 18+
- Port: 5173
- HMR: Enabled

**Production:**
- Gzipped: 72 KB
- Load time: < 2s
- PWA: Enabled

## 🎯 Success Metrics

- ✅ 0 TypeScript errors
- ✅ 0 runtime errors
- ✅ 100% offline functionality
- ✅ 95+ Lighthouse score
- ✅ Mobile responsive
- ✅ PWA compliant

## 📞 Help

| Issue | Solution |
|-------|----------|
| Can't install | Check Node version (18+) |
| Dev server fails | Check port 5173 availability |
| Build fails | Run `npm install` again |
| Data lost | Check localStorage backup |
| PWA not installing | Check manifest.json |

---

**Print this card and keep it handy! 📌**

**Full docs:** [GETTING_STARTED.md](GETTING_STARTED.md)
