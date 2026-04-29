import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tasksAPI } from '../services/api';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import toast from 'react-hot-toast';
import { Plus, ClipboardList, CheckCircle2, Clock, Search, Filter } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchTasks = async () => {
    try {
      const { data } = await tasksAPI.getAll();
      setTasks(data);
    } catch {
      toast.error('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      const { data } = await tasksAPI.create(form);
      setTasks([data, ...tasks]);
      setModalOpen(false);
      toast.success('Task created! ✅');
    } catch {
      toast.error('Failed to create task.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (form) => {
    setSaving(true);
    try {
      const { data } = await tasksAPI.update(editTask.id, form);
      setTasks(tasks.map((t) => (t.id === editTask.id ? data : t)));
      setModalOpen(false);
      setEditTask(null);
      toast.success('Task updated!');
    } catch {
      toast.error('Failed to update task.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const { data } = await tasksAPI.update(task.id, { status: newStatus });
      setTasks(tasks.map((t) => (t.id === task.id ? data : t)));
      toast.success(newStatus === 'completed' ? 'Task completed! 🎉' : 'Marked as pending.');
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    try {
      await tasksAPI.delete(id);
      setTasks(tasks.filter((t) => t.id !== id));
      toast.success('Task deleted.');
    } catch {
      toast.error('Failed to delete task.');
    }
  };

  const openEdit = (task) => {
    setEditTask(task);
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditTask(null);
    setModalOpen(true);
  };

  // Stats
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const pending = total - completed;

  // Filtered tasks
  const filtered = tasks.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || t.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Navbar />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.5px' }}>
              My Tasks
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Welcome back, <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>{user?.name || user?.email?.split('@')[0]}</span> 👋
            </p>
          </div>
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={16} />
            Add Task
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Tasks', value: total, icon: ClipboardList, color: '#6c63ff' },
            { label: 'Completed', value: completed, icon: CheckCircle2, color: '#10b981' },
            { label: 'Pending', value: pending, icon: Clock, color: '#f59e0b' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} style={{
              background: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              padding: '1.25rem 1.4rem',
              display: 'flex', alignItems: 'center', gap: '1rem',
            }}>
              <div style={{
                width: '44px', height: '44px',
                background: `${color}20`,
                borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={20} color={color} />
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filter bar */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              className="input-field"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.4rem' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['all', 'pending', 'completed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: `1px solid ${filter === f ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  background: filter === f ? 'var(--color-accent-light)' : 'transparent',
                  color: filter === f ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textTransform: 'capitalize',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Task list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
            <div className="spinner" style={{ width: '32px', height: '32px', margin: '0 auto 1rem', borderWidth: '3px' }} />
            <p>Loading tasks...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            color: 'var(--color-text-muted)',
          }}>
            <ClipboardList size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
            <p style={{ fontSize: '1rem', fontWeight: 600 }}>
              {search || filter !== 'all' ? 'No tasks match your filters.' : 'No tasks yet!'}
            </p>
            {!search && filter === 'all' && (
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                Click <strong>"Add Task"</strong> to get started.
              </p>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={handleToggle}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <TaskModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditTask(null); }}
        onSubmit={editTask ? handleUpdate : handleCreate}
        editTask={editTask}
        loading={saving}
      />
    </div>
  );
}
