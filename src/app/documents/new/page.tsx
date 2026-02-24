'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

type UploadMode = 'upload' | 'write';

export default function NewDocumentPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [mode, setMode] = useState<UploadMode>('upload');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = async (file: File) => {
    setError('');
    setSelectedFile(file);
    
    // Extract title from filename if not set
    if (!title) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setTitle(nameWithoutExt);
    }

    // Parse file content
    try {
      let fileContent = '';
      
      if (file.name.endsWith('.md') || file.name.endsWith('.txt')) {
        fileContent = await file.text();
      } else if (file.name.endsWith('.pdf')) {
        // PDF parsing would need server-side处理
        setError('PDF upload requires server-side processing. Please use TXT or MD files for now.');
        return;
      } else if (file.name.endsWith('.docx')) {
        // DOCX parsing would need server-side处理  
        setError('DOCX upload requires server-side processing. Please use TXT or MD files for now.');
        return;
      } else {
        setError('Unsupported file type. Please use TXT or MD files.');
        return;
      }
      
      setContent(fileContent);
    } catch (err) {
      setError('Failed to read file. Please try again.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, author: author || 'Anonymous' }),
      });

      if (!res.ok) throw new Error('Failed to create document');

      const doc = await res.json();
      router.push(`/documents/${doc.id}`);
    } catch {
      setError('Failed to create document. Please try again.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/documents" className={styles.backLink}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Documents
        </Link>
        <h1>New Document</h1>
      </div>

      <div className={styles.modeToggle}>
        <button
          type="button"
          className={`${styles.modeButton} ${mode === 'upload' ? styles.active : ''}`}
          onClick={() => setMode('upload')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Upload File
        </button>
        <button
          type="button"
          className={`${styles.modeButton} ${mode === 'write' ? styles.active : ''}`}
          onClick={() => setMode('write')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Write Manually
        </button>
      </div>

      {mode === 'upload' ? (
        <div 
          className={`${styles.uploadZone} ${isDragging ? styles.dragging : ''} ${selectedFile ? styles.hasFile : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.markdown"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className={styles.fileInput}
          />
          
          {selectedFile ? (
            <div className={styles.selectedFile}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span className={styles.fileName}>{selectedFile.name}</span>
              <span className={styles.fileSize}>
                {(selectedFile.size / 1024).toFixed(1)} KB
              </span>
              <button 
                type="button" 
                className={styles.clearFile}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  setContent('');
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ) : (
            <>
              <svg className={styles.uploadIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p className={styles.uploadText}>
                Drag and drop your file here, or click to browse
              </p>
              <p className={styles.uploadHint}>
                Supports TXT and Markdown files
              </p>
            </>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          
          <div className={styles.field}>
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter document title..."
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="author">Author</label>
            <input
              id="author"
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Your name..."
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your document content here..."
              className={styles.textarea}
              rows={15}
            />
          </div>

          <div className={styles.actions}>
            <Link href="/documents" className={styles.cancelButton}>
              Cancel
            </Link>
            <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
              {isSubmitting ? 'Creating...' : 'Create Document'}
            </button>
          </div>
        </form>
      )}

      {mode === 'upload' && selectedFile && (
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          
          <div className={styles.field}>
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document title..."
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="author">Author</label>
            <input
              id="author"
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Your name..."
              className={styles.input}
            />
          </div>

          <div className={styles.actions}>
            <Link href="/documents" className={styles.cancelButton}>
              Cancel
            </Link>
            <button type="submit" disabled={isSubmitting || !content} className={styles.submitButton}>
              {isSubmitting ? 'Creating...' : 'Create Document'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
