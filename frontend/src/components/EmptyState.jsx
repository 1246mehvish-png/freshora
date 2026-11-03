export default function EmptyState({ icon = '📭', title = 'Nothing here yet', message = '', action = null }) {
    return (
        <div className="empty-state">
            <div className="empty-icon">{icon}</div>
            <h3>{title}</h3>
            {message && <p>{message}</p>}
            {action && <div className="mt-3">{action}</div>}
        </div>
    );
}