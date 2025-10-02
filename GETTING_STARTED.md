# 🎯 Getting Started with StreakMaster

## ✅ Status: PRODUCTION READY

Your app is fully built, tested, and ready to use! Here's everything you need to know.

---

## 🚀 Run Locally (Right Now)

```bash
# 1. Install dependencies (first time only)
npm install

# 2. Start development server
npm run dev
```

**Open your browser:** http://localhost:5173

That's it! The app is running. 🎉

---

## 📱 What You'll See

### Step 1: Welcome Screen
- Message: "Most people quit in 3 days. You won't."
- Click **Next**

### Step 2: Choose Your Pillars
- Select 2-3 pillars from:
  - 🧼 Hygiene (7 habits)
  - 💪 Fitness (6 habits)
  - 🧠 Self-Mastery (6 habits)
  - 🥗 Diet (6 habits)
  - 📚 Learning (2 habits)
  - 💰 Financial Freedom (7 habits)
- Click **Next**

### Step 3: Commitment
- Pledge to show up for 7 days
- Click **Start Building**

### Step 4: Dashboard
- See today's habits
- Stats: Current streak, Level, Total XP
- Click checkboxes to complete habits
- Watch XP grow and level up!

---

## 🎮 Try These Features

### 1. Complete a Habit
- Click the checkbox next to any habit
- See XP earned (5, 10, or 20 based on difficulty)
- Watch progress bar fill

### 2. View Habit Details
- Click anywhere on a habit card (not the checkbox)
- See **Why** this habit matters
- See **How** to do it properly

### 3. Check Your Profile
- Click the menu icon (☰) in top right
- View all your stats
- See earned badges (unlock at day 7, 30, 100)

### 4. Explore the Heatmap
- Scroll down on dashboard
- See your 365-day journey
- Hover over cells to see counts

### 5. Level Up
- Complete habits daily to earn XP
- Level 1 → 2 needs 100 XP
- Level 5 unlocks Streak Insurance
- Level 10 unlocks Sunday Challenge

---

## 🔥 Understanding the Streak System

### Grace Period (3 AM)
- Complete yesterday's tasks until 3 AM
- Prevents unfair midnight streak breaks
- Example: It's 2 AM Tuesday? You can still mark Monday's tasks ✅

### 80% Threshold
- Don't need to complete ALL habits
- Complete 80%+ to keep your streak
- Example: 10 daily habits? Complete 8 to maintain streak

### Anti-Gaming
- 5-minute cooldown between completions
- Can't mark tomorrow's tasks
- Max 3 hours retroactive marking

---

## 💎 XP & Leveling

### Difficulty Tiers
- **Easy** (Green): 5 XP
- **Medium** (Orange): 10 XP
- **Hard** (Red): 20 XP

### Leveling Formula
- Level 1 → 2: 100 XP
- Level 2 → 3: 200 XP
- Level N → N+1: N × 100 XP

### Weekly/Monthly Tasks
- Weekly tasks: 1.5× XP multiplier
- Monthly tasks: 3× XP multiplier

---

## 🏆 Badges

Unlock these achievements:

1. **Rising Star** ⭐
   - Complete 7-day streak

2. **Unstoppable** 🔥
   - Complete 30-day streak

3. **Mastery Mode** 👑
   - Complete 100-day streak

4. **Sunday Warrior** ⚔️
   - Complete ALL tasks on a Sunday
   - Requires Level 10+

---

## 🎯 Sunday Challenge

**Unlock at Level 10:**
- Every Sunday, complete ALL your daily tasks
- Earn **3X XP** on everything
- Great for weekend motivation boost

**Example:**
- Normal day: 10 tasks × 10 XP = 100 XP
- Sunday: 10 tasks × 30 XP = 300 XP! 🔥

---

## 🛡️ Streak Insurance

**Unlock at Level 5:**
- Cost: 50 XP
- Protects your streak if you miss a day
- Max 2 uses per month
- Buy from profile page

**Use case:**
- You're sick or traveling
- Can't complete 80% of tasks
- Use insurance to save your 45-day streak!

---

## 📈 Progressive Overload

Some habits automatically scale:

**Example: Reading**
- Day 1-29: Read 10 pages
- Day 30-59: Read 15 pages
- Day 60+: Read 20 pages

