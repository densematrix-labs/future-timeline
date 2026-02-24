# AI Future Timeline Generator — Visualize Potential Futures

## Product Overview

| Item | Value |
|------|-------|
| Product Name | AI Future Timeline Generator |
| Slug | future-timeline |
| URL | https://future-timeline.demo.densematrix.ai |
| Frontend Port | 30130 |
| Backend Port | 30131 |

## Core Features

### 1. **Future Vision Generation**
User inputs any subject (person, company, technology, concept) → AI generates a plausible future timeline with major milestones, predictions, and pivotal events.

### 2. **Interactive Timeline Visualization**
Beautiful, interactive SVG-based timeline with:
- Vertical timeline with branching possibilities
- Milestone cards with year, event title, and description
- Hover effects and smooth animations
- Optional "optimistic" vs "pessimistic" paths

### 3. **Export & Share**
- Download as PNG/SVG
- Shareable link
- Social media cards

## User Flow

1. **Landing Page** → Hero with demo timeline animation
2. **Input Form** → Subject (e.g., "AI", "Tesla", "My Career"), Timeframe (5/10/25/50 years)
3. **Generation** → Loading with progress, streaming reveal
4. **Result** → Interactive timeline + export options

## Technical Stack

- **Frontend**: React + Vite (TypeScript)
- **Backend**: Python FastAPI
- **AI**: LLM via llm-proxy.densematrix.ai
- **Deployment**: Docker → langsheng (39.109.116.180)

## Differentiation

- ✅ Free tier with 3 generations per device
- ✅ Beautiful, shareable visualizations
- ✅ No signup required for basic use
- ✅ Multiple timeline styles

## SEO Keywords

### Primary (Homepage Title/H1)
- `ai future timeline generator`
- `future prediction visualization`

### Secondary
- `predict future of [X]`
- `ai roadmap generator`
- `future timeline maker`

### Long-tail (Programmatic SEO)
- `future of [technology] timeline`
- `[company] future predictions 2030`
- `what will [X] look like in 2050`

## Aesthetic Direction

**Retro-futuristic / Sci-fi Interface**
- Dark theme with glowing accents (cyan, magenta, amber)
- Grid patterns, scan lines, holographic effects
- Typography: Orbitron (display), Space Mono (body)
- CRT screen aesthetic with modern polish
- Think: Blade Runner meets clean UI

## Pricing

| Tier | Price | Tokens |
|------|-------|--------|
| Free | $0 | 3 per device |
| Starter | $2.99 | 30 |
| Pro | $7.99 | 100 |
| Unlimited | $9.99/mo | ∞ |

## Completion Criteria

- [ ] Core generation works end-to-end
- [ ] Beautiful timeline visualization
- [ ] 7 languages supported
- [ ] Creem payment integrated
- [ ] Deployed to future-timeline.demo.densematrix.ai
- [ ] SEO optimized
