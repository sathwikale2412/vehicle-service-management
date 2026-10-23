"""Self-contained test suite for VSRMS API gateway.

Validates:
- GET /api/health -> 200, service status healthy
- POST /api/ai/insights -> 200, returns health scores & insights
- POST /api/ai/assistant -> 200, returns intelligent automotive reply
"""

import sys
import json
from index import app

def run_tests():
    client = app.test_client()
    passed = 0
    failed = 0

    print("Running VSRMS API Gateway tests...\n")

    # Test 1: /api/health
    resp = client.get('/api/health')
    if resp.status_code == 200 and resp.json.get('status') == 'healthy':
        print("[PASS] GET /api/health returns 200 and healthy status")
        passed += 1
    else:
        print(f"[FAIL] GET /api/health returned {resp.status_code}")
        failed += 1

    # Test 2: POST /api/ai/insights
    payload = {
        'vehicles': [
            {
                'id': 1,
                'name': 'Innova Crysta',
                'odometer_km': 58760,
                'fuel_type': 'Diesel',
                'year': 2020
            }
        ],
        'services': [
            {
                'id': 101,
                'vehicle_id': 1,
                'service_type': 'Oil Change',
                'odometer_km': 56230,
                'cost': 1250
            }
        ],
        'expenses': [
            {
                'id': 201,
                'vehicle_id': 1,
                'title': 'Oil Change',
                'category': 'Service',
                'cost': 1250
            }
        ]
    }
    resp = client.post('/api/ai/insights', json=payload)
    if resp.status_code == 200 and 'health_scores' in resp.json and len(resp.json.get('insights', [])) > 0:
        print("[PASS] POST /api/ai/insights returns health scores and recommendations")
        passed += 1
    else:
        print(f"[FAIL] POST /api/ai/insights returned {resp.status_code} - {resp.data}")
        failed += 1

    # Test 3: POST /api/ai/assistant
    chat_payload = {'message': 'When should I change engine oil?'}
    resp = client.post('/api/ai/assistant', json=chat_payload)
    if resp.status_code == 200 and 'reply' in resp.json and len(resp.json['reply']) > 20:
        print("[PASS] POST /api/ai/assistant returns valid automotive guidance")
        passed += 1
    else:
        print(f"[FAIL] POST /api/ai/assistant returned {resp.status_code}")
        failed += 1

    print(f"\nResults: {passed} passed, {failed} failed.")
    return 0 if failed == 0 else 1

if __name__ == '__main__':
    sys.exit(run_tests())
