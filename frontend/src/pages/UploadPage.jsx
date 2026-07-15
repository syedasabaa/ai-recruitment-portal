import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { uploadResume } from '../api/resumes'

function UploadPage() {
  const { token } = useAuth()
  const navigate = useNavigate()

  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const fileInputRef = useRef(null)

  function handleFile(file) {
    if (!file) return
    setSelectedFile(file)
    setError('')
    setResult(null)
    setProgress(0)

    if (file.type === 'application/pdf') {
      setPreviewUrl(URL.createObjectURL(file))
    } else {
      setPreviewUrl(null)
    }
  }

  function handleInputChange(event) {
    handleFile(event.target.files[0])
  }

  function handleDrop(event) {
    event.preventDefault()
    setIsDragging(false)
    handleFile(event.dataTransfer.files[0])
  }

  async function handleUpload() {
    if (!selectedFile) return
    setUploading(true)
    setError('')
    setProgress(0)

    try {
      const data = await uploadResume(token, selectedFile, setProgress)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const fileSizeMB = selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(2) : null

  return (
    <div className="space-y-lg pb-xl">
      <div>
        <h1 className="font-headline text-headline-lg text-on-surface">Upload Talent Data</h1>
        <p className="font-body text-body-md text-on-surface-variant">
          Upload a PDF or DOCX resume for AI-powered parsing and analysis.
        </p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
        className={`border-2 border-dashed rounded-2xl p-xl flex flex-col items-center justify-center gap-sm cursor-pointer transition-colors ${
          isDragging ? 'border-secondary bg-[#f5f3ff]' : 'border-outline-variant/40 bg-surface-container-lowest'
        }`}
      >
        <span className="material-symbols-outlined text-secondary text-5xl">cloud_upload</span>
        <p className="font-headline text-body-lg font-semibold text-on-surface">Drag & Drop Resume</p>
        <p className="font-body text-body-sm text-on-surface-variant">PDF or DOCX, click to browse</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {selectedFile && (
        <div className="bg-surface-container-lowest rounded-xl p-md shadow-card border border-outline-variant/10">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-secondary">description</span>
            <div className="flex-grow min-w-0">
              <p className="font-body text-body-sm text-on-surface font-semibold truncate">{selectedFile.name}</p>
              <p className="font-mono text-label-sm text-on-surface-variant">{fileSizeMB} MB</p>
            </div>
            {uploading && (
              <span className="font-mono text-label-md text-secondary shrink-0">{progress}%</span>
            )}
          </div>

          {uploading && (
            <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden mt-sm">
              <div
                className="h-full bg-secondary rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {previewUrl && (
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-card border border-outline-variant/10">
          <p className="font-mono text-label-sm text-on-surface-variant uppercase px-md py-sm border-b border-outline-variant/10">
            Document Preview
          </p>
          <iframe src={previewUrl} title="Resume preview" className="w-full h-[400px]" />
        </div>
      )}

      {selectedFile && !previewUrl && !result && (
        <div className="bg-surface-container-lowest rounded-xl p-md shadow-card border border-outline-variant/10 text-center">
          <span className="material-symbols-outlined text-outline text-4xl">draft</span>
          <p className="font-body text-body-sm text-on-surface-variant mt-xs">
            Preview not available for DOCX files — upload to see extracted content.
          </p>
        </div>
      )}

      {selectedFile && !result && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full h-14 bg-secondary text-on-secondary rounded-lg font-headline text-headline-md flex items-center justify-center gap-xs disabled:opacity-60"
        >
          {uploading ? `Uploading... ${progress}%` : 'Upload & Analyze'}
        </button>
      )}

      {error && (
        <p className="font-body text-body-sm text-error bg-error-container/40 px-md py-xs rounded-lg">{error}</p>
      )}

      {result && (
        <div className="bg-surface-container-lowest rounded-2xl p-lg shadow-card border border-outline-variant/10 space-y-md">
          <div className="flex items-center gap-xs text-secondary">
            <span className="material-symbols-outlined">check_circle</span>
            <p className="font-headline text-body-lg font-semibold">Resume Processed Successfully</p>
          </div>

          <div className="space-y-sm">
            <div>
              <p className="font-mono text-label-sm text-on-surface-variant uppercase">Name</p>
              <p className="font-body text-body-md text-on-surface">{result.extracted_data.name || 'Not found'}</p>
            </div>
            <div>
              <p className="font-mono text-label-sm text-on-surface-variant uppercase">Email</p>
              <p className="font-body text-body-md text-on-surface">{result.extracted_data.email || 'Not found'}</p>
            </div>
            <div>
              <p className="font-mono text-label-sm text-on-surface-variant uppercase">Skills Found</p>
              <p className="font-body text-body-md text-on-surface">
                {result.extracted_data.skills.length > 0 ? result.extracted_data.skills.join(', ') : 'None'}
              </p>
            </div>
            <div>
              <p className="font-mono text-label-sm text-on-surface-variant uppercase">Experience</p>
              <p className="font-body text-body-md text-on-surface">{result.extracted_data.experience_years} years</p>
            </div>
          </div>

          <button
            onClick={() => navigate(`/candidates/${result.candidate_id}`)}
            className="w-full h-12 bg-secondary text-on-secondary rounded-lg font-headline text-body-lg"
          >
            View Candidate Profile
          </button>
        </div>
      )}
    </div>
  )
}

export default UploadPage