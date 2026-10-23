"""Vehicle Service Record Management System (VSRMS) - API Gateway & AI Assistant Engine.

Provides:
1. /api/health - Service health check & metadata
2. /api/ai/insights - Diagnostic health scoring, upcoming maintenance prediction & expense anomaly detection
3. /api/ai/assistant - Intelligent AI vehicle assistant (hybrid: LLM proxy when configured, with robust automotive diagnostic fallback)
"""

import os
import re
import json
import uuid
import datetime
from flask import Flask, jsonify, request
import requests

app = Flask(__name__)

LLM_API_BASE = os.environ.get('LLM_API_BASE', '').rstrip('/')
LLM_API_KEY = os.environ.get('LLM_API_KEY', '')
LLM_MODEL = os.environ.get('LLM_MODEL', '')


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'service': 'vsrms-ai-gateway',
        'status': 'healthy',
        'version': '1.0.0',
        'ai_engine': 'hybrid-automotive-diagnostic',
        'llm_enabled': bool(LLM_API_BASE and LLM_API_KEY),
        'timestamp': datetime.datetime.now(datetime.timezone.utc).isoformat()
    }), 200


@app.route('/api/ai/insights', methods=['POST'])
def ai_insights():
    """Generates intelligent maintenance and expense insights based on vehicle data."""
    try:
        data = request.get_json(silent=True) or {}
        vehicles = data.get('vehicles', [])
        services = data.get('services', [])
        expenses = data.get('expenses', [])

        insights = []
        health_scores = {}

        total_expense = sum(float(e.get('cost', 0)) for e in expenses)
        total_services = len(services)

        # Anomaly / Maintenance checks per vehicle
        for v in vehicles:
            v_id = str(v.get('id', ''))
            v_name = v.get('name', 'Vehicle')
            km = int(v.get('odometer_km', 0) or 0)
            fuel = v.get('fuel_type', 'Diesel').lower()
            year = int(v.get('year', 2020) or 2020)

            # Health calculation
            score = 100
            if km > 100000:
                score -= 20
            elif km > 50000:
                score -= 10

            current_year = datetime.datetime.now().year
            age = max(0, current_year - year)
            score -= min(25, age * 3)

            # Filter vehicle services
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

            # Tyre rotation recommendation
            if km > 0 and (km % 10000) <= 1500:
                insights.append({
                    'type': 'suggestion',
                    'vehicle': v_name,
                    'title': 'Tyre Rotation & Alignment Due',
                    'detail': f'Rotating tyres every 10,000 km extends tread life by up to 25% for {v_name}.',
                    'action': 'Inspect tread depth and wheel balancing'
                })

            # Battery / Fuel health
            if fuel == 'diesel' and age >= 3:
                insights.append({
                    'type': 'tip',
                    'vehicle': v_name,
                    'title': 'Diesel Fuel Filter & Glow Plug Advisory',
                    'detail': f'High-pressure common rail engines benefit from fuel filter cleaning before monsoon/winter.',
                    'action': 'Drain water separator and test battery CCA'
                })

            health_scores[v_id] = max(40, min(100, score))

        # Overall cost summary insights
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
    """AI Assistant Chat endpoint for maintenance questions, service recommendations, and troubleshooting."""
    try:
        body = request.get_json(silent=True) or {}
        user_message = body.get('message', '').strip()
        context = body.get('context', {})

        if not user_message:
            return jsonify({'reply': 'Hello! I am your AI Vehicle Maintenance Assistant. Ask me anything about service schedules, diagnostic issues, fuel economy, or document renewals.'}), 200

        # If external LLM is configured, try it first
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
                pass  # Fallback to local expert rules engine

        # High quality local Automotive Expert Rules Engine
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
