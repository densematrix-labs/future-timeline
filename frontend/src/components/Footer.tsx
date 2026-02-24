import { useTranslation } from 'react-i18next'
import styles from './Footer.module.css'

export default function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.container}`}>
        <div className={styles.copyright}>
          <span className={styles.icon}>⏳</span>
          <span>© {year} Future Timeline Generator</span>
        </div>
        <div className={styles.links}>
          <a href="https://densematrix.ai" target="_blank" rel="noopener noreferrer">
            {t('footer.builtBy')} DenseMatrix
          </a>
        </div>
      </div>
    </footer>
  )
}
