import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { createCheckout } from '../lib/api'
import { getDeviceId } from '../lib/fingerprint'
import styles from './PricingPage.module.css'

const plans = [
  {
    sku: 'starter',
    tokens: 30,
    price: 2.99,
    popular: false
  },
  {
    sku: 'pro',
    tokens: 100,
    price: 7.99,
    popular: true
  },
  {
    sku: 'unlimited',
    tokens: -1, // unlimited
    price: 9.99,
    monthly: true,
    popular: false
  }
]

export default function PricingPage() {
  const { t } = useTranslation()
  const [loadingSku, setLoadingSku] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handlePurchase = async (sku: string) => {
    setLoadingSku(sku)
    setError(null)

    try {
      const deviceId = await getDeviceId()
      const successUrl = `${window.location.origin}/payment/success`
      const result = await createCheckout(sku, deviceId, successUrl)
      window.location.href = result.checkout_url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create checkout')
      setLoadingSku(null)
    }
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>{t('pricing.title')}</h1>
          <p className={styles.subtitle}>{t('pricing.subtitle')}</p>
        </motion.div>

        {error && (
          <div className={styles.error}>
            <span>⚠️</span> {error}
          </div>
        )}

        <div className={styles.grid}>
          {plans.map((plan, index) => (
            <motion.div
              key={plan.sku}
              className={`${styles.card} ${plan.popular ? styles.popular : ''}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {plan.popular && (
                <div className={styles.badge}>{t('pricing.popular')}</div>
              )}
              
              <h2 className={styles.planName}>{t(`pricing.${plan.sku}.name`)}</h2>
              
              <div className={styles.price}>
                <span className={styles.currency}>$</span>
                <span className={styles.amount}>{plan.price}</span>
                {plan.monthly && <span className={styles.period}>/{t('pricing.month')}</span>}
              </div>
              
              <div className={styles.tokens}>
                {plan.tokens === -1 ? (
                  <span className={styles.unlimited}>∞ {t('pricing.unlimited')}</span>
                ) : (
                  <span>{plan.tokens} {t('pricing.generations')}</span>
                )}
              </div>
              
              <ul className={styles.features}>
                {['feature1', 'feature2', 'feature3'].map(f => (
                  <li key={f}>
                    <span className={styles.check}>✓</span>
                    {t(`pricing.${plan.sku}.${f}`)}
                  </li>
                ))}
              </ul>
              
              <button
                className={`${styles.btn} ${plan.popular ? 'btn-primary' : ''}`}
                onClick={() => handlePurchase(plan.sku)}
                disabled={loadingSku !== null}
              >
                {loadingSku === plan.sku ? (
                  <span className={styles.loading}>{t('pricing.processing')}</span>
                ) : (
                  t('pricing.buyNow')
                )}
              </button>
            </motion.div>
          ))}
        </div>

        <div className={styles.guarantee}>
          <span className={styles.guaranteeIcon}>🔒</span>
          <span>{t('pricing.guarantee')}</span>
        </div>
      </div>
    </div>
  )
}
