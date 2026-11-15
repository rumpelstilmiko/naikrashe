import Modal from './Modal';
import Button from './Button';

export default function ConfirmModal({
  open,
  title,
  text,
  confirmLabel = 'Подтвердить',
  loading,
  onConfirm,
  onClose,
}) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <p>{text}</p>
      <div className="row row--end">
        <Button variant="secondary" onClick={onClose}>
          Отмена
        </Button>
        <Button variant="danger" loading={loading} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
