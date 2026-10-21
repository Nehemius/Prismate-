import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
}

interface TasksQuotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  todos: TodoItem[];
  onUpdateTodos: (todos: TodoItem[]) => void;
  quote: string;
  onUpdateQuote: (quote: string) => void;
}

const STEM_QUOTES = [
  'Supercritical CO₂ acts as both gas and liquid simultaneously — currently replacing toxic organic solvents in modern green chemistry decaffeination.',
  'Electric field lines never intersect because if they did, the field at the point of intersection would point in two different directions simultaneously.',
  'A system of linear equations AX = B has a unique solution if and only if |A| ≠ 0 (i.e. matrix A is non-singular with rank equal to number of unknowns).',
  'In the Hall-Héroult process, cryolite (Na₃AlF₆) lowers the melting point of alumina from 2323 K to 1223 K and increases electrical conductivity.',
  'The electric flux through any closed Gaussian surface enclosing charge Q depends purely on the net charge divided by ε₀, regardless of shape or size.',
  'By Cramer’s Rule, if Δ = 0 and at least one of Δx, Δy, Δz is non-zero, the system of equations is strictly inconsistent and has no solution.',
];

export const TasksQuotesModal: React.FC<TasksQuotesModalProps> = ({
  isOpen,
  onClose,
  todos,
  onUpdateTodos,
  quote,
  onUpdateQuote,
}) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'quote'>('tasks');
  const [newTodoText, setNewTodoText] = useState('');
  const [editingQuote, setEditingQuote] = useState(quote);

  if (!isOpen) return null;

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    const newItem: TodoItem = {
      id: 't-' + Date.now(),
      text: newTodoText.trim(),
      done: false,
    };
    onUpdateTodos([...todos, newItem]);
    setNewTodoText('');
  };

  const handleToggleTodo = (id: string) => {
    onUpdateTodos(
      todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const handleDeleteTodo = (id: string) => {
    onUpdateTodos(todos.filter((t) => t.id !== id));
  };

  const handleClearDone = () => {
    onUpdateTodos(todos.filter((t) => !t.done));
  };

  const handleRandomQuote = () => {
    const random = STEM_QUOTES[Math.floor(Math.random() * STEM_QUOTES.length)];
    setEditingQuote(random);
    onUpdateQuote(random);
  };

  const handleSaveQuote = () => {
    if (editingQuote.trim()) {
      onUpdateQuote(editingQuote.trim());
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9600,
          background: 'rgba(0, 0, 0, 0.82)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: 'min(500px, 94vw)',
            background: 'linear-gradient(135deg, rgba(24, 24, 24, 0.98), rgba(12, 12, 12, 0.95))',
            border: '1.5px solid rgba(242, 242, 242, 0.25)',
            borderRadius: '20px',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(242, 242, 242, 0.2)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 24px',
              borderBottom: '1px solid rgba(242, 242, 242, 0.12)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '18px' }}>📝</span>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '13px',
                  letterSpacing: '2px',
                  color: '#F2F2F2',
                }}
              >
                TASKS & STEM QUOTES
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(242, 242, 242, 0.6)',
                fontSize: '16px',
                cursor: 'pointer',
                padding: '4px 8px',
              }}
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              borderBottom: '1px solid rgba(242, 242, 242, 0.1)',
              background: 'rgba(0, 0, 0, 0.4)',
            }}
          >
            <button
              onClick={() => setActiveTab('tasks')}
              style={{
                background: activeTab === 'tasks' ? 'rgba(242, 242, 242, 0.12)' : 'transparent',
                color: activeTab === 'tasks' ? '#F2F2F2' : 'rgba(242, 242, 242, 0.45)',
                border: 'none',
                borderBottom: activeTab === 'tasks' ? '2px solid #F2F2F2' : '2px solid transparent',
                padding: '12px 6px',
                fontFamily: 'var(--font-heading)',
                fontSize: '11px',
                letterSpacing: '1px',
                cursor: 'pointer',
              }}
            >
              DAILY TASKS ({todos.filter((t) => !t.done).length} REMAINING)
            </button>
            <button
              onClick={() => setActiveTab('quote')}
              style={{
                background: activeTab === 'quote' ? 'rgba(242, 242, 242, 0.12)' : 'transparent',
                color: activeTab === 'quote' ? '#F2F2F2' : 'rgba(242, 242, 242, 0.45)',
                border: 'none',
                borderBottom: activeTab === 'quote' ? '2px solid #F2F2F2' : '2px solid transparent',
                padding: '12px 6px',
                fontFamily: 'var(--font-heading)',
                fontSize: '11px',
                letterSpacing: '1px',
                cursor: 'pointer',
              }}
            >
              STEM INSIGHT / QUOTE
            </button>
          </div>

          <div style={{ padding: '24px', minHeight: '260px' }}>
            {/* TAB 1: TASKS */}
            {activeTab === 'tasks' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Add Input */}
                <form onSubmit={handleAddTodo} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={newTodoText}
                    onChange={(e) => setNewTodoText(e.target.value)}
                    placeholder="Enter study task or revision goal..."
                    style={{
                      flex: 1,
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(242, 242, 242, 0.25)',
                      borderRadius: '8px',
                      color: '#F2F2F2',
                      padding: '10px 14px',
                      fontFamily: 'var(--font-content)',
                      fontSize: '13px',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      background: '#F2F2F2',
                      color: '#000000',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 18px',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '11px',
                      letterSpacing: '1px',
                      cursor: 'pointer',
                    }}
                  >
                    ADD
                  </button>
                </form>

                {/* Task List */}
                <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {todos.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(242, 242, 242, 0.35)', fontSize: '12px' }}>
                      No tasks yet. Add your study goals above.
                    </div>
                  ) : (
                    todos.map((todo) => (
                      <div
                        key={todo.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          background: 'rgba(0, 0, 0, 0.35)',
                          border: '1px solid rgba(242, 242, 242, 0.1)',
                          borderRadius: '8px',
                        }}
                      >
                        <div
                          onClick={() => handleToggleTodo(todo.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            cursor: 'pointer',
                            flex: 1,
                          }}
                        >
                          <span
                            style={{
                              fontSize: '15px',
                              color: todo.done ? '#F2F2F2' : 'rgba(242, 242, 242, 0.35)',
                            }}
                          >
                            {todo.done ? '☑' : '☐'}
                          </span>
                          <span
                            style={{
                              fontFamily: 'var(--font-content)',
                              fontSize: '13px',
                              color: todo.done ? 'rgba(242, 242, 242, 0.35)' : '#F2F2F2',
                              textDecoration: todo.done ? 'line-through' : 'none',
                            }}
                          >
                            {todo.text}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteTodo(todo.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'rgba(242, 242, 242, 0.4)',
                            fontSize: '13px',
                            cursor: 'pointer',
                            padding: '2px 6px',
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {todos.some((t) => t.done) && (
                  <button
                    onClick={handleClearDone}
                    style={{
                      alignSelf: 'flex-start',
                      background: 'transparent',
                      border: 'none',
                      color: 'rgba(242, 242, 242, 0.45)',
                      fontFamily: 'var(--font-subheading)',
                      fontSize: '11px',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      marginTop: '4px',
                    }}
                  >
                    Clear completed tasks
                  </button>
                )}
              </div>
            )}

            {/* TAB 2: QUOTE / INSIGHT */}
            {activeTab === 'quote' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label
                    style={{
                      fontFamily: 'var(--font-subheading)',
                      fontSize: '11px',
                      letterSpacing: '1.5px',
                      color: 'rgba(242, 242, 242, 0.5)',
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    CURRENT MOTIVATIONAL INSIGHT
                  </label>
                  <textarea
                    rows={4}
                    value={editingQuote}
                    onChange={(e) => setEditingQuote(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(242, 242, 242, 0.25)',
                      borderRadius: '8px',
                      color: '#F2F2F2',
                      padding: '12px',
                      fontFamily: 'var(--font-content)',
                      fontSize: '13px',
                      lineHeight: 1.5,
                      resize: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleRandomQuote}
                    style={{
                      flex: 1,
                      background: 'rgba(242, 242, 242, 0.08)',
                      border: '1px solid rgba(242, 242, 242, 0.2)',
                      color: '#F2F2F2',
                      borderRadius: '8px',
                      padding: '10px',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '11px',
                      letterSpacing: '1px',
                      cursor: 'pointer',
                    }}
                  >
                    🎲 RANDOM STEM INSIGHT
                  </button>
                  <button
                    onClick={handleSaveQuote}
                    style={{
                      flex: 1,
                      background: '#F2F2F2',
                      color: '#000000',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '11px',
                      letterSpacing: '1px',
                      cursor: 'pointer',
                    }}
                  >
                    SAVE QUOTE
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TasksQuotesModal;
