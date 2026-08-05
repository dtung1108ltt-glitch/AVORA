# AVORA Premium Redesign - Quick Reference Guide

## 🎯 What Was Done

### Design Foundation
```css
/* Colors - Use these throughout */
Primary: #6366F1 (Indigo)
Secondary: #06B6D4 (Cyan)
Accent: #8B5CF6 (Purple)
BG Primary: #0B1020 (almost black)
BG Raised: #111827 (dark slate)
BG Overlay: #1A2333 (darker slate)
```

### Component Usage

#### Buttons
```jsx
// Primary (Glowing)
<Button variant="primary" size="lg">Start Journey</Button>

// Secondary (Glassmorphic)
<Button variant="secondary" size="lg">Learn More</Button>

// Ghost (Minimal)
<Button variant="ghost">Cancel</Button>

// Glow (Extra premium for CTAs)
<Button variant="glow" size="lg">Premium Action</Button>

// Danger
<Button variant="danger">Delete</Button>
```

#### Cards
```jsx
// Default Glassmorphism
<Card variant="default" padding="lg">
  Content with premium styling
</Card>

// Glass variant
<Card variant="glass" padding="xl">
  Maximum blur and transparency
</Card>

// Flat variant
<Card variant="flat" padding="md">
  Minimal styling
</Card>
```

#### Styling
```jsx
// Premium shadows
<div className="shadow-premium">Premium shadow</div>
<div className="shadow-premium-lg">Larger shadow</div>
<div className="shadow-premium-xl">Extra large shadow</div>

// Glows
<div className="glow-indigo">Indigo glow</div>
<div className="glow-cyan">Cyan glow</div>
<div className="glow-purple">Purple glow</div>

// Glassmorphism
<div className="glass">Standard glass effect</div>
<div className="glass-sm">Subtle glass</div>
<div className="glass-lg">Heavy glass effect</div>

// Gradients
<div className="gradient-primary">Text gradient</div>
<h1 className="bg-gradient-indigo">Background gradient</h1>
```

---

## 📱 Responsive Design

### Breakpoints
```
sm: 640px (mobile)
md: 768px (tablet)
lg: 1024px (desktop)
xl: 1280px (large)
2xl: 1536px (ultra-wide)
```

### Usage
```jsx
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
  Responsive grid
</div>
```

---

## 🎬 Animations

### Built-in Animations
```jsx
import { motion } from 'framer-motion';

// Fade up
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.7 }}
>
  Content
</motion.div>

// Scale in
<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
>
  Content
</motion.div>

// Hover effects
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click me
</motion.button>
```

### Stagger Animation
```jsx
const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

<motion.div variants={stagger} animate="animate">
  {items.map((item) => (
    <motion.div key={item.id} variants={fadeUpVariant}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

---

## 🌙 Dark/Light Theme

### Usage
```jsx
const { settings, setTheme } = useAccessibility();
const isDark = settings.theme === 'dark';

// Apply theme-specific styles
<div className={isDark ? 'bg-slate-950' : 'bg-white'}>
  Content
</div>
```

### Theme Toggle
```jsx
<button
  onClick={() => setTheme(isDark ? 'light' : 'dark')}
>
  {isDark ? <Sun /> : <Moon />}
</button>
```

---

## 📐 Layout Patterns

### Hero Section
```jsx
<section className="min-h-screen pt-20 pb-32 overflow-hidden flex items-center relative">
  {/* Background effects */}
  <PremiumGlowOrbs isDark={isDark} />
  
  {/* Content grid */}
  <div className="grid lg:grid-cols-2 gap-12 items-center">
    {/* Left: Text content */}
    {/* Right: Visual/Image */}
  </div>
</section>
```

### Feature Grid
```jsx
<section className="py-24 lg:py-32">
  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
    {features.map((feature) => (
      <motion.div
        key={feature.title}
        whileHover={{ y: -8 }}
        className="card"
      >
        {/* Feature content */}
      </motion.div>
    ))}
  </div>
</section>
```

### Stats Section
```jsx
<section className="py-24 lg:py-32">
  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
    {stats.map((stat) => (
      <motion.div key={stat.label} className="card text-center">
        <div className="text-4xl font-bold gradient-text">
          {stat.value}
        </div>
        <p className="text-white/60 mt-2">{stat.label}</p>
      </motion.div>
    ))}
  </div>
