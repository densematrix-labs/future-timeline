import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import styles from './Timeline.module.css'

interface TimelineEvent {
  year: number
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  category: string
}

interface TimelineProps {
  events: TimelineEvent[]
  subject: string
  summary: string
}

const impactColors = {
  high: 'var(--color-cyan)',
  medium: 'var(--color-magenta)',
  low: 'var(--color-amber)'
}

const categoryIcons: Record<string, string> = {
  technology: '🔮',
  business: '📈',
  social: '👥',
  scientific: '🔬',
  personal: '🎯'
}

export default function Timeline({ events, subject, summary }: TimelineProps) {
  const { t } = useTranslation()

  return (
    <div className={styles.timeline}>
      <motion.div 
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className={styles.subject}>{t('timeline.futureOf')} {subject}</h2>
        <p className={styles.summary}>{summary}</p>
      </motion.div>

      <div className={styles.track}>
        <div className={styles.line} />
        
        {events.map((event, index) => (
          <motion.div
            key={event.year}
            className={`${styles.event} ${index % 2 === 0 ? styles.left : styles.right}`}
            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
          >
            <div className={styles.node} style={{ borderColor: impactColors[event.impact] }}>
              <span className={styles.year}>{event.year}</span>
            </div>
            
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.category}>{categoryIcons[event.category] || '📌'}</span>
                <span 
                  className={styles.impact}
                  style={{ color: impactColors[event.impact] }}
                >
                  {event.impact.toUpperCase()}
                </span>
              </div>
              <h3 className={styles.title}>{event.title}</h3>
              <p className={styles.description}>{event.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
