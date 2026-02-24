import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { getPaymentSuccess } from '../lib/api'
import { getDeviceId } from '../lib/fingerprint'
import { useTokenStore } from '../lib/tokenStore'
import styles from './PaymentSuccessPage.module.css'

export default function PaymentSuccessPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const checkoutId = searchParams.get('checkout_id')
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [productSku, setProductSku] = useState<string | null>(null)
  
  const { fetchTokens, tokensRemaining, isSubscription } = useTokenStore()

  useEffect(() => {
    const verify = async () => {
      if (!checkoutId) {
        setError('Missing checkout ID')
        setIsLoading(false)
        return
      }

      try {
        const deviceId = await getDeviceId()
        const result = await getPaymentSuccess(checkoutId, deviceId)
        
        if (result.status === 'completed') {
          setProductSku(result.product_sku)
          await fetchTokens()
        } else {
          setError('Payment not yet completed')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to verify payment')
      } finally {
        setIsLoading(false)
      }
    }

    verify()
  }, [checkoutId, fetchTokens])

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>{t('success.verifying')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={`container ${styles.error}`}>
          <span className={styles.errorIcon}>⚠️</span>
          <h1>{t('success.errorTitle')}</h1>
          <p>{error}</p>
          <Link to="/" className="btn">{t('success.backHome')}</Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <motion.div
          className={styles.content}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className={styles.icon}>✨</div>
          <h1>{t('success.title')}</h1>
          <p className={styles.subtitle}>{t('success.subtitle')}</p>
          
          <div className={styles.details}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>{t('success.plan')}</span>
              <span className={styles.statValue}>
                {t(`pricing.${productSku}.name`)}
              </span>
            </div>
            
            <div className={styles.stat}>
              <span className={styles.statLabel}>{t('success.tokensAvailable')}</span>
              <span className={styles.statValue}>
                {isSubscription ? '∞' : tokensRemaining}
              </span>
            </div>
          </div>
          
          <Link to="/" className={`btn btn-primary ${styles.btn}`}>
            {t('success.startGenerating')}
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
