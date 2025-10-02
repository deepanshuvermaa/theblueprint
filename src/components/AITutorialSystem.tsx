import React, { useState } from 'react';
import './AITutorialSystem.css';

interface TutorialCard {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  articleUrl?: string;
  codeExample?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  tags: string[];
}

// Mock data - will be replaced with backend API
const MOCK_TUTORIALS: Record<string, TutorialCard[]> = {
  'react_beginner': [
    {
      id: '1',
      title: 'React Hooks Fundamentals',
      description: 'Master useState and useEffect with practical examples',
      videoUrl: 'https://youtube.com/watch?v=O6P86uwfdR0',
      codeExample: `import { useState, useEffect } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);

  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}`,
      difficulty: 'beginner',
      estimatedTime: '20 min',
      tags: ['hooks', 'state', 'effects']
    },
    {
      id: '2',
      title: 'Component Props & Composition',
      description: 'Learn to build reusable components with props',
      articleUrl: 'https://react.dev/learn/passing-props-to-a-component',
      codeExample: `function Button({ label, onClick, variant = 'primary' }) {
  return (
    <button
      className={\`btn btn-\${variant}\`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

// Usage
<Button label="Submit" onClick={handleSubmit} variant="success" />`,
      difficulty: 'beginner',
      estimatedTime: '15 min',
      tags: ['props', 'components', 'reusability']
    }
  ],
  'python_intermediate': [
    {
      id: '3',
      title: 'List Comprehensions & Generators',
      description: 'Write cleaner, more Pythonic code',
      codeExample: `# List comprehension
squares = [x**2 for x in range(10) if x % 2 == 0]
# Output: [0, 4, 16, 36, 64]

# Generator expression (memory efficient)
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

# Usage
for num in fibonacci(10):
    print(num)`,
      difficulty: 'intermediate',
      estimatedTime: '25 min',
      tags: ['comprehensions', 'generators', 'memory']
    }
  ]
};

const TOPICS = [
  'React', 'JavaScript', 'Python', 'Node.js', 'TypeScript',
  'Machine Learning', 'Web3', 'API Design', 'System Design', 'Database'
];

const LEVELS = ['beginner', 'intermediate', 'advanced'] as const;

const AITutorialSystem: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<typeof LEVELS[number] | ''>('');
  const [isSearching, setIsSearching] = useState(false);
  const [tutorials, setTutorials] = useState<TutorialCard[]>([]);

  const handleSearch = async () => {
    if (!selectedTopic || !selectedLevel) return;

    setIsSearching(true);

    // Simulate API call - replace with actual backend call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock response based on selection
    const mockKey = `${selectedTopic.toLowerCase()}_${selectedLevel}`;
    const mockResults = MOCK_TUTORIALS[mockKey] || MOCK_TUTORIALS['react_beginner'];

    setTutorials(mockResults);
    setIsSearching(false);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // Could add a toast notification here
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'beginner': return '#22c55e';
      case 'intermediate': return '#f59e0b';
      case 'advanced': return '#ef4444';
      default: return 'var(--text-accent)';
    }
  };

  return (
    <div className="ai-tutorial-system">
      <div className="calculator-header">
        <h3>AI Tutorial Curator</h3>
        <p className="calculator-subtitle">Find personalized learning resources powered by AI</p>
      </div>

      <div className="tutorial-search">
        <div className="search-inputs">
          <div className="input-group">
            <label className="input-label">Select Topic</label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="tutorial-select"
            >
              <option value="">Choose a topic...</option>
              {TOPICS.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Your Level</label>
            <div className="level-buttons">
              {LEVELS.map(level => (
                <button
                  key={level}
                  className={`level-btn ${selectedLevel === level ? 'active' : ''}`}
                  onClick={() => setSelectedLevel(level)}
                  style={{
                    borderColor: selectedLevel === level ? getDifficultyColor(level) : 'var(--border)',
                    backgroundColor: selectedLevel === level ? getDifficultyColor(level) : 'var(--bg-primary)',
                    color: selectedLevel === level ? 'white' : 'var(--text-accent)'
                  }}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSearch}
          disabled={!selectedTopic || !selectedLevel || isSearching}
          className="search-btn"
        >
          {isSearching ? (
            <>
              <div className="spinner" />
              Curating Resources...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              Find Tutorials
            </>
          )}
        </button>
      </div>

      {isSearching && (
        <div className="searching-state">
          <div className="search-animation">
            <div className="search-dot"></div>
            <div className="search-dot"></div>
            <div className="search-dot"></div>
          </div>
          <p>AI is searching and curating the best resources for you...</p>
        </div>
      )}

      {tutorials.length > 0 && !isSearching && (
        <div className="tutorial-results">
          <div className="results-header">
            <h4>Found {tutorials.length} Curated Resources</h4>
            <div className="results-topic">
              {selectedTopic} · {selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1)}
            </div>
          </div>

          <div className="tutorial-cards">
            {tutorials.map((tutorial) => (
              <div key={tutorial.id} className="tutorial-card">
                <div className="card-header">
                  <div className="card-title-section">
                    <h5 className="card-title">{tutorial.title}</h5>
                    <div className="card-meta">
                      <span
                        className="difficulty-badge"
                        style={{ backgroundColor: getDifficultyColor(tutorial.difficulty) }}
                      >
                        {tutorial.difficulty}
                      </span>
                      <span className="time-badge">⏱ {tutorial.estimatedTime}</span>
                    </div>
                  </div>
                </div>

                <p className="card-description">{tutorial.description}</p>

                <div className="card-tags">
                  {tutorial.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>

                {tutorial.codeExample && (
                  <div className="code-section">
                    <div className="code-header">
                      <span>Code Example</span>
                      <button
                        className="copy-btn"
                        onClick={() => copyCode(tutorial.codeExample!)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        Copy
                      </button>
                    </div>
                    <pre className="code-block">
                      <code>{tutorial.codeExample}</code>
                    </pre>
                  </div>
                )}

                <div className="card-actions">
                  {tutorial.videoUrl && (
                    <a
                      href={tutorial.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-btn video-btn"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      Watch Video
                    </a>
                  )}
                  {tutorial.articleUrl && (
                    <a
                      href={tutorial.articleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-btn article-btn"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      Read Article
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tutorials.length === 0 && !isSearching && (
        <div className="empty-tutorial-state">
          <div className="empty-icon">🤖</div>
          <h4>AI-Powered Learning</h4>
          <p>Select a topic and your skill level to get personalized tutorial recommendations</p>
          <div className="features-list">
            <div className="feature-item">✓ Curated by AI from top resources</div>
            <div className="feature-item">✓ Level-appropriate content</div>
            <div className="feature-item">✓ Code examples included</div>
            <div className="feature-item">✓ Estimated time to complete</div>
          </div>
        </div>
      )}

      <div className="backend-notice">
        <strong>Note:</strong> This is a frontend demo. Connect to a backend API (OpenAI, NotebookLM) for live AI curation.
      </div>
    </div>
  );
};

export default AITutorialSystem;
