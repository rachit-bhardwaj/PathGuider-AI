import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';
import { getAnalytics, getUsers, updateUserRole } from '../services/supportService';
import StatCard from '../components/admin/StatCard';
import { useAuth } from '../context/AuthContext';

const PIE_COLORS = ['#3D52A0', '#ADBBDA', '#1F9D6E', '#C81E2C', '#7091E6', '#8697C4', '#23305D'];

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [analyticsData, usersData] = await Promise.all([
        getAnalytics(),
        user?.role === 'admin' ? getUsers() : Promise.resolve([])
      ]);
      setAnalytics(analyticsData);
      setUsers(usersData);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRoleChange = async (id, role) => {
    try {
      const updated = await updateUserRole(id, { role });
      setUsers((prev) => prev.map((u) => (u.id === id || u._id === id ? { ...u, role: updated.role } : u)));
      toast.success('Role updated.');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      await updateUserRole(id, { isActive: !isActive });
      setUsers((prev) => prev.map((u) => (u.id === id || u._id === id ? { ...u, isActive: !isActive } : u)));
      toast.success('User status updated.');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading || !analytics) {
    return <div className="p-8 text-sm text-ink-soft">Loading dashboard…</div>;
  }

  const ticketData = analytics.ticketStats.map((t) => ({ name: t._id.replace('-', ' '), count: t.count }));
  const categoryData = analytics.categoryBreakdown.map((c) => ({ name: (c._id || 'general').replace('-', ' '), value: c.count }));
  const helpful = analytics.feedbackStats.find((f) => f._id === 'helpful')?.count || 0;
  const notHelpful = analytics.feedbackStats.find((f) => f._id === 'not-helpful')?.count || 0;

  return (
    <div className="scroll-thin h-full overflow-y-auto p-6 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-display text-2xl font-semibold text-ink">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-ink-soft">A live view of how students are using PathGuider AI.</p>

        <div className="mt-6 flex gap-2 border-b border-border">
          {['overview', 'users'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`border-b-2 px-4 py-2 text-sm font-medium capitalize transition ${
                tab === t ? 'border-navy-600 text-navy-600' : 'border-transparent text-ink-soft hover:text-ink'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard label="Students" value={analytics.totals.students} />
              <StatCard label="Conversations" value={analytics.totals.conversations} />
              <StatCard label="Messages" value={analytics.totals.messages} />
              <StatCard
                label="Escalated"
                value={analytics.totals.escalatedConversations}
                sublabel="Needs staff attention"
                accent="gold"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
                <p className="mb-4 text-sm font-semibold text-ink">Tickets by status</p>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={ticketData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#adbbda" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#545f82' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#545f82' }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3D52A0" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
                <p className="mb-4 text-sm font-semibold text-ink">Conversations by category</p>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                      {categoryData.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
              <p className="mb-2 text-sm font-semibold text-ink">AI response feedback</p>
              <div className="flex items-center gap-6">
                <div>
                  <p className="font-display text-2xl text-success">{helpful}</p>
                  <p className="text-xs text-ink-soft">Marked helpful</p>
                </div>
                <div>
                  <p className="font-display text-2xl text-danger">{notHelpful}</p>
                  <p className="text-xs text-ink-soft">Marked not helpful</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-surface shadow-soft">
            {user?.role !== 'admin' ? (
              <p className="p-6 text-sm text-ink-soft">Only admins can manage users.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-paper text-xs uppercase tracking-wide text-ink-soft">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id || u._id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium text-ink">{u.name}</td>
                      <td className="px-4 py-3 text-ink-soft">{u.email}</td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id || u._id, e.target.value)}
                          className="rounded-lg border border-border bg-paper px-2 py-1.5 text-xs outline-none focus:border-navy-600"
                        >
                          <option value="student">student</option>
                          <option value="agent">agent</option>
                          <option value="admin">admin</option>
                          {u.role === 'counselor' && <option value="counselor">counselor</option>}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            u.isActive ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'
                          }`}
                        >
                          {u.isActive ? 'active' : 'disabled'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleToggleActive(u.id || u._id, u.isActive)}
                          className="text-xs font-medium text-navy-600 hover:underline"
                        >
                          {u.isActive ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
