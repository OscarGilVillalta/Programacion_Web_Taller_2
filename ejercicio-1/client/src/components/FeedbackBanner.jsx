import { Alert } from 'reactstrap'

function FeedbackBanner({ mensaje, error }) {
  if (!mensaje && !error) {
    return null
  }

  const esError = Boolean(error)
  const texto = error || mensaje

  return (
    <Alert
      color={esError ? 'danger' : 'warning'}
      fade={false}
      className={`feedback-banner${esError ? ' feedback-banner--error' : ''}`}
      aria-live={esError ? 'assertive' : 'polite'}
    >
      <span className="feedback-banner__icon" aria-hidden="true">
        {esError ? '!' : 'i'}
      </span>
      <div className="feedback-banner__content">
        <p className="feedback-banner__label">
          {esError ? 'Revisa el intento' : 'Advertencia del núcleo'}
        </p>
        <p
          className="feedback-banner__text"
          id={esError ? 'feedback-error' : undefined}
        >
          {texto}
        </p>
      </div>
    </Alert>
  )
}

export default FeedbackBanner
