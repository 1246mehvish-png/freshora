export default function Spinner({ small = false, text = 'Loading...' }) {
    return (
        <div className="loading-screen">
            <div className={`spinner ${small ? 'spinner-sm' : ''}`} />
            {!small && <p className="mt-2">{text}</p>}
        </div>
    );
}