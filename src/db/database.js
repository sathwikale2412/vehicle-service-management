import { initialVehicles, initialServices, initialExpenses, initialReminders } from '../lib/initialData';

export const dbService = {
  // Load data for a specific user ID
  async getUserData(userId, token) {
    if (!userId) {
      return { vehicles: [], services: [], expenses: [], reminders: [] };
    }

    // 1. Try Backend API first if token exists
    if (token) {
      try {
        const resp = await fetch('/api/data', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resp.ok) {
          const apiData = await resp.json();
          if (apiData.status === 'success' && apiData.vehicles) {
            this.saveLocalUserData(userId, apiData);
            return apiData;
          }
        }
      } catch (e) {
        console.warn('API data fetch fallback to local cache:', e);
      }
    }

    // 2. Read from user-scoped local storage
    const cached = localStorage.getItem(`vsrms_data_${userId}`);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }

    // 3. If default seed user, load wireframe demo fleet
    if (userId.includes('sathwik') || userId === 'usr-sathwik-default' || userId === 'local-user-1') {
      const defaultData = {
        vehicles: initialVehicles,
        services: initialServices,
        expenses: initialExpenses,
        reminders: initialReminders,
      };
      this.saveLocalUserData(userId, defaultData);
      return defaultData;
    }

    // Clean initial state for any new user
    return { vehicles: [], services: [], expenses: [], reminders: [] };
  },

  saveLocalUserData(userId, data) {
    if (!userId) return;
    localStorage.setItem(`vsrms_data_${userId}`, JSON.stringify(data));
  },

  async addVehicle(userId, vehicle, token) {
    if (token) {
      try {
        await fetch('/api/data/vehicle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(vehicle),
        });
      } catch (e) {}
    }
  },

  async deleteVehicle(userId, vehicleId, token) {
    if (token) {
      try {
        await fetch(`/api/data/vehicle/${vehicleId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {}
    }
  },

  async addService(userId, service, token) {
    if (token) {
      try {
        await fetch('/api/data/service', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(service),
        });
      } catch (e) {}
    }
  },

  async deleteService(userId, serviceId, token) {
    if (token) {
      try {
        await fetch(`/api/data/service/${serviceId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {}
    }
  },

  async addExpense(userId, expense, token) {
    if (token) {
      try {
        await fetch('/api/data/expense', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(expense),
        });
      } catch (e) {}
    }
  },

  async deleteExpense(userId, expenseId, token) {
    if (token) {
      try {
        await fetch(`/api/data/expense/${expenseId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {}
    }
  },

  async addReminder(userId, reminder, token) {
    if (token) {
      try {
        await fetch('/api/data/reminder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(reminder),
        });
      } catch (e) {}
    }
  },

  async deleteReminder(userId, reminderId, token) {
    if (token) {
      try {
        await fetch(`/api/data/reminder/${reminderId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {}
    }
  },
};
