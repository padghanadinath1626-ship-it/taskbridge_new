import '../styles/TaskPanel.css';

/**
 * TaskPanel Component
 * @param {Object} task - Task object with id, title, description, status, priority, deadline, createdAt, creator, manager
 * @param {Function} onClose - Callback when closing the panel
 * @param {ReactNode} onAction - Action buttons/content for the panel
 */
export const TaskPanel = ({ task, onClose, onAction }) => {
  if (!task) return null;

  return (
    <div className="task-panel-overlay" onClick={onClose}>
      <div className="task-panel" onClick={(e) => e.stopPropagation()}>
        <div className="task-panel-header">
          <h2>{task.title}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="task-panel-content">
          <div className="panel-section">
            <h3>Description</h3>
            <p>{task.description || 'No description provided'}</p>
          </div>

          <div className="panel-grid">
            <div className="panel-field">
              <label>Status</label>
              <span className={`status ${task.status}`}>{task.status}</span>
            </div>
            <div className="panel-field">
              <label>Priority</label>
              <span className={`priority-badge ${task.priority?.toLowerCase()}`}>{task.priority}</span>
            </div>
          </div>

          <div className="panel-grid">
            <div className="panel-field">
              <label>Created By</label>
              <span>{task.creator?.name || 'Unknown'}</span>
            </div>
            <div className="panel-field">
              <label>Assigned To</label>
              <span>{task.manager?.name || 'Unassigned'}</span>
            </div>
          </div>

          {task.deadline && (
            <div className="panel-field">
              <label>Deadline</label>
              <span>{new Date(task.deadline).toLocaleDateString()}</span>
            </div>
          )}

          {task.createdAt && (
            <div className="panel-field">
              <label>Created</label>
              <span>{new Date(task.createdAt).toLocaleString()}</span>
            </div>
          )}
        </div>

        {onAction && (
          <div className="task-panel-actions">
            {onAction}
          </div>
        )}
      </div>
    </div>
  );
};
