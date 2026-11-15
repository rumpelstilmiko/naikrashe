export default function Button({
  variant = 'primary',
  loading = false,
  disabled,
  children,
  ...props
}) {
  return (
    <button
      className={`btn btn--${variant}`}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && <span className="spinner spinner--inline" aria-hidden="true" />}
      {children}
    </button>
  );
}