**Example: Steps**
- Day 1-29: Walk 10,000 steps
- Day 30-59: Walk 12,000 steps
- Day 60+: Walk 15,000 steps

---

## 📱 Install as PWA

### On Mobile (Android/iOS)
1. Open app in Chrome/Safari
2. Tap menu (⋮ or Share icon)
3. Select "Add to Home Screen"
4. Tap "Install"

### On Desktop
1. Open in Chrome/Edge
2. Look for install icon (⊕) in address bar
3. Click "Install"

**Benefits:**
- Works offline
- Faster loading
- Native app feel
- No browser UI

---

## 🔧 Customization

Want to modify habits, colors, or rules?

**Edit `prd.json`:**

```json
{
  "theme": {
    "colors": {
      "background": "#000000",  // Change theme
      "text": "#FFFFFF"
    }
  },
  "pillars": [...],  // Add/edit habits
  "streak_rules": {
    "grace_period_hours": 3,  // Adjust rules
    "minimum_completion_rate": 0.8
  },
  "xp_system": {
    "difficulty_tiers": {
      "easy": 5,  // Change XP values
      "medium": 10,
      "hard": 20
    }
  }
}
```

**Then rebuild:**
```bash
npm run build
```

---

## 🌐 Deploy to Production

### Fastest: Vercel (1 minute)
```bash
npm i -g vercel
vercel
```

### Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod
```

### GitHub Pages
See `DEPLOYMENT.md` for detailed steps.

**Full guide:** Read [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 📂 Project Files

**Key files to know:**
- `prd.json` - All app configuration
- `src/store/useStore.ts` - Global state management
- `src/utils/streakEngine.ts` - Streak calculation logic
- `src/utils/xpSystem.ts` - XP and leveling logic
- `src/components/` - Reusable UI components
- `src/pages/` - Main app screens

---

## 🐛 Troubleshooting

### App won't start
```bash
rm -rf node_modules
npm install
npm run dev
```

### Build fails
```bash
npm run build
# Check errors in terminal
```

### Data not saving
1. Open DevTools (F12)
2. Application → IndexedDB
3. Check if `streak-master-db` exists
4. If not, clear browser cache

### Habits not showing
- Make sure you selected pillars in onboarding
- Check `prd.json` has habits defined
- Restart dev server

---

## 💡 Tips for Best Experience

1. **Set a daily time**
   - Complete habits at same time each day
   - Morning works best for most

2. **Start small**
   - Pick 2-3 pillars initially
   - Don't overwhelm yourself

3. **Use habit details**
   - Click cards to see Why & How
   - Reference guides when stuck

4. **Track progress**
   - Check profile weekly
   - Celebrate milestones

5. **Don't break the chain**
   - Use grace period wisely
   - Buy insurance if needed
   - 80% is enough!

---

## 📊 What Data Is Stored

**In IndexedDB (local browser storage):**
- Your habit completions
- Current streak
- XP and level
- Selected pillars
- Badges earned

**NOT stored:**
- Personal information
- Email/password
- Location data
- Usage analytics

**All data stays on your device!** 🔒

---

## 🚀 Next Steps

### For Users:
1. ✅ Run the app locally
2. ✅ Complete onboarding
3. ✅ Mark your first habits
4. ✅ Install as PWA
5. ✅ Build your streak!

### For Developers:
1. ✅ Explore the codebase
2. ✅ Customize `prd.json`
3. ✅ Deploy to Vercel/Netlify
4. ✅ Share with friends
5. ✅ Gather feedback

---

## 📚 Additional Resources

- **README.md** - Full documentation
- **DEPLOYMENT.md** - Deploy to any platform
- **PROJECT_SUMMARY.md** - Technical overview
- **START.md** - Quick start guide

---

## 🎉 You're Ready!

Your StreakMaster app is:
- ✅ Fully functional
- ✅ Production-ready
- ✅ Offline-capable
- ✅ PWA-enabled
- ✅ Mobile-responsive
- ✅ Well-documented
- ✅ Easy to deploy

**Start building your unbreakable habits today! 💪**

---

## 💬 Need Help?

1. Check browser console (F12) for errors
2. Read documentation files
3. Inspect `prd.json` configuration
4. Review code comments

**Happy habit building! 🚀**
