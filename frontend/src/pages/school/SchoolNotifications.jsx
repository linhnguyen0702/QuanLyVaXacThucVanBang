import React from 'react';
import { FaCheck, FaTrash, FaLink, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';

const SchoolNotifications = ({ 
  notifications = [], 
  onMarkAsRead = () => {}, 
  onMarkAllAsRead = () => {},
  onClearNotification = () => {}
}) => {
  return (
    <div className="sd-view">
      <div className="sd-page-header">
        <div className="sd-page-title-area">
          <h2>Thông báo hệ thống</h2>
          <p>Danh sách các thông báo phê duyệt, ghi nhận Blockchain và cảnh báo hệ thống.</p>
        </div>
        
        {notifications.some(n => n.unread) && (
          <button 
            className="sd-btn-secondary" 
            onClick={onMarkAllAsRead}
            style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FaCheck /> Đánh dấu đọc tất cả
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div style={{ width: '100%' }}>
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`std-notif-card ${notif.unread ? 'unread' : ''}`}
              onClick={() => onMarkAsRead(notif.id)}
            >
              <div className={`std-notif-icon ${
                notif.type === 'blockchain' ? 'blockchain' : notif.type === 'alert' ? 'approve' : 'issue'
              }`} style={{
                backgroundColor: notif.type === 'blockchain' ? '#d1fae5' : notif.type === 'alert' ? '#fef3c7' : '#eff6ff',
                color: notif.type === 'blockchain' ? '#059669' : notif.type === 'alert' ? '#d97706' : '#2563eb',
              }}>
                {notif.type === 'blockchain' ? (
                  <FaLink />
                ) : notif.type === 'alert' ? (
                  <FaExclamationTriangle />
                ) : (
                  <FaShieldAlt />
                )}
              </div>

              <div className="std-notif-content">
                <div className="std-notif-title">{notif.title}</div>
                <div className="std-notif-desc">{notif.desc}</div>
                
                <div className="std-notif-footer">
                  <span className="std-notif-time">{notif.time}</span>
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {notif.unread && (
                      <button 
                        className="std-notif-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkAsRead(notif.id);
                        }}
                      >
                        Đánh dấu đã đọc
                      </button>
                    )}
                    <button 
                      className="std-notif-action"
                      style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onClearNotification(notif.id);
                      }}
                    >
                      <FaTrash style={{ fontSize: '11px' }} /> Xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="sd-card" style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
          Không có thông báo nào.
        </div>
      )}
    </div>
  );
};

export default SchoolNotifications;
