import { getStats } from '../../api/admin';
import { useFetch } from '../../hooks/useFetch';
import { formatMoney } from '../../utils/format';
import Spinner from '../../components/Spinner';
import ErrorState from '../../components/ErrorState';

export default function Dashboard() {
  const { data, loading, error, reload } = useFetch(getStats);

  if (loading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const cards = [
    ['Всего книг', data.totalBooks],
    ['Выдано сейчас', data.activeLoans],
    ['Должников', data.debtors],
    ['Неоплаченные штрафы', formatMoney(data.unpaidFines)],
  ];
  const maxCount = Math.max(1, ...data.loansByDay.map((item) => item.count));

  return (
    <>
      <h1>Дашборд</h1>
      <div className="stats">
        {cards.map(([label, value]) => (
          <div key={label} className="card stat">
            <strong>{value}</strong>
            <span className="muted">{label}</span>
          </div>
        ))}
      </div>
      <section className="card">
        <h3>Выдачи за 7 дней</h3>
        <div className="chart">
          {data.loansByDay.map((item) => (
            <div key={item.day} className="chart__bar" title={`${item.day}: ${item.count}`}>
              <span>{item.count}</span>
              <div
                className="chart__fill"
                style={{ height: `${(item.count / maxCount) * 100}%` }}
              />
              <span>{item.day.slice(0, 5)}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
