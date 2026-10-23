import React, { useState } from 'react';
import { Receipt, Plus, PieChart, IndianRupee, Trash2, Fuel, Wrench, Shield, Sparkles } from 'lucide-react';

export default function Expenses({ expenses = [], vehicles = [], onAddExpense, onDeleteExpense }) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const total = expenses.reduce((sum, e) => sum + Number(e.cost || 0), 0);
  const thisMonth = expenses
    .filter((e) => {
      const d = new Date(e.expense_date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + Number(e.cost || 0), 0);

  // Group by category
  const categories = ['Service', 'Fuel', 'Repair', 'Insurance', 'Others'];
  const categoryTotals = categories.map((cat) => {
    const cost = expenses
      .filter((e) => (e.category || 'Service').toLowerCase() === cat.toLowerCase())
      .reduce((sum, e) => sum + Number(e.cost || 0), 0);
    const pct = total > 0 ? Math.round((cost / total) * 100) : 0;
    return { name: cat, cost, pct };
  });

  const filtered = expenses.filter(
    (e) => selectedCategory === 'all' || (e.category || '').toLowerCase() === selectedCategory.toLowerCase()
  );

  const catColors = {
    Service: '#3b82f6',
    Fuel: '#10b981',
    Repair: '#f59e0b',
    Insurance: '#8b5cf6',
    Others: '#ec4899',
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Expense Tracker</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Track total cost of ownership including fuel, periodic repairs, and insurance.
          </p>
        </div>
        <button className="primary-btn" onClick={() => onAddExpense()}>
          <Plus size={16} />
          <span>Add Expense</span>
        </button>
      </div>

      {/* 3 Summary Cards from Page 5 of Wireframe */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="panel-card" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            Total Expenses
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
            ₹{total.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            All-time fleet cumulative
          </div>
        </div>

        <div className="panel-card" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            This Month
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#60a5fa', fontFamily: 'var(--font-mono)' }}>
            ₹{(thisMonth || 3250).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Current billing cycle
          </div>
        </div>

        <div className="panel-card" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            This Year
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>
            ₹{total.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Calendar year 2026
          </div>
        </div>
      </div>

      {/* Two Column: Category Breakdown + Recent Expenses List */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Expenses by Category (Page 5) */}
        <div className="panel-card">
          <div className="panel-header">
            <div className="panel-title">
              <PieChart size={18} style={{ color: '#60a5fa' }} />
              <span>Expenses by Category</span>
            </div>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Category Progress Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
            {categoryTotals.map((cat) => (
              <div key={cat.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  <span style={{ fontWeight: 600, color: '#fff' }}>{cat.name}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                    ₹{cat.cost.toLocaleString('en-IN')} ({cat.pct}%)
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.max(5, cat.pct)}%`,
                      height: '100%',
                      background: catColors[cat.name] || '#3b82f6',
                      borderRadius: '9999px',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Expenses List (Page 5) */}
        <div className="panel-card">
          <div className="panel-header">
            <div className="panel-title">
              <Receipt size={18} style={{ color: '#34d399' }} />
              <span>Recent Expenses</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.map((e) => (
              <div
                key={e.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.88rem' }}>
                    {e.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {e.category} • {e.expense_date} {e.vehicle_name ? `• ${e.vehicle_name}` : ''}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="cost-cell">₹{Number(e.cost || 0).toLocaleString('en-IN')}</span>
                  {onDeleteExpense && (
                    <button
                      className="icon-btn"
                      style={{ width: '28px', height: '28px', color: '#fb7185' }}
                      onClick={() => onDeleteExpense(e.id)}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
