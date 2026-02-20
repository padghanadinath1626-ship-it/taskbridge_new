import { useEffect, useState } from 'react';
import NotificationService from '../api/NotificationService';
import './DeactivationRequest.css';

export const DeactivationRequestPage = () => {
    const [message, setMessage] = useState('');
    const [recipients, setRecipients] = useState([]);
    const [selectedRecipient, setSelectedRecipient] = useState('');
    const [loading, setLoading] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');
    const [responseType, setResponseType] = useState('');

    useEffect(() => {
        fetchRecipients();
    }, []);

    const fetchRecipients = async () => {
        try {
            const data = await NotificationService.getAllowedRecipients();
            setRecipients(Array.isArray(data) ? data : data?.data || []);
            if (Array.isArray(data) && data.length > 0) setSelectedRecipient(data[0].id);
        } catch (error) {
            console.error('Failed to fetch recipients:', error);
        }
    };

    const showMessage = (msg, type = 'success') => {
        setResponseMessage(msg);
        setResponseType(type);
        setTimeout(() => setResponseMessage(''), 5000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim() || !selectedRecipient) {
            showMessage('Please write a message and select recipient', 'error');
            return;
        }
        setLoading(true);
        try {
            await NotificationService.sendNotification({
                recipientId: selectedRecipient,
                title: 'Reactivation Request',
                message: message,
                type: 'NOTICE'
            });
            showMessage('Request sent successfully', 'success');
            setMessage('');
        } catch (err) {
            showMessage('Failed to send request', 'error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="deactivation-page">
            <div className="card">
                <h2>Account Deactivated</h2>
                <p>Your account has been deactivated by an administrator. You may send a request to an admin to review and reactivate your account.</p>

                {responseMessage && (
                    <div className={`message ${responseType}`}>{responseMessage}</div>
                )}

                <form onSubmit={handleSubmit} className="request-form">
                    <label>Send To</label>
                    <select value={selectedRecipient} onChange={(e) => setSelectedRecipient(e.target.value)}>
                        <option value="">Select recipient</option>
                        {recipients.map(r => (
                            <option key={r.id} value={r.id}>{r.name} ({r.email})</option>
                        ))}
                    </select>

                    <label>Message</label>
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} placeholder="Explain why you need reactivation..."></textarea>

                    <button type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send Request'}</button>
                </form>
            </div>
        </div>
    );
};

export default DeactivationRequestPage;
