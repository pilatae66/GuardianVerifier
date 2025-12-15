import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './GuardianRegistration.css';

function GuardianRegistration() {
  const [formData, setFormData] = useState({
    barcode: '',
    firstName: '',
    lastName: '',
    contactNumber: '',
    email: '',
    relationship: '',
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [croppingMode, setCroppingMode] = useState(false);
  const [croppedPhoto, setCroppedPhoto] = useState(null);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1.5);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generateBarcode, setGenerateBarcode] = useState(false);

  React.useEffect(() => {
    const cropPreview = document.querySelector('.crop-preview');
    if (cropPreview && croppingMode) {
      const handleWheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom(prev => Math.max(1, Math.min(3, prev + delta)));
      };
      
      cropPreview.addEventListener('wheel', handleWheel, { passive: false });
      return () => cropPreview.removeEventListener('wheel', handleWheel);
    }
  }, [croppingMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setCroppingMode(true);
        setCroppedPhoto(null);
        setCropPosition({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageLoad = (e) => {
    const img = e.target;
    setImageDimensions({ width: img.width, height: img.height });
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragOffset({ x: cropPosition.x, y: cropPosition.y });
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !croppingMode || !imageDimensions.width) return;
    
    e.preventDefault();
    
    const container = e.currentTarget;
    if (!container) return;
    
    const containerWidth = 400;
    const containerHeight = 400;
    
    // Get actual displayed image dimensions
    const img = container.querySelector('img');
    if (!img) return;
    
    const displayedWidth = img.getBoundingClientRect().width;
    const displayedHeight = img.getBoundingClientRect().height;
    
    // Calculate how much the mouse has moved from the initial drag position
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    // Apply the delta to the initial offset
    let offsetX = dragOffset.x + deltaX;
    let offsetY = dragOffset.y + deltaY;
    
    // Calculate maximum offsets to allow full image exploration
    // The crop box center is fixed at (200, 200)
    // To show the top of image: offset = 200 (so 200 - offset = 0)
    // To show the bottom of image: offset = 200 - displayedHeight
    // To show the left of image: offset = 200
    // To show the right of image: offset = 200 - displayedWidth
    const minOffsetX = 200 - displayedWidth;
    const maxOffsetX = 200;
    const minOffsetY = 200 - displayedHeight;
    const maxOffsetY = 200;
    
    // Apply constraints - allow full range of motion
    offsetX = Math.max(minOffsetX, Math.min(maxOffsetX, offsetX));
    offsetY = Math.max(minOffsetY, Math.min(maxOffsetY, offsetY));
    
    setCropPosition({ x: offsetX, y: offsetY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCropPhoto = () => {
    const img = new Image();
    img.onload = () => {
      const originalWidth = img.width;
      const originalHeight = img.height;
      const cropSize = 200; // Fixed crop size in final image
      const containerSize = 400; // Container is 400x400
      
      // Get the displayed image element to measure actual displayed dimensions
      const displayedImg = document.querySelector('.crop-preview img');
      if (!displayedImg) return;
      
      // Get the actual displayed dimensions (after object-fit: contain)
      const displayedWidth = displayedImg.getBoundingClientRect().width;
      const displayedHeight = displayedImg.getBoundingClientRect().height;
      
      // Scale from original image to displayed size at zoom=1
      // We need to account for the current zoom level
      const displayedWidthAtZoom1 = displayedWidth / zoom;
      const displayedHeightAtZoom1 = displayedHeight / zoom;
      
      // Now calculate how original image maps to displayed size
      const baseScaleX = originalWidth / displayedWidthAtZoom1;
      const baseScaleY = originalHeight / displayedHeightAtZoom1;
      
      // The crop box center is always at (200, 200) in container space
      const cropBoxCenterX = 200;
      const cropBoxCenterY = 200;
      
      // Map crop box center to original image coordinates
      // Account for translation, then zoom
      const centerXInOriginal = (cropBoxCenterX - cropPosition.x) / zoom * baseScaleX;
      const centerYInOriginal = (cropBoxCenterY - cropPosition.y) / zoom * baseScaleY;
      
      // Source crop size - reduced by half of previous change
      const sourceCropSize = cropSize * baseScaleX / Math.sqrt(zoom / 1.5);
      
      // Crop region in original image coordinates
      const cropX = Math.round(Math.max(0, centerXInOriginal - sourceCropSize / 2));
      const cropY = Math.round(Math.max(0, centerYInOriginal - sourceCropSize / 2));
      
      canvas.width = cropSize;
      canvas.height = cropSize;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, cropX, cropY, sourceCropSize, sourceCropSize, 0, 0, cropSize, cropSize);
      
      const croppedData = canvas.toDataURL('image/jpeg');
      setCroppedPhoto(croppedData);
      setCroppingMode(false);
    };
    
    const canvas = document.createElement('canvas');
    img.src = photoPreview;
  };

  const handleGenerateBarcode = () => {
    const barcode = `GUA-${uuidv4().substring(0, 8).toUpperCase()}`;
    setFormData((prev) => ({
      ...prev,
      barcode,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let barcodeValue = formData.barcode;
    
    // Auto-generate barcode if checkbox is checked and barcode is empty
    if (generateBarcode && !barcodeValue) {
      barcodeValue = `GUA-${uuidv4().substring(0, 8).toUpperCase()}`;
      setFormData((prev) => ({
        ...prev,
        barcode: barcodeValue,
      }));
    }
    
    if (!barcodeValue || !formData.firstName || !formData.lastName || !formData.contactNumber || !formData.relationship || !photo) {
      setError('Please fill in all required fields including photo');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await window.electron.registerGuardian({
        barcode: barcodeValue,
        firstName: formData.firstName,
        lastName: formData.lastName,
        contactNumber: formData.contactNumber,
        email: formData.email,
        relationship: formData.relationship,
        photo: croppedPhoto || photoPreview,
      });

      if (result.success) {
        setSuccess('Guardian registered successfully!');
        setFormData({
          barcode: '',
          firstName: '',
          lastName: '',
          contactNumber: '',
          email: '',
          relationship: '',
        });
        setPhoto(null);
        setPhotoPreview(null);
        setCroppedPhoto(null);
        setCroppingMode(false);
        setGenerateBarcode(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError('Error registering guardian: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-header">
        <h1>Register Guardian</h1>
        <p>Add a new guardian to the system</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="registration-form-wrapper">
        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-section">
            <h2>Photo Upload</h2>
            
            <div className="form-group">
              <label htmlFor="photo">Photo (2x2 Square) *</label>
              <input
                type="file"
                id="photo"
                accept="image/*"
                onChange={handlePhotoChange}
              />
            </div>

            {croppingMode && photoPreview && (
              <div className="cropping-container">
                <p className="cropping-info">Drag photo to position it under the crop box</p>
                <div 
                  className="crop-preview"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <img 
                    src={photoPreview} 
                    alt="Crop preview"
                    onLoad={handleImageLoad}
                    style={{
                      transform: `translate(${cropPosition.x}px, ${cropPosition.y}px) scale(${zoom})`,
                      cursor: isDragging ? 'grabbing' : 'grab',
                      transformOrigin: 'top left'
                    }}
                  />
                  <div className="crop-box-fixed" />
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCropPhoto}
                >
                  ✓ Crop to Square
                </button>
              </div>
            )}

            {croppedPhoto && (
              <div className="photo-preview">
                <p className="preview-label">Cropped Photo:</p>
                <img src={croppedPhoto} alt="Guardian preview" />
                <button
                  type="button"
                  className="btn btn-tertiary btn-small"
                  onClick={() => {
                    setPhotoPreview(null);
                    setCroppedPhoto(null);
                    setPhoto(null);
                  }}
                >
                  Change Photo
                </button>
              </div>
            )}
          </div>

          <div className="form-section">
            <h2>Guardian Information</h2>

            <div className="form-group">
              <label htmlFor="barcode">Guardian Barcode *</label>
              {!generateBarcode && (
                <div className="barcode-input-group">
                  <input
                    type="text"
                    id="barcode"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleInputChange}
                    placeholder="Enter or generate barcode"
                    readOnly={generateBarcode}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleGenerateBarcode}
                  >
                    Generate
                  </button>
                </div>
              )}
              <div style={{ marginTop: '10px' }}>
                <label htmlFor="auto-generate" style={{ display: 'flex', alignItems: 'center', fontSize: '14px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    id="auto-generate"
                    checked={generateBarcode}
                    style={{ width: 'auto', marginRight: '10px' }}
                    onChange={(e) => setGenerateBarcode(e.target.checked)}
                  />
                  Auto-generate barcode
                </label>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="John"
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="contactNumber">Contact Number *</label>
              <input
                type="tel"
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="guardian@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="relationship">Relationship *</label>
              <select
                id="relationship"
                name="relationship"
                value={formData.relationship}
                onChange={handleInputChange}
              >
                <option value="">Select relationship</option>
                <option value="parent">Parent</option>
                <option value="mother">Mother</option>
                <option value="father">Father</option>
                <option value="guardian">Legal Guardian</option>
                <option value="aunt">Aunt</option>
                <option value="uncle">Uncle</option>
                <option value="grandparent">Grandparent</option>
                <option value="sibling">Sibling</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary btn-large"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register Guardian'}
            </button>
          </div>
        </form>

        <div className="info-panel">
          <h3>Registration Tips</h3>
          <ul>
            <li>Barcode can be auto-generated or manually entered</li>
            <li>Contact number is required for communication</li>
            <li>Email is optional but recommended</li>
            <li>Select the appropriate relationship type</li>
            <li>All fields marked with * are mandatory</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default GuardianRegistration;
