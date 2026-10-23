"""Vehicle Service Record Management System (VSRMS) - API Gateway, Database & AI Assistant Engine.

Provides:
1. SQLite Database & Storage Engine for users, sessions, logins, vehicles, services, expenses, reminders.
2. User Session Management (/api/auth/register, /api/auth/login, /api/auth/session, /api/auth/logout, /api/auth/profile)
3. User-Scoped Data Endpoints (/api/data, /api/data/vehicle, /api/data/service, /api/data/expense, /api/data/reminder)
4. /api/health - Service health check & metadata
5. /api/ai/insights - Diagnostic health scoring & predictive maintenance
6. /api/ai/assistant - Intelligent automotive diagnostic assistant
"""

import os
import sqlite3
import hashlib
import uuid
import datetime
import json
from flask import Flask, jsonify, request
import requests

app = Flask(__name__)

# Determine database path (compatible with local execution and Vercel serverless /tmp)
DB_DIR = '/tmp' if os.path.exists('/tmp') and os.access('/tmp', os.W_OK) else os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(DB_DIR, 'vsrms.db')

LLM_API_BASE = os.environ.get('LLM_API_BASE', '').rstrip('/')
LLM_API_KEY = os.environ.get('LLM_API_KEY', '')
LLM_MODEL = os.environ.get('LLM_MODEL', '')


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode('utf-8')).hexdigest()


