import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import Modal from '../../components/Modal';
import Button from '../../components/Button';

export default function QrModal({ book, onClose }) {
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    if (!book) return;
    QRCode.toDataURL(`${window.location.origin}/books/qr/${book.qrCode}`, {
      width: 480,
      margin: 2,
    }).then(setDataUrl);
  }, [book]);

  return (
    <Modal open={Boolean(book)} title="QR-код книги" onClose={onClose}>
      <div className="print-area">
        {dataUrl && (
          <img className="qr-preview" src={dataUrl} alt={`QR-код книги «${book.title}»`} />
        )}
        <p className="center" style={{ padding: 0 }}>
          {book?.title}
        </p>
      </div>
      <div className="row row--end">
        <a className="btn btn--secondary" href={dataUrl} download={`${book?.qrCode}.png`}>
          Скачать
        </a>
        <Button onClick={() => window.print()}>Распечатать</Button>
      </div>
    </Modal>
  );
}
