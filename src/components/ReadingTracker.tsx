import React, { useState, useEffect } from 'react';
import './ReadingTracker.css';

interface Book {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  currentPage: number;
  startDate: string;
  targetDate?: string;
  completed: boolean;
}

interface ReadingTrackerProps {
  habitId?: string;
}

const ReadingTracker: React.FC<ReadingTrackerProps> = ({ habitId = 'reading' }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    totalPages: '',
    currentPage: '0',
    targetDate: ''
  });

  // Load books from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`reading_tracker_${habitId}`);
    if (stored) {
      try {
        setBooks(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load books:', e);
      }
    }
  }, [habitId]);

  // Save books to localStorage
  useEffect(() => {
    if (books.length > 0) {
      localStorage.setItem(`reading_tracker_${habitId}`, JSON.stringify(books));
    }
  }, [books, habitId]);

  const addBook = () => {
    if (!newBook.title.trim() || !newBook.totalPages) return;

    const book: Book = {
      id: Date.now().toString(),
      title: newBook.title.trim(),
      author: newBook.author.trim() || 'Unknown Author',
      totalPages: parseInt(newBook.totalPages),
      currentPage: parseInt(newBook.currentPage) || 0,
      startDate: new Date().toISOString().split('T')[0],
      targetDate: newBook.targetDate || undefined,
      completed: false
    };

    setBooks([book, ...books]);
    setNewBook({ title: '', author: '', totalPages: '', currentPage: '0', targetDate: '' });
    setShowAddForm(false);
  };

  const updateProgress = (bookId: string, pages: number) => {
    setBooks(books.map(book => {
      if (book.id === bookId) {
        const newPage = Math.max(0, Math.min(pages, book.totalPages));
        return {
          ...book,
          currentPage: newPage,
          completed: newPage >= book.totalPages
        };
      }
      return book;
    }));
  };

  const deleteBook = (bookId: string) => {
    setBooks(books.filter(b => b.id !== bookId));
  };

  const calculateEstimatedFinish = (book: Book): string => {
    if (book.completed) return 'Completed';
    if (book.currentPage === 0) return 'Not started';

    const pagesLeft = book.totalPages - book.currentPage;
    const daysSinceStart = Math.max(1, Math.floor(
      (Date.now() - new Date(book.startDate).getTime()) / (1000 * 60 * 60 * 24)
    ));
    const pagesPerDay = book.currentPage / daysSinceStart;

    if (pagesPerDay < 1) return 'Reading pace too slow';

    const daysToFinish = Math.ceil(pagesLeft / pagesPerDay);
    const finishDate = new Date(Date.now() + daysToFinish * 24 * 60 * 60 * 1000);

    return finishDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getProgressPercentage = (book: Book): number => {
    return Math.round((book.currentPage / book.totalPages) * 100);
  };

  const currentBook = books.find(b => !b.completed);
  const completedBooks = books.filter(b => b.completed);
  const totalPagesRead = books.reduce((sum, b) => sum + b.currentPage, 0);

  return (
    <div className="reading-tracker">
      <div className="calculator-header">
        <h3>Reading Tracker</h3>
        <p className="calculator-subtitle">Track your reading progress and finish dates</p>
      </div>

      <div className="reading-stats">
        <div className="stat-card">
          <div className="stat-value">{books.filter(b => !b.completed).length}</div>
          <div className="stat-label">Active Books</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{completedBooks.length}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalPagesRead.toLocaleString()}</div>
          <div className="stat-label">Pages Read</div>
        </div>
      </div>

      {!showAddForm && (
        <button
          className="add-book-button"
          onClick={() => setShowAddForm(true)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Book
        </button>
      )}

      {showAddForm && (
        <div className="add-book-form">
          <input
            type="text"
            placeholder="Book Title *"
            value={newBook.title}
            onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
            className="book-input"
          />
          <input
            type="text"
            placeholder="Author"
            value={newBook.author}
            onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
            className="book-input"
          />
          <div className="book-input-row">
            <input
              type="number"
              placeholder="Total Pages *"
              value={newBook.totalPages}
              onChange={(e) => setNewBook({ ...newBook, totalPages: e.target.value })}
              className="book-input"
              min="1"
            />
            <input
              type="number"
              placeholder="Current Page"
              value={newBook.currentPage}
              onChange={(e) => setNewBook({ ...newBook, currentPage: e.target.value })}
              className="book-input"
              min="0"
            />
          </div>
          <input
            type="date"
            placeholder="Target Finish Date (optional)"
            value={newBook.targetDate}
            onChange={(e) => setNewBook({ ...newBook, targetDate: e.target.value })}
            className="book-input"
          />
          <div className="form-actions">
            <button onClick={addBook} className="form-btn save-btn">
              Save Book
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewBook({ title: '', author: '', totalPages: '', currentPage: '0', targetDate: '' });
              }}
              className="form-btn cancel-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {currentBook && (
        <div className="current-book-section">
          <h4>Currently Reading</h4>
          <div className="book-card current-book">
            <div className="book-header">
              <div className="book-info">
                <div className="book-title">{currentBook.title}</div>
                <div className="book-author">by {currentBook.author}</div>
              </div>
              <button
                className="delete-book-btn"
                onClick={() => deleteBook(currentBook.id)}
              >
                ×
              </button>
            </div>

            <div className="book-progress">
              <div className="progress-info">
                <span>Page {currentBook.currentPage} of {currentBook.totalPages}</span>
                <span>{getProgressPercentage(currentBook)}%</span>
              </div>
              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${getProgressPercentage(currentBook)}%` }}
                />
              </div>
            </div>

            <div className="page-updater">
              <label>Update Progress:</label>
              <div className="page-controls">
                <button
                  className="page-btn"
                  onClick={() => updateProgress(currentBook.id, currentBook.currentPage - 10)}
                >
                  -10
                </button>
                <button
                  className="page-btn"
                  onClick={() => updateProgress(currentBook.id, currentBook.currentPage - 1)}
                >
                  -1
                </button>
                <input
                  type="number"
                  value={currentBook.currentPage}
                  onChange={(e) => updateProgress(currentBook.id, parseInt(e.target.value) || 0)}
                  className="page-input"
                  min="0"
                  max={currentBook.totalPages}
                />
                <button
                  className="page-btn"
                  onClick={() => updateProgress(currentBook.id, currentBook.currentPage + 1)}
                >
                  +1
                </button>
                <button
                  className="page-btn"
                  onClick={() => updateProgress(currentBook.id, currentBook.currentPage + 10)}
                >
                  +10
                </button>
              </div>
            </div>

            <div className="book-stats">
              <div className="book-stat">
                <span className="stat-label-small">Started:</span>
                <span className="stat-value-small">
                  {new Date(currentBook.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div className="book-stat">
                <span className="stat-label-small">Est. Finish:</span>
                <span className="stat-value-small">{calculateEstimatedFinish(currentBook)}</span>
              </div>
              {currentBook.targetDate && (
                <div className="book-stat">
                  <span className="stat-label-small">Target:</span>
                  <span className="stat-value-small">
                    {new Date(currentBook.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {books.filter(b => !b.completed && b.id !== currentBook?.id).length > 0 && (
        <div className="other-books-section">
          <h4>Reading List ({books.filter(b => !b.completed && b.id !== currentBook?.id).length})</h4>
          <div className="books-list">
            {books.filter(b => !b.completed && b.id !== currentBook?.id).map(book => (
              <div key={book.id} className="book-card mini-book">
                <div className="book-header">
                  <div className="book-info">
                    <div className="book-title-mini">{book.title}</div>
                    <div className="book-author-mini">{book.author}</div>
                  </div>
                  <button
                    className="delete-book-btn-mini"
                    onClick={() => deleteBook(book.id)}
                  >
                    ×
                  </button>
                </div>
                <div className="mini-progress">
                  {book.currentPage} / {book.totalPages} pages ({getProgressPercentage(book)}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {completedBooks.length > 0 && (
        <div className="completed-books-section">
          <h4>Completed Books ({completedBooks.length})</h4>
          <div className="completed-list">
            {completedBooks.map(book => (
              <div key={book.id} className="completed-book-item">
                <div className="completed-icon">✓</div>
                <div className="completed-info">
                  <div className="completed-title">{book.title}</div>
                  <div className="completed-author">{book.author} · {book.totalPages} pages</div>
                </div>
                <button
                  className="delete-completed-btn"
                  onClick={() => deleteBook(book.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {books.length === 0 && !showAddForm && (
        <div className="empty-state">
          <p>No books tracked yet. Click "Add Book" to start tracking your reading!</p>
        </div>
      )}
    </div>
  );
};

export default ReadingTracker;
