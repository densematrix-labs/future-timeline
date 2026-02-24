import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './TimelineInput.module.css'

interface TimelineInputProps {
  onGenerate: (subject: string, years: number) => void
  isLoading: boolean
  tokensRemaining: number
}

export default function TimelineInput({ onGenerate, isLoading, tokensRemaining }: TimelineInputProps) {
  const { t } = useTranslation()
  const [subject, setSubject] = useState('')
  const [years, setYears] = useState(10)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (subject.trim() && !isLoading) {
      onGenerate(subject.trim(), years)
    }
  }

  const yearOptions = [5, 10, 25, 50, 100]

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.inputGroup}>
        <label className={styles.label}>{t('input.subjectLabel')}</label>
        <input
          type="text"
          className={styles.input}
          placeholder={t('input.subjectPlaceholder')}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={isLoading}
          maxLength={500}
          data-testid="input-field"
        />
        <span className={styles.hint}>{t('input.subjectHint')}</span>
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label}>{t('input.yearsLabel')}</label>
        <div className={styles.yearButtons}>
          {yearOptions.map(y => (
            <button
              key={y}
              type="button"
              className={`${styles.yearBtn} ${years === y ? styles.active : ''}`}
              onClick={() => setYears(y)}
              disabled={isLoading}
            >
              {y} {t('input.years')}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.actions}>
        <button 
          type="submit" 
          className={`${styles.submitBtn} btn-primary`}
          disabled={isLoading || !subject.trim() || tokensRemaining <= 0}
          data-testid="generate-btn"
        >
          {isLoading ? (
            <span className={styles.loading}>
              {t('input.generating')}
              <span className={styles.dots}>...</span>
            </span>
          ) : (
            <>
              <span className={styles.icon}>⏳</span>
              {t('input.generate')}
            </>
          )}
        </button>
        
        <div className={styles.tokens}>
          <span className={styles.tokenIcon}>⚡</span>
          <span>{tokensRemaining} {t('input.tokensLeft')}</span>
        </div>
      </div>
    </form>
  )
}
