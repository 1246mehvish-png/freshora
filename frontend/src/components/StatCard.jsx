import './StatCard.css';

export default function StatCard({ icon, label, value, color = 'green' }) {
    return (
        <div className={`stat-card stat-${color}`}>
            <div className="stat-icon">{icon}</div>
            <div className="stat-info">
                <span className="stat-value">{value}</span>
                <span className="stat-label">{label}</span>
            </div>
        </div>
    );
}