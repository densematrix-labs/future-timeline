import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'
import styles from './Header.module.css'

export default function Header() {
  const { t } = useTranslation()

  return (
    <header className={styles.header}>
      <div className={`container ${styles.container}`}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>⏳</span>
          <span className={styles.logoText}>FUTURE<span className={styles.highlight}>TIMELINE</span></span>
        </Link>
        
        <nav className={styles.nav}>
          <Link to="/" className={styles.navLink}>{t('nav.home')}</Link>
          <Link to="/pricing" className={styles.navLink}>{t('nav.pricing')}</Link>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  )
}
