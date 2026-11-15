import Button from './Button';

export default function ErrorState({ error, onRetry }) {
  return (
    <div className="empty" role="alert">
      <p className="empty__title">Не удалось загрузить данные</p>
      <p className="muted">{error?.userMessage}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Повторить
        </Button>
      )}
    </div>
  );
}
