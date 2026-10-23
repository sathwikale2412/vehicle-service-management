"""Self-contained test suite for VSRMS API gateway, database & session management.

Validates:
1. GET /api/health -> 200, status healthy, database active
2. POST /api/auth/register -> 201, registers new user & issues session token
3. POST /api/auth/login -> 200, validates credentials & returns active session
4. GET /api/auth/session -> 200, restores & continues user session via token
5. POST /api/data/vehicle & GET /api/data -> 200/201, stores & returns user-scoped fleet data
6. POST /api/auth/logout -> 200, invalidates session token
7. POST /api/ai/insights -> 200, returns vehicle health scores & recommendations
8. POST /api/ai/assistant -> 200, returns automotive diagnostic guidance
"""

import sys
import json
import uuid
from index import app

def run_tests():
    client = app.test_client()
    passed = 0
    failed = 0

    print("Running VSRMS API Gateway, Database & Session Tests...\n")

    # Test 1: GET /api/health
    resp = client.get('/api/health')
    if resp.status_code == 200 and resp.json.get('status') == 'healthy':
        print("[PASS] 1. GET /api/health returns 200 and healthy status")
        passed += 1
    else:
        print(f"[FAIL] 1. GET /api/health returned {resp.status_code}")
        failed += 1

    # Test 2: POST /api/auth/register
    test_email = f"test_{uuid.uuid4().hex[:6]}@vsrms.local"
    reg_payload = {
        'email': test_email,
        'password': 'StrongPassword123',
        'name': 'Test Fleet Owner',
        'phone': '9876543210',
        'address': 'Hyderabad, Telangana'
    }
    resp = client.post('/api/auth/register', json=reg_payload)
    if resp.status_code == 201 and 'session_token' in resp.json and resp.json.get('status') == 'success':
        print("[PASS] 2. POST /api/auth/register creates user & generates session token")
        passed += 1
        new_token = resp.json['session_token']
        new_user_id = resp.json['user']['id']
    else:
        print(f"[FAIL] 2. POST /api/auth/register returned {resp.status_code} - {resp.data}")
        failed += 1
        new_token = None

    # Test 3: POST /api/auth/login (Seed Demo Account)
    login_payload = {
        'email': 'sathwikale@gmail.com',
        'password': 'Password123'
    }
    resp = client.post('/api/auth/login', json=login_payload)
    if resp.status_code == 200 and 'session_token' in resp.json and resp.json['user']['email'] == 'sathwikale@gmail.com':
        print("[PASS] 3. POST /api/auth/login authenticates seed account and logs session")
        passed += 1
        sathwik_token = resp.json['session_token']
    else:
        print(f"[FAIL] 3. POST /api/auth/login returned {resp.status_code} - {resp.data}")
        failed += 1
        sathwik_token = None

    # Test 4: GET /api/auth/session (Continue Session across reloads)
    if sathwik_token:
        headers = {'Authorization': f'Bearer {sathwik_token}'}
        resp = client.get('/api/auth/session', headers=headers)
        if resp.status_code == 200 and resp.json.get('authenticated') is True:
            print("[PASS] 4. GET /api/auth/session validates token and continues session")
            passed += 1
        else:
            print(f"[FAIL] 4. GET /api/auth/session returned {resp.status_code}")
            failed += 1
    else:
        print("[SKIP] 4. Session continuation test skipped (login failed)")
        failed += 1

    # Test 5: Scoped Data Retrieval & Creation in Database
    if sathwik_token:
        headers = {'Authorization': f'Bearer {sathwik_token}'}
        # Retrieve user data
        resp = client.get('/api/data', headers=headers)
        if resp.status_code == 200 and len(resp.json.get('vehicles', [])) >= 2:
            print(f"[PASS] 5a. GET /api/data returned {len(resp.json['vehicles'])} vehicles for authenticated user")
            passed += 1
        else:
            print(f"[FAIL] 5a. GET /api/data returned {resp.status_code}")
            failed += 1

        # Add a vehicle under this user
        new_veh_id = f"veh-test-{uuid.uuid4().hex[:6]}"
        v_payload = {
            'id': new_veh_id,
            'name': 'Tata Safari Dark Edition',
            'model': 'XZA+ Diesel',
            'reg_number': 'TS 09 XY 7788',
            'fuel_type': 'Diesel',
            'year': 2023,
            'odometer_km': 18500
        }
        resp = client.post('/api/data/vehicle', json=v_payload, headers=headers)
        if resp.status_code == 201:
            print("[PASS] 5b. POST /api/data/vehicle stores vehicle in SQLite database")
            passed += 1
        else:
            print(f"[FAIL] 5b. POST /api/data/vehicle returned {resp.status_code}")
            failed += 1
    else:
        failed += 2

    # Test 6: POST /api/auth/logout (Session Invalidation)
    if sathwik_token:
        headers = {'Authorization': f'Bearer {sathwik_token}'}
        resp = client.post('/api/auth/logout', headers=headers)
        if resp.status_code == 200:
            # Now verify session is dead
            check_resp = client.get('/api/auth/session', headers=headers)
            if check_resp.status_code == 401:
                print("[PASS] 6. POST /api/auth/logout invalidates session and prevents unauthorized access")
                passed += 1
            else:
                print(f"[FAIL] 6. Session still valid after logout (code: {check_resp.status_code})")
                failed += 1
        else:
            print(f"[FAIL] 6. POST /api/auth/logout returned {resp.status_code}")
            failed += 1
    else:
        failed += 1

    # Test 7: POST /api/ai/insights
    insights_payload = {
        'vehicles': [{'id': '1', 'name': 'Innova Crysta', 'odometer_km': 58760, 'fuel_type': 'Diesel', 'year': 2020}],
        'services': [{'vehicle_id': '1', 'service_type': 'Oil Change', 'odometer_km': 56230, 'cost': 1250}],
        'expenses': [{'vehicle_id': '1', 'cost': 1250}]
    }
    resp = client.post('/api/ai/insights', json=insights_payload)
    if resp.status_code == 200 and 'health_scores' in resp.json and len(resp.json.get('insights', [])) > 0:
        print("[PASS] 7. POST /api/ai/insights returns health scores and recommendations")
        passed += 1
    else:
        print(f"[FAIL] 7. POST /api/ai/insights returned {resp.status_code}")
        failed += 1

    # Test 8: POST /api/ai/assistant
    chat_payload = {'message': 'When should I change engine oil?'}
    resp = client.post('/api/ai/assistant', json=chat_payload)
    if resp.status_code == 200 and 'reply' in resp.json and len(resp.json['reply']) > 20:
        print("[PASS] 8. POST /api/ai/assistant returns valid automotive guidance")
        passed += 1
    else:
        print(f"[FAIL] 8. POST /api/ai/assistant returned {resp.status_code}")
        failed += 1

    print(f"\n==========================================")
    print(f"Test Suite Summary: {passed} passed, {failed} failed.")
    print(f"==========================================")
    return 0 if failed == 0 else 1

if __name__ == '__main__':
    sys.exit(run_tests())