</section>
```

---

## 🎨 Color Applications

### For Text
```jsx
// Premium gradient text
<h1 className="gradient-text">Headline</h1>

// Colored text
<p className="text-indigo-400">Indigo text</p>
<p className="text-cyan-400">Cyan text</p>
<p className="text-white/60">Muted white</p>
```

### For Backgrounds
```jsx
// Gradient backgrounds
<div className="bg-gradient-indigo">Indigo gradient</div>
<div className="bg-gradient-primary">Primary gradient</div>

// Colored overlays
<div style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
  Indigo overlay
</div>
```

### For Icons
```jsx
<Icon className="w-6 h-6 text-indigo-400" />
<Icon className="w-6 h-6 text-cyan-400" />
<Icon className="w-6 h-6" style={{ color: '#8B5CF6' }} />
```

---

## 🔨 Creating New Pages

### Template Structure
```jsx
import { motion } from 'framer-motion';

export default function NewPage() {
  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-12 lg:py-20"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Content */}
        </div>
      </motion.section>

      {/* Feature Section */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Content */}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-gradient-to-b from-slate-950 to-slate-900">
        {/* Call to action */}
      </section>
    </div>
  );
}
```

---

## 📋 Checklist for New Features

- [ ] Use premium button variant
- [ ] Apply glassmorphism to cards
- [ ] Add premium shadows
- [ ] Include hover animations
- [ ] Use brand colors (indigo, cyan, purple)
- [ ] Maintain dark theme
- [ ] Ensure responsive design
- [ ] Add smooth transitions
- [ ] Include accessibility features
- [ ] Test on mobile devices
- [ ] Check contrast ratios
- [ ] Verify animation performance

---

## 🚀 Performance Tips

1. **Use CSS animations** instead of JavaScript for better performance
2. **GPU acceleration** - transform and opacity animate best
3. **Lazy load** images and heavy components
4. **Debounce** event handlers
5. **Use motion** for smooth, professional animations
6. **Test** animation performance on lower-end devices

---

## 🎓 Design System Principles

### Colors
- Use CSS variables for consistency
- Maintain proper contrast
- Test in both light and dark modes

### Typography
- Use 8px spacing between lines
- Maintain hierarchy with font weights
- Use -0.02em letter spacing for headlines

### Spacing
- Use 8px base unit
- Keep 24px+ margins between sections
- Use 16px+ padding inside cards

### Animations
- Use 150ms for fast interactions (hover)
- Use 250ms for normal transitions
- Use 400ms for major page changes

### Depth
- Use premium shadows for elevation
- Layer glassmorphism for depth
- Use glow effects for highlights

---

## 🆘 Common Tasks

### Add a new feature card
```jsx
<motion.div
  whileHover={{ y: -8 }}
  className="card p-8"
>
  <Icon className="w-8 h-8 mb-4" style={{ color: '#6366F1' }} />
  <h3 className="text-lg font-bold mb-3">Feature Title</h3>
  <p className="text-white/60">Description</p>
</motion.div>
```

### Create a premium button
```jsx
<Button variant="primary" size="lg" className="glow-indigo shadow-lg">
  Action
  <ArrowRight className="ml-2 w-5 h-5" />
</Button>
```

### Add section spacing
```jsx
<section className="py-24 lg:py-32">
  <div className="max-w-7xl mx-auto px-6 lg:px-8">
    {/* Content */}
  </div>
</section>
```

### Make text gradient
```jsx
<h1 style={{
  background: 'linear-gradient(135deg, #FFFFFF 0%, #6366F1 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}}>
  Headline
</h1>
```

---

## 📞 Need Help?

Refer to:
- `PREMIUM_REDESIGN_SUMMARY.md` - Complete documentation
- `tailwind.config.js` - Color & animation definitions
- `index.css` - Component styles
- Existing pages - Reference implementations

---

## ✨ Remember

- Keep it **premium** but not over-designed
- Maintain **consistency** across pages
- Prioritize **performance** and accessibility
- Use **animations thoughtfully**
- Test on **real devices**

Good luck building amazing features! 🚀
