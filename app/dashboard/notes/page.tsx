'use client';

import { useState, useEffect } from 'react';
import DashboardHeader from '@/components/DashboardHeader';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('sermon-prep');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes');
      const data = await response.json();
      setNotes(data.notes || []);
    } catch (err) {
      console.error('Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, category }),
      });

      if (!response.ok) throw new Error('Failed to save note');

      setTitle('');
      setContent('');
      setIsEditing(false);
      fetchNotes();
    } catch (err) {
      alert('Failed to save note');
    }
  };

  const handleNewNote = () => {
    setSelectedNote(null);
    setTitle('');
    setContent('');
    setCategory('sermon-prep');
    setIsEditing(true);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/notes?id=${noteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete note');

      setSelectedNote(null);
      fetchNotes();
      alert('Note deleted successfully');
    } catch (err) {
      alert('Failed to delete note');
    }
  };

  const handlePrintNote = () => {
    if (!selectedNote) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${selectedNote.title}</title>
          <style>
            body {
              font-family: Georgia, serif;
              max-width: 8.5in;
              margin: 1in auto;
              padding: 0;
              line-height: 1.6;
            }
            h1 {
              color: #5B2C6F;
              font-size: 24px;
              margin-bottom: 10px;
            }
            .meta {
              color: #666;
              font-size: 12px;
              margin-bottom: 20px;
              border-bottom: 1px solid #ddd;
              padding-bottom: 10px;
            }
            .content {
              white-space: pre-wrap;
              font-size: 14px;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <h1>${selectedNote.title}</h1>
          <div class="meta">
            <strong>Category:</strong> ${selectedNote.tags?.[0] || 'note'}<br>
            <strong>Created:</strong> ${new Date(selectedNote.created_at).toLocaleString()}<br>
            <strong>Updated:</strong> ${new Date(selectedNote.updated_at).toLocaleString()}
          </div>
          <div class="content">${selectedNote.content}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  };

  const handleExportPDF = async () => {
    if (!selectedNote) return;
    alert('PDF export functionality will be implemented. For now, please use the Print option and select "Save as PDF" from your browser.');
  };

  const handleExportWord = () => {
    if (!selectedNote) return;

    // Create a simple HTML document that Word can open
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${selectedNote.title}</title>
          <style>
            body {
              font-family: Georgia, serif;
              margin: 1in;
              line-height: 1.6;
            }
            h1 {
              color: #5B2C6F;
              font-size: 24pt;
              margin-bottom: 10pt;
            }
            .meta {
              color: #666;
              font-size: 10pt;
              margin-bottom: 20pt;
              border-bottom: 1px solid #ddd;
              padding-bottom: 10pt;
            }
            .content {
              white-space: pre-wrap;
              font-size: 12pt;
            }
          </style>
        </head>
        <body>
          <h1>${selectedNote.title}</h1>
          <div class="meta">
            <strong>Category:</strong> ${selectedNote.tags?.[0] || 'note'}<br>
            <strong>Created:</strong> ${new Date(selectedNote.created_at).toLocaleString()}<br>
            <strong>Updated:</strong> ${new Date(selectedNote.updated_at).toLocaleString()}
          </div>
          <div class="content">${selectedNote.content.replace(/\n/g, '<br>')}</div>
        </body>
      </html>
    `;

    // Create a blob and download as .doc file
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedNote.title.replace(/[^a-z0-9]/gi, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--background-cream)' }}>
      {/* Shared Header with gold color scheme */}
      <DashboardHeader
        showBackLink
        pageTitle="My Notes"
        pageIcon="📝"
        colorScheme="gold"
        rightContent={
          <button
            onClick={handleNewNote}
            className="text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)';
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
            }}
          >
            + New Note
          </button>
        }
      />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Notes List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                All Notes ({notes.length})
              </h2>
              {loading && <p className="text-gray-500 text-sm">Loading...</p>}
              {!loading && notes.length === 0 && (
                <p className="text-gray-500 text-sm">No notes yet</p>
              )}
              <div className="space-y-2">
                {notes.map(note => (
                  <button
                    key={note.id}
                    onClick={() => {
                      setSelectedNote(note);
                      setTitle(note.title);
                      setContent(note.content);
                      setCategory(note.tags?.[0] || 'sermon-prep');
                      setIsEditing(false);
                    }}
                    className={`w-full text-left p-4 rounded-lg transition ${
                      selectedNote?.id === note.id
                        ? 'bg-yellow-50 border-2 border-yellow-500'
                        : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">
                      {note.title}
                    </h3>
                    <p className="text-xs text-yellow-600 mb-1">{note.tags?.[0] || 'note'}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(note.created_at).toLocaleDateString()}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Note Editor/Viewer */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Note title"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                    >
                      <option value="sermon-prep">Sermon Prep</option>
                      <option value="study">Bible Study</option>
                      <option value="ideas">Ideas</option>
                      <option value="personal">Personal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Your notes..."
                      rows={15}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveNote}
                      className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-yellow-700 transition"
                    >
                      Save Note
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : selectedNote ? (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">{selectedNote.title}</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteNote(selectedNote.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-yellow-600 mb-4">{selectedNote.tags?.[0] || 'note'}</p>

                  {/* Export/Print Actions */}
                  <div className="mb-6 flex gap-3 flex-wrap">
                    <button
                      onClick={handlePrintNote}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition flex items-center gap-2"
                    >
                      🖨️ Print
                    </button>
                    <button
                      onClick={handleExportPDF}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition flex items-center gap-2"
                    >
                      📄 Export as PDF
                    </button>
                    <button
                      onClick={handleExportWord}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition flex items-center gap-2"
                    >
                      📝 Export as Word Doc
                    </button>
                  </div>

                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedNote.content}</p>
                  </div>
                  <div className="mt-8 pt-6 border-t text-sm text-gray-500">
                    <p>Created: {new Date(selectedNote.created_at).toLocaleString()}</p>
                    <p>Updated: {new Date(selectedNote.updated_at).toLocaleString()}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>Select a note or create a new one</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
