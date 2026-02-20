import { useState, useEffect } from 'react';
import NotificationService from '../api/NotificationService';
import '../styles/SendMessageModal.css';

export const SendMessageModal = ({ users, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        recipientId: '',
        title: '',
        message: '',
        type: 'INSTRUCTION'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [allowedRecipients, setAllowedRecipients] = useState([]);
    const [loadingRecipients, setLoadingRecipients] = useState(true);

    useEffect(() => {
        fetchAllowedRecipients();
    }, []);

    const fetchAllowedRecipients = async () => {
        try {
            setLoadingRecipients(true);
            const recipients = await NotificationService.getAllowedRecipients();
            setAllowedRecipients(Array.isArray(recipients) ? recipients : []);
        } catch (err) {
            console.error('Failed to fetch allowed recipients:', err);
            setError('Failed to load recipients');
            setAllowedRecipients([]);
        } finally {
            setLoadingRecipients(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!formData.recipientId || !formData.title || !formData.message) {
                setError('Please fill in all required fields');
                setLoading(false);
                return;
            }

            await NotificationService.sendNotification({
                recipientId: parseInt(formData.recipientId),
                title: formData.title,
                message: formData.message,
                type: formData.type
            });

            onSuccess('Message sent successfully!');
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Send Message</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label>Recipient *</label>
                        {loadingRecipients ? (
                            <p>Loading recipients...</p>
                        ) : (
                            <select 
                                name="recipientId" 
                                value={formData.recipientId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select a user...</option>
                                {allowedRecipients.map(u => (
                                    <option key={u.id} value={u.id}>
                                        {u.name} ({u.role}) - {u.email}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Title *</label>
                        <input 
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., Task Update, Urgent Notice"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Message *</label>
                        <textarea 
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Enter your message..."
                            rows="5"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Type</label>
                        <select 
                            name="type" 
                            value={formData.type}
                            onChange={handleChange}
                        >
                            <option value="INSTRUCTION">Instruction</option>
                            <option value="NOTICE">Notice</option>
                            <option value="MESSAGE">Message</option>
                        </select>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-send" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Message'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
