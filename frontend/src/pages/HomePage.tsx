import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import TimelineInput from '../components/TimelineInput'
import Timeline from '../components/Timeline'
import { generateTimeline } from '../lib/api'
import { getDeviceId } from '../lib/fingerprint'
import { useTokenStore } from '../lib/tokenStore'
import styles from './HomePage.module.css'

interface TimelineData {
  timeline: Array<{
    year: number
    title: string
    description: string
    impact: 'high' | 'medium' | 'low'
    category: string
  }>
  summary: string
  subject: string
}

export default function HomePage() {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null)
  
  const { tokensRemaining, fetchTokens, decrementToken } = useTokenStore()

  useEffect(() => {
    fetchTokens()
  }, [fetchTokens])

  const handleGenerate = async (subject: string, years: number) => {
    setIsLoading(true)
    setError(null)

    try {
      const deviceId = await getDeviceId()
      const result = await generateTimeline(subject, years, deviceId)
      setTimelineData(result)
      decrementToken()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate timeline'
      setError(message)
      
      // If payment required, show pricing link
      if (message.includes('No tokens remaining')) {
        setError(t('errors.noTokens'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <motion.div
          className={styles.heroContent}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className={styles.title}>
            {t('hero.title')}
            <span className={styles.titleAccent}>{t('hero.titleAccent')}</span>
          </h1>
          <p className={styles.subtitle}>{t('hero.subtitle')}</p>
        </motion.div>

        {/* Decorative elements */}
        <div className={styles.gridOverlay} />
        <div className={styles.glowOrb1} />
        <div className={styles.glowOrb2} />
      </section>

      {/* Input Section */}
      <section className={styles.inputSection}>
        <div className="container">
          <TimelineInput
            onGenerate={handleGenerate}
            isLoading={isLoading}
            tokensRemaining={tokensRemaining}
          />
          
          {error && (
            <motion.div 
              className={styles.error}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span>⚠️</span> {error}
              {error === t('errors.noTokens') && (
                <Link to="/pricing" className={styles.errorLink}>
                  {t('errors.getPremium')}
                </Link>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* Timeline Result */}
      {timelineData && (
        <section className={styles.resultSection}>
          <div className="container">
            <Timeline
              events={timelineData.timeline}
              subject={timelineData.subject}
              summary={timelineData.summary}
            />
          </div>
        </section>
      )}

      {/* Features Section */}
      {!timelineData && (
        <section className={styles.features}>
          <div className="container">
            <h2 className={styles.featuresTitle}>{t('features.title')}</h2>
            <div className={styles.featureGrid}>
              {['ai', 'visual', 'share', 'multi'].map((key, i) => (
                <motion.div
                  key={key}
                  className={styles.featureCard}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <span className={styles.featureIcon}>
                    {key === 'ai' && '🤖'}
                    {key === 'visual' && '📊'}
                    {key === 'share' && '🔗'}
                    {key === 'multi' && '🌍'}
                  </span>
                  <h3>{t(`features.${key}.title`)}</h3>
                  <p>{t(`features.${key}.desc`)}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