def init_db():
    """Initializes tables and seeds the default demo account matching the handwritten wireframe."""
    conn = get_db()
    cur = conn.cursor()

    cur.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT DEFAULT '',
        address TEXT DEFAULT '',
        created_at TEXT NOT NULL
    )
    ''')

    cur.execute('''
    CREATE TABLE IF NOT EXISTS sessions (
        session_token TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    ''')

    cur.execute('''
    CREATE TABLE IF NOT EXISTS logins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        email TEXT NOT NULL,
        logged_at TEXT NOT NULL,
        ip_address TEXT DEFAULT '',
        user_agent TEXT DEFAULT '',
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    ''')

    cur.execute('''
    CREATE TABLE IF NOT EXISTS vehicles (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        model TEXT DEFAULT '',
        reg_number TEXT NOT NULL,
        fuel_type TEXT DEFAULT 'Diesel',
        year INTEGER DEFAULT 2020,
        odometer_km INTEGER DEFAULT 0,
        reg_date TEXT DEFAULT '',
        insurance_expiry TEXT DEFAULT '',
        puc_expiry TEXT DEFAULT '',
        status TEXT DEFAULT 'Active',
        notes TEXT DEFAULT '',
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    ''')

    cur.execute('''
    CREATE TABLE IF NOT EXISTS service_records (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        vehicle_id TEXT NOT NULL,
        vehicle_name TEXT DEFAULT '',
        service_type TEXT NOT NULL,
        service_date TEXT NOT NULL,
        odometer_km INTEGER DEFAULT 0,
        cost REAL DEFAULT 0,
        notes TEXT DEFAULT '',
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    ''')

    cur.execute('''
    CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        vehicle_id TEXT DEFAULT '',
        vehicle_name TEXT DEFAULT '',
        title TEXT NOT NULL,
        category TEXT DEFAULT 'Service',
        expense_date TEXT NOT NULL,
        cost REAL DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    ''')

    cur.execute('''
    CREATE TABLE IF NOT EXISTS reminders (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        vehicle_id TEXT DEFAULT '',
        vehicle_name TEXT DEFAULT '',
        title TEXT NOT NULL,
        reminder_type TEXT DEFAULT 'Service',
        due_date TEXT NOT NULL,
        status TEXT DEFAULT 'Pending',
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    ''')

    # Seed default user: Ale Sathwik Netha (sathwikale@gmail.com / Password123)
    default_email = 'sathwikale@gmail.com'
    cur.execute('SELECT id FROM users WHERE email = ?', (default_email,))
    user_row = cur.fetchone()

    if not user_row:
        user_id = 'usr-sathwik-default'
        now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()
        cur.execute(
            'INSERT INTO users (id, email, password_hash, name, phone, address, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            (user_id, default_email, hash_password('Password123'), 'Ale Sathwik Netha', '9000848123', '16-2-112/2/C Old City, Hyderabad', now_str)
        )

        # Seed Vehicles from Wireframe
        cur.execute('''
        INSERT INTO vehicles (id, user_id, name, model, reg_number, fuel_type, year, odometer_km, reg_date, insurance_expiry, puc_expiry, status, notes, created_at)
        VALUES 
        ('veh-1', ?, 'Innova Crysta', '2.4 GX AT', 'TS 07 AM 9009', 'Diesel', 2020, 58760, '2020-05-12', '2026-11-15', '2026-12-10', 'Active', 'Primary highway vehicle', ?),
        ('veh-2', ?, 'Honda Accord', '2.0 VTi Executive', 'TS 08 PQ 4219', 'Diesel', 2021, 42300, '2021-08-10', '2026-12-25', '2026-10-30', 'Active', 'City commute vehicle', ?)
        ''', (user_id, now_str, user_id, now_str))

        # Seed Services from Wireframe
        cur.execute('''
        INSERT INTO service_records (id, user_id, vehicle_id, vehicle_name, service_type, service_date, odometer_km, cost, notes, created_at)
        VALUES
        ('srv-1', ?, 'veh-1', 'Innova Crysta', 'Oil Change', '2026-04-20', 56230, 1250, 'Castrol 5W-30 Synthetic', ?),
        ('srv-2', ?, 'veh-1', 'Innova Crysta', 'General Service', '2026-01-15', 52000, 3450, 'Comprehensive inspection', ?),
        ('srv-3', ?, 'veh-1', 'Innova Crysta', 'Wheel Alignment & Balancing', '2025-10-10', 47500, 1200, '4-wheel laser alignment', ?),
        ('srv-4', ?, 'veh-1', 'Innova Crysta', 'Air & Cabin Filter Replacement', '2025-06-12', 43500, 850, 'OEM filters', ?),
        ('srv-5', ?, 'veh-2', 'Honda Accord', 'Brake Pad Replacement', '2026-04-10', 41200, 2850, 'Front ceramic pads', ?)
        ''', (user_id, now_str, user_id, now_str, user_id, now_str, user_id, now_str, user_id, now_str))

        # Seed Expenses from Wireframe
        cur.execute('''
        INSERT INTO expenses (id, user_id, vehicle_id, vehicle_name, title, category, expense_date, cost, created_at)
        VALUES
        ('exp-1', ?, 'veh-1', 'Innova Crysta', 'Oil Change & Filter', 'Service', '2026-04-20', 1250, ?),
        ('exp-2', ?, 'veh-1', 'Innova Crysta', 'Diesel Full Tank (Shell)', 'Fuel', '2026-04-18', 2000, ?),
        ('exp-3', ?, 'veh-2', 'Honda Accord', 'Brake Pads & Grease', 'Repair', '2026-04-10', 2850, ?),
        ('exp-4', ?, 'veh-1', 'Innova Crysta', 'Comprehensive Annual Insurance', 'Insurance', '2026-04-01', 9500, ?),
        ('exp-5', ?, 'veh-1', 'Innova Crysta', 'Ceramic Coating & Detailing', 'Others', '2026-03-15', 4500, ?),
        ('exp-6', ?, 'veh-2', 'Honda Accord', 'Periodic Maintenance Service', 'Service', '2026-02-28', 4550, ?)
        ''', (user_id, now_str, user_id, now_str, user_id, now_str, user_id, now_str, user_id, now_str, user_id, now_str))

        # Seed Reminders from Wireframe
        cur.execute('''
        INSERT INTO reminders (id, user_id, vehicle_id, vehicle_name, title, reminder_type, due_date, status, created_at)
        VALUES
        ('rem-1', ?, 'veh-1', 'Innova Crysta', 'Insurance Renewal', 'Insurance', '2026-11-15', 'Pending', ?),
        ('rem-2', ?, 'veh-1', 'Innova Crysta', 'Pollution Certificate (PUC)', 'PUC', '2026-12-10', 'Pending', ?),
        ('rem-3', ?, 'veh-2', 'Honda Accord', 'General Periodic Service', 'Service', '2026-11-05', 'Pending', ?),
        ('rem-4', ?, 'veh-1', 'Innova Crysta', 'Engine Oil Change Interval', 'Service', '2026-10-30', 'Pending', ?)
        ''', (user_id, now_str, user_id, now_str, user_id, now_str, user_id, now_str))

    conn.commit()
    conn.close()


init_db()


def get_authenticated_user():
    """Extracts and verifies the session token from Authorization header or cookie."""
    auth_header = request.headers.get('Authorization', '')
    token = ''
    if auth_header.startswith('Bearer '):
        token = auth_header[7:].strip()
    elif 'session_token' in request.cookies:
        token = request.cookies.get('session_token')

    if not token:
        token = request.args.get('token', '')

    if not token:
        return None

    conn = get_db()
    cur = conn.cursor()
    cur.execute('''
    SELECT u.id, u.email, u.name, u.phone, u.address, s.session_token
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.session_token = ? AND s.expires_at > ?
    ''', (token, datetime.datetime.now(datetime.timezone.utc).isoformat()))
    user = cur.fetchone()
    conn.close()

    if user:
        return dict(user)
    return None


# ==========================================
# AUTH & SESSION ENDPOINTS
# ==========================================

@app.route('/api/auth/register', methods=['POST'])
def auth_register():
    data = request.get_json(silent=True) or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()
    name = data.get('name', '').strip() or email.split('@')[0]
    phone = data.get('phone', '').strip()
    address = data.get('address', '').strip()

    if not email or not password:
        return jsonify({'status': 'error', 'message': 'Email and password are required'}), 400

    conn = get_db()
    cur = conn.cursor()

    cur.execute('SELECT id FROM users WHERE email = ?', (email,))
    if cur.fetchone():
        conn.close()
        return jsonify({'status': 'error', 'message': 'Account with this email already exists'}), 409

    user_id = f"usr-{uuid.uuid4().hex[:12]}"
    now = datetime.datetime.now(datetime.timezone.utc)
    now_str = now.isoformat()

    cur.execute(
        'INSERT INTO users (id, email, password_hash, name, phone, address, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        (user_id, email, hash_password(password), name, phone, address, now_str)
    )

    # Create session token (valid 30 days)
    session_token = f"sess-{uuid.uuid4().hex}"
    expires_at = (now + datetime.timedelta(days=30)).isoformat()
    cur.execute(
        'INSERT INTO sessions (session_token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)',
        (session_token, user_id, now_str, expires_at)
    )

    # Record login
    cur.execute(
        'INSERT INTO logins (user_id, email, logged_at, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
        (user_id, email, now_str, request.remote_addr or '', request.user_agent.string if request.user_agent else '')
    )

    conn.commit()
    conn.close()

    return jsonify({
        'status': 'success',
        'message': 'Account registered successfully',
        'session_token': session_token,
        'user': {
            'id': user_id,
            'email': email,
            'name': name,
            'phone': phone,
            'address': address
        }
    }), 201


@app.route('/api/auth/login', methods=['POST'])
def auth_login():
    data = request.get_json(silent=True) or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()

    if not email or not password:
        return jsonify({'status': 'error', 'message': 'Email and password required'}), 400

    conn = get_db()
    cur = conn.cursor()
    cur.execute('SELECT id, email, password_hash, name, phone, address FROM users WHERE email = ?', (email,))
    user = cur.fetchone()

    if not user or user['password_hash'] != hash_password(password):
        conn.close()
        return jsonify({'status': 'error', 'message': 'Invalid email or password'}), 401

    now = datetime.datetime.now(datetime.timezone.utc)
    now_str = now.isoformat()
    session_token = f"sess-{uuid.uuid4().hex}"
    expires_at = (now + datetime.timedelta(days=30)).isoformat()

    cur.execute(
        'INSERT INTO sessions (session_token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)',
        (session_token, user['id'], now_str, expires_at)
    )

    # Record login in database
    cur.execute(
        'INSERT INTO logins (user_id, email, logged_at, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
        (user['id'], email, now_str, request.remote_addr or '', request.user_agent.string if request.user_agent else '')
    )

    conn.commit()
    conn.close()

    return jsonify({
        'status': 'success',
        'message': 'Logged in successfully',
        'session_token': session_token,
        'user': {
            'id': user['id'],
            'email': user['email'],
            'name': user['name'],
            'phone': user['phone'],
            'address': user['address']
        }
    }), 200


@app.route('/api/auth/session', methods=['GET'])
def auth_session():
    """Validates session token and returns active user info so sessions continue across reloads."""
    user = get_authenticated_user()
    if not user:
        return jsonify({'status': 'error', 'message': 'No active session or session expired'}), 401

    return jsonify({
        'status': 'success',
        'authenticated': True,
        'user': user
    }), 200


@app.route('/api/auth/logout', methods=['POST'])
def auth_logout():
    auth_header = request.headers.get('Authorization', '')
    token = auth_header[7:].strip() if auth_header.startswith('Bearer ') else request.args.get('token', '')

    if token:
        conn = get_db()
        cur = conn.cursor()
        cur.execute('DELETE FROM sessions WHERE session_token = ?', (token,))
        conn.commit()
        conn.close()

    return jsonify({'status': 'success', 'message': 'Logged out successfully'}), 200


@app.route('/api/auth/profile', methods=['PUT'])
def auth_update_profile():
    user = get_authenticated_user()
    if not user:
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401

    data = request.get_json(silent=True) or {}
    name = data.get('name', user['name']).strip()
    phone = data.get('phone', user['phone']).strip()
    address = data.get('address', user['address']).strip()

    conn = get_db()
    cur = conn.cursor()
    cur.execute('UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?', (name, phone, address, user['id']))
    conn.commit()
    conn.close()

    return jsonify({
        'status': 'success',
        'user': {
            'id': user['id'],
            'email': user['email'],
            'name': name,
            'phone': phone,
            'address': address
        }
    }), 200


# ==========================================
# USER-SCOPED DATA ENDPOINTS
# ==========================================

@app.route('/api/data', methods=['GET'])
def get_user_data():
    """Returns all fleet, service, expense, and reminder records scoped strictly to the logged-in user."""
    user = get_authenticated_user()
    if not user:
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401

    user_id = user['id']
    conn = get_db()
    cur = conn.cursor()

    cur.execute('SELECT * FROM vehicles WHERE user_id = ? ORDER BY created_at DESC', (user_id,))
    vehicles = [dict(row) for row in cur.fetchall()]

    cur.execute('SELECT * FROM service_records WHERE user_id = ? ORDER BY service_date DESC', (user_id,))
    services = [dict(row) for row in cur.fetchall()]

    cur.execute('SELECT * FROM expenses WHERE user_id = ? ORDER BY expense_date DESC', (user_id,))
    expenses = [dict(row) for row in cur.fetchall()]

    cur.execute('SELECT * FROM reminders WHERE user_id = ? ORDER BY due_date ASC', (user_id,))
    reminders = [dict(row) for row in cur.fetchall()]

    conn.close()

    return jsonify({
        'status': 'success',
        'vehicles': vehicles,
        'services': services,
        'expenses': expenses,
        'reminders': reminders
    }), 200


@app.route('/api/data/vehicle', methods=['POST'])
def add_vehicle():
    user = get_authenticated_user()
    if not user:
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401

    data = request.get_json(silent=True) or {}
    v_id = data.get('id') or f"veh-{uuid.uuid4().hex[:8]}"
    now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()

    conn = get_db()
    cur = conn.cursor()
    cur.execute('''
    INSERT INTO vehicles (id, user_id, name, model, reg_number, fuel_type, year, odometer_km, reg_date, insurance_expiry, puc_expiry, status, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        v_id, user['id'], data.get('name', 'Vehicle'), data.get('model', ''),
        data.get('reg_number', 'TS 00 XX 0000'), data.get('fuel_type', 'Diesel'),
        int(data.get('year', 2022)), int(data.get('odometer_km', 0)),
        data.get('reg_date', ''), data.get('insurance_expiry', ''),
        data.get('puc_expiry', ''), data.get('status', 'Active'),
        data.get('notes', ''), now_str
    ))
    conn.commit()
    conn.close()

    return jsonify({'status': 'success', 'id': v_id}), 201


@app.route('/api/data/vehicle/<vehicle_id>', methods=['DELETE'])
def delete_vehicle(vehicle_id):
    user = get_authenticated_user()
    if not user:
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401

    conn = get_db()
    cur = conn.cursor()
    cur.execute('DELETE FROM vehicles WHERE id = ? AND user_id = ?', (vehicle_id, user['id']))
    conn.commit()
    conn.close()
    return jsonify({'status': 'success'}), 200


@app.route('/api/data/service', methods=['POST'])
def add_service():
    user = get_authenticated_user()
    if not user:
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401

    data = request.get_json(silent=True) or {}
    s_id = data.get('id') or f"srv-{uuid.uuid4().hex[:8]}"
    now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()

    conn = get_db()
    cur = conn.cursor()
    cur.execute('''
    INSERT INTO service_records (id, user_id, vehicle_id, vehicle_name, service_type, service_date, odometer_km, cost, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        s_id, user['id'], data.get('vehicle_id', ''), data.get('vehicle_name', ''),
        data.get('service_type', 'Service'), data.get('service_date', ''),
        int(data.get('odometer_km', 0)), float(data.get('cost', 0)),
        data.get('notes', ''), now_str
    ))
    conn.commit()
    conn.close()

    return jsonify({'status': 'success', 'id': s_id}), 201


@app.route('/api/data/service/<service_id>', methods=['DELETE'])
def delete_service(service_id):
    user = get_authenticated_user()
    if not user:
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401

    conn = get_db()
    cur = conn.cursor()
    cur.execute('DELETE FROM service_records WHERE id = ? AND user_id = ?', (service_id, user['id']))
    conn.commit()
    conn.close()
    return jsonify({'status': 'success'}), 200


@app.route('/api/data/expense', methods=['POST'])
def add_expense():
    user = get_authenticated_user()
    if not user:
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401

    data = request.get_json(silent=True) or {}
    e_id = data.get('id') or f"exp-{uuid.uuid4().hex[:8]}"
    now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()

    conn = get_db()
    cur = conn.cursor()
    cur.execute('''
    INSERT INTO expenses (id, user_id, vehicle_id, vehicle_name, title, category, expense_date, cost, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        e_id, user['id'], data.get('vehicle_id', ''), data.get('vehicle_name', ''),
        data.get('title', 'Expense'), data.get('category', 'Service'),
        data.get('expense_date', ''), float(data.get('cost', 0)), now_str
    ))
    conn.commit()
    conn.close()

    return jsonify({'status': 'success', 'id': e_id}), 201


@app.route('/api/data/expense/<expense_id>', methods=['DELETE'])
def delete_expense(expense_id):
    user = get_authenticated_user()
    if not user:
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401

    conn = get_db()
    cur = conn.cursor()
    cur.execute('DELETE FROM expenses WHERE id = ? AND user_id = ?', (expense_id, user['id']))
    conn.commit()
    conn.close()
    return jsonify({'status': 'success'}), 200


@app.route('/api/data/reminder', methods=['POST'])
def add_reminder():
    user = get_authenticated_user()
    if not user:
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401

    data = request.get_json(silent=True) or {}
    r_id = data.get('id') or f"rem-{uuid.uuid4().hex[:8]}"
    now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()

    conn = get_db()
    cur = conn.cursor()
    cur.execute('''
    INSERT INTO reminders (id, user_id, vehicle_id, vehicle_name, title, reminder_type, due_date, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        r_id, user['id'], data.get('vehicle_id', ''), data.get('vehicle_name', ''),
        data.get('title', 'Reminder'), data.get('reminder_type', 'Service'),
        data.get('due_date', ''), data.get('status', 'Pending'), now_str
    ))
    conn.commit()
    conn.close()

    return jsonify({'status': 'success', 'id': r_id}), 201


@app.route('/api/data/reminder/<reminder_id>', methods=['DELETE'])
def delete_reminder(reminder_id):
    user = get_authenticated_user()
    if not user:
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401

    conn = get_db()
    cur = conn.cursor()
    cur.execute('DELETE FROM reminders WHERE id = ? AND user_id = ?', (reminder_id, user['id']))
    conn.commit()
    conn.close()
    return jsonify({'status': 'success'}), 200


# ==========================================
# HEALTH & AI ENDPOINTS
# ==========================================

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'service': 'vsrms-ai-gateway',
        'status': 'healthy',
        'version': '1.1.0',
        'database': 'sqlite-active',
        'ai_engine': 'hybrid-automotive-diagnostic',
        'llm_enabled': bool(LLM_API_BASE and LLM_API_KEY),
        'timestamp': datetime.datetime.now(datetime.timezone.utc).isoformat()
    }), 200


@app.route('/api/ai/insights', methods=['POST'])
def ai_insights():
    try:
        data = request.get_json(silent=True) or {}
        vehicles = data.get('vehicles', [])
        services = data.get('services', [])
        expenses = data.get('expenses', [])

        insights = []
        health_scores = {}

        total_expense = sum(float(e.get('cost', 0)) for e in expenses)
        total_services = len(services)

        for v in vehicles:
            v_id = str(v.get('id', ''))
            v_name = v.get('name', 'Vehicle')
            km = int(v.get('odometer_km', 0) or 0)
            fuel = v.get('fuel_type', 'Diesel').lower()
            year = int(v.get('year', 2020) or 2020)

            score = 100
            if km > 100000:
                score -= 20
            elif km > 50000:
                score -= 10

            current_year = datetime.datetime.now().year
            age = max(0, current_year - year)
            score -= min(25, age * 3)

            v_services = [s for s in services if str(s.get('vehicle_id', '')) == v_id or str(s.get('vehicleId', '')) == v_id]
            last_service_km = max([int(s.get('odometer_km', 0) or 0) for s in v_services], default=0)
            km_since_service = km - last_service_km if last_service_km > 0 else km

            if km_since_service >= 10000:
                score -= 15
                insights.append({
                    'type': 'warning',
                    'vehicle': v_name,
                    'title': 'Overdue Engine Oil & Filter Change',
                    'detail': f'{v_name} has covered {km_since_service:,} km since its last recorded service. Standard interval is 10,000 km.',
                    'action': 'Schedule oil and filter replacement'
                })
            elif km_since_service >= 7500:
                insights.append({
                    'type': 'info',
                    'vehicle': v_name,
                    'title': 'Service Window Approaching',
                    'detail': f'{v_name} is within 2,500 km of its next routine inspection.',
                    'action': 'Check fluid levels and brake pad thickness'
                })

            if km > 0 and (km % 10000) <= 1500:
                insights.append({
                    'type': 'suggestion',
                    'vehicle': v_name,
                    'title': 'Tyre Rotation & Alignment Due',
                    'detail': f'Rotating tyres every 10,000 km extends tread life by up to 25% for {v_name}.',
                    'action': 'Inspect tread depth and wheel balancing'
                })

            if fuel == 'diesel' and age >= 3:
                insights.append({
                    'type': 'tip',
                    'vehicle': v_name,
                    'title': 'Diesel Fuel Filter & Glow Plug Advisory',
                    'detail': f'High-pressure common rail engines benefit from fuel filter cleaning before monsoon/winter.',
                    'action': 'Drain water separator and test battery CCA'
                })

            health_scores[v_id] = max(40, min(100, score))

        if total_expense > 0:
            avg_per_service = total_expense / max(1, total_services) if total_services else 0
            if avg_per_service > 8000:
                insights.append({
                    'type': 'budget',
                    'vehicle': 'Fleet Overview',
                    'title': 'High Average Maintenance Cost',
                    'detail': f'Average service expense is ₹{avg_per_service:,.0f}. Sourcing OEM parts directly can reduce recurring costs by 15-20%.',
                    'action': 'Audit consumable item invoices'
                })

        return jsonify({
            'status': 'success',
            'health_scores': health_scores,
            'insights': insights,
            'total_analyzed_vehicles': len(vehicles),
            'generated_at': datetime.datetime.now(datetime.timezone.utc).isoformat()
        }), 200

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': 'Failed to compute AI insights',
            'error_ref': uuid.uuid4().hex[:8]
        }), 500


@app.route('/api/ai/assistant', methods=['POST'])
def ai_assistant():
    try:
        body = request.get_json(silent=True) or {}
        user_message = body.get('message', '').strip()

        if not user_message:
            return jsonify({'reply': 'Hello! I am your AI Vehicle Maintenance Assistant. Ask me anything about service schedules, diagnostic issues, fuel economy, or document renewals.'}), 200

        if LLM_API_BASE and LLM_API_KEY:
            try:
                system_prompt = (
                    "You are the intelligent AI Vehicle Maintenance Assistant for the Vehicle Service Record Management System (VSRMS). "
                    "You provide helpful, concise, safety-conscious advice regarding vehicle upkeep, service intervals, repair cost estimates, "
                    "PUC/insurance compliance, and diagnostics. Always format prices in Indian Rupees (₹) where relevant."
                )
                headers = {
                    'Authorization': f'Bearer {LLM_API_KEY}',
                    'Content-Type': 'application/json'
                }
                payload = {
                    'model': LLM_MODEL or 'gpt-4o-mini',
                    'messages': [
                        {'role': 'system', 'content': system_prompt},
                        {'role': 'user', 'content': user_message}
                    ],
                    'max_tokens': 450,
                    'temperature': 0.7
                }
                resp = requests.post(f"{LLM_API_BASE}/chat/completions", headers=headers, json=payload, timeout=8)
                if resp.status_code == 200:
                    resp_json = resp.json()
                    ai_text = resp_json.get('choices', [{}])[0].get('message', {}).get('content', '')
                    if ai_text:
                        return jsonify({'reply': ai_text, 'engine': 'llm'}), 200
            except Exception:
                pass

        q = user_message.lower()
        reply = ""

        if any(w in q for w in ['oil', 'engine oil', 'lubricant']):
            reply = (
                "**Engine Oil Guidelines:**\n"
                "• **Synthetic Oil:** Change every 10,000 km or 12 months (whichever comes first).\n"
                "• **Mineral Oil:** Change every 5,000 km or 6 months.\n"
                "• Always replace the **oil filter** at every oil change.\n"
                "• *Recommendation:* For common rail diesel vehicles (like Innova Crysta), use API CK-4 / ACEA C3 5W-30 synthetic oil for optimum turbo and DPF protection."
            )
        elif any(w in q for w in ['tyre', 'tire', 'alignment', 'balancing', 'tread']):
            reply = (
                "**Tyre Maintenance & Wheel Alignment:**\n"
                "• **Tyre Rotation:** Recommended every 8,000 to 10,000 km to ensure even tread wear.\n"
                "• **Wheel Alignment & Balancing:** Perform every 5,000 km or immediately if the vehicle pulls to one side or vibrates above 80 km/h.\n"
                "• **Cold Tyre Pressure:** Maintain factory specifications (typically 32-35 PSI). Check monthly, including the spare."
            )
        elif any(w in q for w in ['insurance', 'puc', 'pollution', 'document', 'rc']):
            reply = (
                "**Compliance & Document Renewal Advisory:**\n"
                "• **PUC (Pollution Under Control):** BS-IV & BS-VI vehicles require annual PUC certificates; older vehicles require renewal every 6 months.\n"
                "• **Insurance:** Comprehensive motor insurance must be renewed before expiry to prevent lapse of No Claim Bonus (NCB) and legal penalties.\n"
                "• *Tip:* You can track these dates directly in the **Service Reminders** tab with automated countdown alerts."
            )
        elif any(w in q for w in ['brake', 'pad', 'rotor', 'disc', 'squeak']):
            reply = (
                "**Brake Inspection & Safety:**\n"
                "• Inspect brake pad thickness every 10,000 km. Replace pads when friction material is under 3mm.\n"
                "• Flush and replace **Brake Fluid (DOT 3/4)** every 2 years or 30,000 km, as brake fluid absorbs atmospheric moisture.\n"
                "• Squealing or grinding noises indicate worn pads or scored rotors requiring immediate attention."
            )
        elif any(w in q for w in ['battery', 'voltage', 'starting', 'crank']):
            reply = (
                "**Battery Health Tips:**\n"
                "• Standard automotive 12V lead-acid batteries last between 3 to 4 years.\n"
                "• Resting voltage should read between **12.4V and 12.7V**; alternator charging voltage should be **13.8V to 14.4V**.\n"
                "• Clean terminal corrosion using baking soda solution and apply petroleum jelly to prevent sulphate buildup."
            )
        elif any(w in q for w in ['mileage', 'fuel', 'economy', 'average', 'consumption']):
            reply = (
                "**Maximizing Fuel Economy:**\n"
                "1. Maintain correct tyre pressure (under-inflation increases fuel consumption by 5%).\n"
                "2. Clean/replace the engine air filter every 10,000 km.\n"
                "3. Avoid aggressive acceleration and excessive idling (idling burns ~0.8L/hr).\n"
                "4. Use higher gears smoothly between 1,500 - 2,200 RPM for diesel engines."
            )
        elif any(w in q for w in ['cost', 'expense', 'budget', 'price', 'estimate']):
            reply = (
                "**Average Maintenance Cost Benchmarks (India):**\n"
                "• **Routine Periodic Service:** ₹3,500 – ₹7,500 (Oil, filter, labor, top-ups).\n"
                "• **Wheel Alignment & Balancing:** ₹700 – ₹1,200.\n"
                "• **Front Brake Pad Replacement:** ₹2,500 – ₹4,800.\n"
                "• **Air & Cabin AC Filter:** ₹800 – ₹1,600.\n"
                "Check the **Expense Tracker** section to view your vehicle's cumulative cost breakdown."
            )
        elif any(w in q for w in ['innova', 'accord', 'vehicle', 'car']):
            reply = (
                "**Registered Vehicles in Fleet:**\n"
                "• **Toyota Innova Crysta (TS 07 AM 9009):** Diesel, 2020 model. Known for high reliability; timing chain inspection recommended at 150,000 km.\n"
                "• **Honda Accord (TS 08 PQ 4219):** Diesel, 2021 model. Ensure synthetic low-ash engine oil is utilized to protect the turbocharger."
            )
        else:
            reply = (
                f"**VSRMS AI Diagnostic Insights for '{user_message}':**\n\n"
                "• Regular scheduled maintenance prevents up to 70% of premature vehicle mechanical failures.\n"
                "• For safety and warranty compliance, adhere strictly to recommended odometer intervals.\n"
                "• You can log this event under **Service Records** or set a targeted reminder under **Service Reminders**."
            )

        return jsonify({
            'reply': reply,
            'engine': 'rule-based-expert-engine'
        }), 200

    except Exception as e:
        return jsonify({
            'reply': 'I encountered an issue processing your question. Please verify your vehicle query or try again.',
            'error_ref': uuid.uuid4().hex[:8]
        }), 200


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5002))
    app.run(host='0.0.0.0', port=port, debug=True)
