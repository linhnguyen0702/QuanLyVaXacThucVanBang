import React from 'react';
import { FaCheck, FaTrash, FaCheckCircle, FaLink, FaUniversity } from 'react-icons/fa';

const StudentNotifications = ({ 
  notifications = [], 
  onMarkAsRead = () => {}, 
  onMarkAllAsRead = () => {},
  onClearNotification = () => {}
}) => {
  return (
    <div className="std-view">
      <div className="std-page-header">
        <div className="std-page-title-area">
          <h2>Thông báo của tôi</h2>
          <p>Cập nhật trạng thái phê duyệt và lưu trữ Blockchain của các văn bằng, chứng chỉ.</p>
        </div>
        
        {notifications.some(n => n.unread) && (
          <button 
            className="std-btn-secondary" 
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
                notif.type === 'blockchain' ? 'blockchain' : notif.type === 'approve' ? 'approve' : 'issue'
              }`}>
                {notif.type === 'blockchain' ? (
                  <FaLink />
                ) : notif.type === 'approve' ? (
                  <FaCheckCircle />
                ) : (
                  <FaUniversity />
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
        <div className="std-card" style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
          Bạn không có thông báo nào.
        </div>
      )}
    </div>
  );
};

export default StudentNotifications;
