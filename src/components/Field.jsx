import { useId } from 'react';

export default function Field({ label, error, as: Tag = 'input', children, ...props }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <Tag
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      >
        {children}
      </Tag>
      {error && (
        <p id={`${id}-error`} className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}
