import React, { useEffect, useState } from 'react';
import {
  FaCheckCircle,
  FaEdit,
  FaExclamationCircle,
  FaPlus,
  FaSave,
  FaTimes
} from 'react-icons/fa';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
];

const createFormData = (profileData) => ({
  fullName: profileData.name || '',
  email: profileData.email || '',
  dateOfBirth: profileData.dateOfBirth || '',
  gender: profileData.gender || '',
  idNumber: profileData.idNumber || '',
  placeOfBirth: profileData.placeOfBirth || '',
  nationality: profileData.nationality || '',
  department: profileData.department || '',
  className: profileData.class || '',
  avatar: profileData.avatar || PRESET_AVATARS[0]
});

const StudentProfile = ({
  profileData = {},
  onUpdateProfile,
  loading = false,
  error = ''
}) => {
  const [formData, setFormData] = useState(() => createFormData(profileData));
  const [isEditing, setIsEditing] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const hasStudentProfile = Boolean(profileData.id);
  const hasIssuedCertificate = profileData.hasIssuedCertificate;

  useEffect(() => {
    setFormData(createFormData(profileData));
  }, [profileData]);

  const handleChange = (field) => (event) => {
    setFormData((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setFormError('Ảnh đại diện không được vượt quá 1 MB.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setFormData((current) => ({ ...current, avatar: reader.result }));
        setFormError('');
      } else {
        setFormError('Không thể đọc ảnh đại diện đã chọn.');
      }
    };
    reader.onerror = () => setFormError('Không thể đọc ảnh đại diện đã chọn.');
    reader.readAsDataURL(file);
  };

  const handleCancel = () => {
    setFormData(createFormData(profileData));
    setFormError('');
    setIsEditing(false);
    setShowPresets(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      const updates = {
        email: formData.email.trim(),
        avatar_url: formData.avatar
      };
      if (!hasIssuedCertificate) {
        Object.assign(updates, {
          full_name: formData.fullName.trim(),
          date_of_birth: formData.dateOfBirth,
          gender: formData.gender,
          id_number: formData.idNumber.trim(),
          place_of_birth: formData.placeOfBirth.trim(),
          nationality: formData.nationality.trim(),
          department: formData.department.trim(),
          class_name: formData.className.trim()
        });
      } else {
        updates.id_number = formData.idNumber.trim();
      }

      await onUpdateProfile(updates);
      setIsEditing(false);
      setShowPresets(false);
      setToastMsg('Cập nhật hồ sơ cá nhân thành công.');
      window.setTimeout(() => setToastMsg(''), 3000);
    } catch (saveError) {
      setFormError(saveError.message || 'Không thể cập nhật hồ sơ cá nhân.');
    } finally {
      setSaving(false);
    }
  };

  const isFieldDisabled = (field) => {
    if (!isEditing || loading || saving || !hasStudentProfile) return true;
    if (
      hasIssuedCertificate &&
      !['email', 'idNumber', 'avatar'].includes(field)
    ) {
      return true;
    }
    return false;
  };

  const statusLabels = {
    issued: 'Đã tốt nghiệp',
    eligible: 'Đủ điều kiện tốt nghiệp',
    studying: 'Đang học',
    suspended: 'Tạm dừng'
  };

  return (
    <div className="std-view">
      <div className="std-page-header">
        <div className="std-page-title-area">
          <h2>Thông tin cá nhân</h2>
          <p>Xem hồ sơ sinh viên và cập nhật thông tin khi cần thiết.</p>
        </div>
        {!isEditing ? (
          <button
            type="button"
            className="std-btn-primary"
            onClick={() => {
              setFormError('');
              setIsEditing(true);
            }}
            disabled={loading || !hasStudentProfile}
          >
            <FaEdit /> Chỉnh sửa
          </button>
        ) : (
          <button
            type="button"
            className="std-btn-secondary"
            onClick={handleCancel}
            disabled={saving}
          >
            <FaTimes /> Hủy
          </button>
        )}
      </div>

      {error && (
        <div className="std-profile-error" role="alert">
          <FaExclamationCircle /> {error}
        </div>
      )}

      <div className="std-profile-wrapper">
        <div className="std-profile-avatar-card">
          <div className="std-profile-avatar-container">
            <img
              src={formData.avatar}
              alt="Ảnh đại diện"
              className="std-profile-avatar"
            />
            {isEditing && (
              <>
                <label
                  className="std-profile-avatar-upload"
                  htmlFor="student-avatar-file-input"
                  title="Tải ảnh đại diện"
                >
                  <FaPlus />
                </label>
                <input
                  id="student-avatar-file-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                />
              </>
            )}
          </div>

          <div className="std-profile-name">{profileData.name || 'Sinh viên'}</div>
          <div className="std-profile-id">MSSV: {profileData.id || '—'}</div>
          <div className="std-profile-role">Sinh viên</div>

          {isEditing && (
            <button
              type="button"
              className="std-btn-secondary"
              style={{ marginTop: '20px', fontSize: '12px', padding: '6px 12px' }}
              onClick={() => setShowPresets((current) => !current)}
            >
              Chọn ảnh mẫu có sẵn
            </button>
          )}

          {showPresets && (
            <div className="std-profile-avatar-presets">
              {PRESET_AVATARS.map((url, index) => (
                <button
                  type="button"
                  key={url}
                  aria-label={`Chọn ảnh mẫu ${index + 1}`}
                  onClick={() => {
                    setFormData((current) => ({ ...current, avatar: url }));
                    setShowPresets(false);
                  }}
                  className={`std-profile-avatar-preset ${
                    formData.avatar === url ? 'active' : ''
                  }`}
                >
                  <img src={url} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="std-card" style={{ marginBottom: 0 }}>
          {loading ? (
            <p className="std-profile-loading">Đang tải hồ sơ sinh viên...</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="std-form-grid">
                <div className="std-form-group">
                  <label htmlFor="student-profile-code">Mã số sinh viên (MSSV)</label>
                  <input
                    id="student-profile-code"
                    className="std-input"
                    value={profileData.id || ''}
                    disabled
                    readOnly
                  />
                </div>
                <div className="std-form-group">
                  <label htmlFor="student-profile-name">Họ và tên</label>
                  <input
                    id="student-profile-name"
                    className="std-input"
                    value={formData.fullName}
                    onChange={handleChange('fullName')}
                    disabled={isFieldDisabled('fullName')}
                    required
                  />
                </div>
                <div className="std-form-group">
                  <label htmlFor="student-profile-school">Trường</label>
                  <input
                    id="student-profile-school"
                    className="std-input"
                    value={profileData.schoolName || ''}
                    disabled
                    readOnly
                  />
                </div>
                <div className="std-form-group">
                  <label htmlFor="student-profile-email">Email liên hệ *</label>
                  <input
                    id="student-profile-email"
                    type="email"
                    className="std-input"
                    value={formData.email}
                    onChange={handleChange('email')}
                    disabled={isFieldDisabled('email')}
                    required
                  />
                </div>
                <div className="std-form-group">
                  <label htmlFor="student-profile-dob">Ngày sinh *</label>
                  <input
                    id="student-profile-dob"
                    type="date"
                    className="std-input"
                    value={formData.dateOfBirth}
                    onChange={handleChange('dateOfBirth')}
                    disabled={isFieldDisabled('dateOfBirth')}
                    required
                  />
                </div>
                <div className="std-form-group">
                  <label htmlFor="student-profile-gender">Giới tính</label>
                  <select
                    id="student-profile-gender"
                    className="std-input"
                    value={formData.gender}
                    onChange={handleChange('gender')}
                    disabled={isFieldDisabled('gender')}
                    required
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div className="std-form-group">
                  <label htmlFor="student-profile-id-number">Số CCCD *</label>
                  <input
                    id="student-profile-id-number"
                    className="std-input"
                    value={formData.idNumber}
                    onChange={handleChange('idNumber')}
                    disabled={isFieldDisabled('idNumber')}
                    pattern="\d{12}"
                    title="CCCD phải gồm đúng 12 chữ số"
                    required
                  />
                </div>
                <div className="std-form-group">
                  <label htmlFor="student-profile-place-of-birth">Nơi sinh</label>
                  <input
                    id="student-profile-place-of-birth"
                    className="std-input"
                    value={formData.placeOfBirth}
                    onChange={handleChange('placeOfBirth')}
                    disabled={isFieldDisabled('placeOfBirth')}
                  />
                </div>
                <div className="std-form-group">
                  <label htmlFor="student-profile-nationality">Quốc tịch</label>
                  <input
                    id="student-profile-nationality"
                    className="std-input"
                    value={formData.nationality}
                    onChange={handleChange('nationality')}
                    disabled={isFieldDisabled('nationality')}
                  />
                </div>
                <div className="std-form-group">
                  <label htmlFor="student-profile-department">Ngành / Khoa</label>
                  <input
                    id="student-profile-department"
                    className="std-input"
                    value={formData.department}
                    onChange={handleChange('department')}
                    disabled={isFieldDisabled('department')}
                  />
                </div>
                <div className="std-form-group">
                  <label htmlFor="student-profile-class">Lớp</label>
                  <input
                    id="student-profile-class"
                    className="std-input"
                    value={formData.className}
                    onChange={handleChange('className')}
                    disabled={isFieldDisabled('className')}
                  />
                </div>
                <div className="std-form-group">
                  <label htmlFor="student-profile-status">Trạng thái học tập</label>
                  <input
                    id="student-profile-status"
                    className="std-input"
                    value={profileData.graduationStatus === 'issued' ? 'Đã cấp bằng' : statusLabels[profileData.graduationStatus] || ''}
                    disabled
                    readOnly
                  />
                </div>
              </div>

              {formError && (
                <div className="std-profile-error" role="alert">
                  <FaExclamationCircle /> {formError}
                </div>
              )}
              {isEditing && (
                <div className="std-profile-actions">
                  <button
                    type="button"
                    className="std-btn-secondary"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    <FaTimes /> Hủy
                  </button>
                  <button
                    type="submit"
                    className="std-btn-primary"
                    disabled={saving || !hasStudentProfile}
                  >
                    <FaSave /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>

      {toastMsg && (
        <div className="std-toast success" role="status">
          <FaCheckCircle /> {toastMsg}
        </div>
      )}
    </div>
  );
};

export default StudentProfile;
