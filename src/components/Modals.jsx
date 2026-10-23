import React, { useState } from 'react';
import { X, Car, Wrench, Receipt, Bell } from 'lucide-react';

export function AddVehicleModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    reg_number: '',
    fuel_type: 'Diesel',
    year: 2022,
    odometer_km: 25000,
    reg_date: new Date().toISOString().split('T')[0],
    insurance_expiry: '',
    puc_expiry: '',
    status: 'Active',
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({ ...formData, id: `veh-${Date.now()}` });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
            <Car size={18} style={{ color: '#60a5fa' }} />
            <span>Add New Vehicle</span>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Vehicle Make & Model</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Innova Crysta, Honda Accord"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Registration Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="TS 07 AM 9009"
                  value={formData.reg_number}
                  onChange={(e) => setFormData({ ...formData, reg_number: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Fuel Type</label>
                <select
                  className="form-select"
                  value={formData.fuel_type}
                  onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                >
                  <option value="Diesel">Diesel</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="CNG">CNG</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Model Year</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Current Odometer (KM)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.odometer_km}
                  onChange={(e) => setFormData({ ...formData, odometer_km: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Insurance Expiry Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.insurance_expiry}
                  onChange={(e) => setFormData({ ...formData, insurance_expiry: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">PUC Expiry Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.puc_expiry}
                  onChange={(e) => setFormData({ ...formData, puc_expiry: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="secondary-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-btn">Save Vehicle</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AddServiceModal({ isOpen, onClose, onAdd, vehicles = [], defaultVehicleId }) {
  const [formData, setFormData] = useState({
    vehicle_id: defaultVehicleId || (vehicles[0]?.id || ''),
    service_type: 'Oil Change & Filter',
    service_date: new Date().toISOString().split('T')[0],
    odometer_km: 58000,
    cost: 1500,
    notes: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const selVeh = vehicles.find((v) => v.id === formData.vehicle_id);
    onAdd({
      ...formData,
      id: `srv-${Date.now()}`,
      vehicle_name: selVeh?.name || vehicles[0]?.name || 'Vehicle',
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
            <Wrench size={18} style={{ color: '#60a5fa' }} />
            <span>Log Service Record</span>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Select Vehicle</label>
              <select
                className="form-select"
                value={formData.vehicle_id}
                onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                required
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.reg_number})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Service Name / Work Performed</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Oil change, Brake pad replacement, Alignment"
                value={formData.service_type}
                onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Service Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.service_date}
                  onChange={(e) => setFormData({ ...formData, service_date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Odometer Reading (KM)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.odometer_km}
                  onChange={(e) => setFormData({ ...formData, odometer_km: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Total Cost (₹ INR)</label>
              <input
                type="number"
                className="form-input"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Notes / Parts Used</label>
              <textarea
                className="form-input"
                rows="2"
                placeholder="e.g. Used 5W-30 synthetic oil, genuine oil filter"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="secondary-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-btn">Save Record</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AddExpenseModal({ isOpen, onClose, onAdd, vehicles = [], defaultVehicleId }) {
  const [formData, setFormData] = useState({
    vehicle_id: defaultVehicleId || (vehicles[0]?.id || ''),
    title: '',
    category: 'Service',
    expense_date: new Date().toISOString().split('T')[0],
    cost: 1000,
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const selVeh = vehicles.find((v) => v.id === formData.vehicle_id);
    onAdd({
      ...formData,
      id: `exp-${Date.now()}`,
      vehicle_name: selVeh?.name || vehicles[0]?.name || 'Vehicle',
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
            <Receipt size={18} style={{ color: '#34d399' }} />
            <span>Add Expense</span>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Select Vehicle</label>
              <select
                className="form-select"
                value={formData.vehicle_id}
                onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                required
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.reg_number})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Expense Description</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Diesel fuel top up, Wheel balancing"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Service">Service</option>
                  <option value="Fuel">Fuel</option>
                  <option value="Repair">Repair</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Others">Others</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.expense_date}
                  onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Amount (₹ INR)</label>
              <input
                type="number"
                className="form-input"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="secondary-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-btn">Save Expense</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AddReminderModal({ isOpen, onClose, onAdd, vehicles = [], defaultVehicleId }) {
  const [formData, setFormData] = useState({
    vehicle_id: defaultVehicleId || (vehicles[0]?.id || ''),
    title: 'Upcoming Service Inspection',
    reminder_type: 'Service',
    due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const selVeh = vehicles.find((v) => v.id === formData.vehicle_id);
    onAdd({
      ...formData,
      id: `rem-${Date.now()}`,
      vehicle_name: selVeh?.name || vehicles[0]?.name || 'Vehicle',
      status: 'Pending',
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
            <Bell size={18} style={{ color: '#fbbf24' }} />
            <span>Set Service & Renewal Reminder</span>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Select Vehicle</label>
              <select
                className="form-select"
                value={formData.vehicle_id}
                onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                required
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.reg_number})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Reminder Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Insurance Renewal, PUC Certificate, 60,000 KM Service"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Reminder Type</label>
                <select
                  className="form-select"
                  value={formData.reminder_type}
                  onChange={(e) => setFormData({ ...formData, reminder_type: e.target.value })}
                >
                  <option value="Service">Service</option>
                  <option value="Insurance">Insurance</option>
                  <option value="PUC">PUC Certificate</option>
                  <option value="Tyre">Tyres</option>
                  <option value="Battery">Battery</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="secondary-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-btn">Set Reminder</button>
          </div>
        </form>
      </div>
    </div>
  );
}
