# 🚀 Quick Start Guide

## First Time Setup

```bash
# Install dependencies (only needed once)
npm install
```

## Run the App

```bash
# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## What to Expect

### 1. Onboarding Flow
- Welcome screen with motivational message
- Select 2-3 pillars to focus on
- Make your commitment

### 2. Main Dashboard
- Today's habit checklist
- Current streak counter
- XP and level progress
- GitHub-style heatmap
- Motivational quotes

### 3. Complete Habits
- Click checkbox to mark habit complete
- Earn XP based on difficulty (5/10/20 XP)
- Watch your streak grow
- Unlock badges

### 4. Profile Page
- View all statistics
- See earned badges
- Track longest streak
- Reset progress (danger zone)

## Features to Try

✅ **Mark habits complete** - Click checkbox on any habit
✅ **View habit details** - Click on habit card to see Why & How
✅ **Sunday Challenge** - Complete all habits on Sunday for 3X XP
✅ **Level up** - Earn enough XP to reach Level 5+ for streak insurance
✅ **Heatmap** - Watch your 365-day journey build up
✅ **Install as PWA** - Add to home screen on mobile/desktop

## Test Edge Cases

- Complete a habit within 3 AM grace period
- Try completing same habit twice (should prevent)
- Skip a day and watch streak break logic
- Complete 80%+ of daily habits to maintain streak
- Level up and unlock new features

## Key Keyboard Shortcuts

- **Ctrl+Shift+I** - Open DevTools (inspect IndexedDB)
- **F12** - Developer console (check for errors)
- **Ctrl+R** - Refresh page

## Troubleshooting

### App won't load
1. Check terminal for errors
2. Run `npm install` again
3. Restart dev server

### Habits not saving
1. Open DevTools → Application → IndexedDB
2. Check if `streak-master-db` exists
3. Clear browser data if needed

### Build errors
```bash
npm run build
```
Check for TypeScript/compilation errors.

## Next Steps

1. **Customize**: Edit `prd.json` to modify habits/rules
2. **Deploy**: Follow `DEPLOYMENT.md` guide
3. **Share**: Get feedback from real users!

---

**Ready to build unbreakable habits! 💪**
