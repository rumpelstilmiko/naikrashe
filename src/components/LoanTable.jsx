import { dueTone, formatDate, formatMoney } from '../utils/format';

export default function LoanTable({ loans, showStudent = false, showDue = true, renderActions }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Книга</th>
            {showStudent && <th>Студент</th>}
            <th>Выдана</th>
            <th>{showDue ? 'Вернуть до' : 'Возвращена'}</th>
            <th>Штраф</th>
            {renderActions && <th />}
          </tr>
        </thead>
        <tbody>
          {loans.map((loan) => (
            <tr key={loan.id}>
              <td>{loan.book.title}</td>
              {showStudent && <td>{loan.student.fullName}</td>}
              <td>{formatDate(loan.issuedAt)}</td>
              <td>
                {showDue ? (
                  <span className={`badge badge--${dueTone(loan.dueDate)}`}>
                    {formatDate(loan.dueDate)}
                  </span>
                ) : (
                  formatDate(loan.returnedAt)
                )}
              </td>
              <td>{loan.fine > 0 ? formatMoney(loan.fine) : '—'}</td>
              {renderActions && <td className="actions">{renderActions(loan)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
