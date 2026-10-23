import React from 'react';
import { BarChart3, Download, TrendingUp, AlertCircle, CheckCircle2, Car } from 'lucide-react';

export default function Reports({ vehicles = [], services = [], expenses = [] }) {
  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.cost || 0), 0);
  const totalKm = vehicles.reduce((sum, v) => sum + Number(v.odometer_km || 0), 0);

  const costPerKm = totalKm > 0 && totalSpent > 0 ? (totalSpent / totalKm).toFixed(2) : '0.00';

  // Compute average fleet health
  const healthIndex = vehicles.length > 0
    ? Math.round(
        vehicles.reduce((acc, v) => {
          let score = 100;
          const km = parseInt(v.odometer_km || 0);
          if (km > 100000) score -= 15;
          else if (km > 50000) score -= 8;
          const age = Math.max(0, new Date().getFullYear() - (v.year || 2022));
          score -= Math.min(20, age * 2);
          return acc + Math.max(50, score);
        }, 0) / vehicles.length
      )
    : 100;

  const exportCSV = () => {
    let csv = 'Type,Vehicle,Date,Description,Cost\n';
    services.forEach((s) => {
      csv += `Service,"${s.vehicle_name || 'Vehicle'}","${s.service_date}","${s.service_type}",${s.cost}\n`;
    });
    expenses.forEach((e) => {
      csv += `Expense,"${e.vehicle_name || 'Vehicle'}","${e.expense_date}","${e.title}",${e.cost}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VSRMS-Report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Reports & Analytics</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Maintenance expenditure trends, vehicle health degradation models, and audits.
          </p>
        </div>
        <button className="primary-btn" onClick={exportCSV} disabled={services.length === 0 && expenses.length === 0}>
          <Download size={15} />
          <span>Export CSV Report</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="panel-card" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Average Cost Per KM
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
            ₹{costPerKm} / KM
          </div>
          <div style={{ fontSize: '0.75rem', color: Number(costPerKm) < 1.0 ? '#34d399' : '#fbbf24', marginTop: '0.25rem' }}>
            ● {Number(costPerKm) < 1.0 ? 'Highly cost-efficient maintenance' : 'Average operational expenditure'}
          </div>
        </div>

        <div className="panel-card" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Fleet Health Index
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
            {healthIndex} / 100
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {healthIndex >= 85 ? 'Optimal mechanical status' : 'Routine inspection advised'}
          </div>
        </div>

        <div className="panel-card" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Recorded Services
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>
            {services.length} Completed
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {services.length > 0 ? 'Digital maintenance history' : 'No service records logged yet'}
          </div>
        </div>
      </div>

      <div className="panel-card">
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
          Vehicle-Wise Cost Summary
        </h3>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle Name</th>
                <th>Reg Number</th>
                <th>Model Year</th>
                <th>Total Odometer</th>
                <th>Service Count</th>
                <th>Total Spent</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => {
                const vExp = expenses
                  .filter((e) => e.vehicle_id === v.id || e.vehicleId === v.id)
                  .reduce((sum, e) => sum + Number(e.cost || 0), 0);
                const vSrv = services.filter((s) => s.vehicle_id === v.id || s.vehicleId === v.id).length;

                return (
                  <tr key={v.id}>
                    <td style={{ fontWeight: 600 }}>{v.name}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>{v.reg_number}</td>
                    <td>{v.year}</td>
                    <td>{Number(v.odometer_km || 0).toLocaleString()} KM</td>
                    <td>{vSrv} services</td>
                    <td className="cost-cell">₹{vExp.toLocaleString('en-IN')}</td>
                    <td><span className="vehicle-badge-active">{v.status || 'Active'}</span></td>
                  </tr>
                );
              })}
              {vehicles.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No vehicles found in your fleet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
