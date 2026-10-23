import React, { useState } from 'react';
import { Car, Plus, Fuel, Calendar, Gauge, Shield, ChevronRight, MoreVertical, Trash2 } from 'lucide-react';

export default function Vehicles({ vehicles = [], onAddVehicle, onSelectVehicle, onDeleteVehicle }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = vehicles.filter(
    (v) =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.reg_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>My Vehicles</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Manage registered cars, bikes, and commercial vehicles in your fleet.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by model or reg number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '260px' }}
          />
          <button className="primary-btn" onClick={onAddVehicle}>
            <Plus size={16} />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      <div className="vehicles-grid">
        {filtered.map((v) => (
          <div key={v.id} className="vehicle-card">
            <div className="vehicle-card-top">
              <div className="vehicle-illu">
                <Car size={26} />
              </div>
              <span className="vehicle-badge-active">{v.status || 'Active'}</span>
            </div>

            <div className="vehicle-title">{v.name}</div>
            <div className="vehicle-reg">{v.reg_number}</div>

            <div className="vehicle-specs">
              <div className="spec-item">
                <span className="spec-label">Fuel Type</span>
                <span className="spec-val">{v.fuel_type || 'Diesel'}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Model Year</span>
                <span className="spec-val">{v.year || 2020}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Odometer</span>
                <span className="spec-val">{Number(v.odometer_km || 0).toLocaleString()} KM</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Insurance Until</span>
                <span className="spec-val" style={{ color: '#38bdf8' }}>
                  {v.insurance_expiry ? new Date(v.insurance_expiry).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Active'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
              <button
                className="primary-btn"
                style={{ flex: 1, justifyContent: 'center', padding: '0.5rem' }}
                onClick={() => onSelectVehicle(v)}
              >
                <span>View Details</span>
                <ChevronRight size={15} />
              </button>
              {onDeleteVehicle && (
                <button
                  className="icon-btn"
                  title="Remove Vehicle"
                  onClick={() => onDeleteVehicle(v.id)}
                  style={{ color: '#fb7185' }}
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
