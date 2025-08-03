# ===================================
# 🚨 SECURITY ALERTS SYSTEM
# Real-time notifications without database
# ===================================

import asyncio
import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Set, Optional, Any
import websockets
from collections import defaultdict, deque
import logging

logger = logging.getLogger(__name__)

class SecurityNotificationManager:
    def __init__(self):
        # WebSocket connections storage (in-memory)
        self.connected_admins: Set[websockets.WebSocketServerProtocol] = set()
        self.connection_info: Dict[websockets.WebSocketServerProtocol, Dict] = {}
        
        # Alert storage (in-memory, last 1000 alerts)
        self.alert_history: deque = deque(maxlen=1000)
        self.alert_stats: Dict[str, int] = defaultdict(int)
        
        # Device tracking (in-memory)
        self.known_devices: Dict[str, List[Dict]] = defaultdict(list)  # username -> [devices]
        self.user_profiles: Dict[str, Dict] = {}  # username -> security profile
        
        # Risk analysis cache
        self.risk_cache: Dict[str, Dict] = {}  # user -> recent risk analysis
        
        # Cleanup task
        self.cleanup_task = None
        
    async def start_cleanup_task(self):
        """Start background cleanup task"""
        if not self.cleanup_task:
            self.cleanup_task = asyncio.create_task(self._cleanup_loop())
    
    async def _cleanup_loop(self):
        """Background cleanup of old data"""
        while True:
            try:
                await asyncio.sleep(300)  # Every 5 minutes
                await self._cleanup_old_data()
            except Exception as e:
                logger.error(f"Cleanup error: {e}")
    
    async def _cleanup_old_data(self):
        """Clean up old cached data"""
        cutoff_time = datetime.now() - timedelta(hours=24)
        
        # Clean risk cache
        for username in list(self.risk_cache.keys()):
            if self.risk_cache[username].get('timestamp', datetime.min) < cutoff_time:
                del self.risk_cache[username]
        
        logger.info(f"[CLEANUP] Cleaned old cached data")
    
    # ===================================
    # WebSocket Connection Management
    # ===================================
    
    async def register_admin(self, websocket, user_info: Dict):
        """Register admin connection for notifications"""
        self.connected_admins.add(websocket)
        self.connection_info[websocket] = {
            'username': user_info.get('username'),
            'role': user_info.get('role'),
            'connected_at': datetime.now(),
            'ip': user_info.get('ip', 'unknown')
        }
        
        logger.info(f"[WEBSOCKET] Admin connected: {user_info.get('username')}")
        
        # Send recent alerts to newly connected admin
        recent_alerts = list(self.alert_history)[-10:]  # Last 10 alerts
        for alert in recent_alerts:
            await self._send_to_connection(websocket, alert)
    
    async def unregister_admin(self, websocket):
        """Unregister admin connection"""
        self.connected_admins.discard(websocket)
        user_info = self.connection_info.pop(websocket, {})
        logger.info(f"[WEBSOCKET] Admin disconnected: {user_info.get('username', 'unknown')}")
    
    async def broadcast_to_admins(self, alert: Dict):
        """Broadcast alert to all connected admins"""
        if not self.connected_admins:
            logger.warning("[BROADCAST] No admins connected to receive alert")
            return
        
        # Store alert in history
        alert['id'] = str(uuid.uuid4())
        alert['timestamp'] = datetime.now().isoformat()
        self.alert_history.append(alert)
        self.alert_stats[alert['type']] += 1
        
        # Send to all connected admins
        disconnected = set()
        for websocket in self.connected_admins:
            try:
                await self._send_to_connection(websocket, alert)
            except websockets.exceptions.ConnectionClosed:
                disconnected.add(websocket)
            except Exception as e:
                logger.error(f"[BROADCAST] Error sending to admin: {e}")
                disconnected.add(websocket)
        
        # Clean up disconnected admins
        for websocket in disconnected:
            await self.unregister_admin(websocket)
        
        logger.info(f"[BROADCAST] Alert sent to {len(self.connected_admins)} admins: {alert['type']}")
    
    async def _send_to_connection(self, websocket, alert: Dict):
        """Send alert to specific connection"""
        try:
            await websocket.send(json.dumps(alert))
        except Exception as e:
            logger.error(f"[WEBSOCKET] Send error: {e}")
            raise
    
    # ===================================
    # Device Fingerprinting & Analysis
    # ===================================
    
    def store_device_fingerprint(self, username: str, device_fingerprint: Dict):
        """Store device fingerprint for user (in-memory)"""
        device_info = {
            'fingerprint': device_fingerprint,
            'first_seen': datetime.now(),
            'last_seen': datetime.now(),
            'trust_score': 50,  # Start with neutral trust
            'usage_count': 1
        }
        
        # Check if device already exists
        existing_devices = self.known_devices[username]
        for i, existing in enumerate(existing_devices):
            if self._compare_fingerprints(existing['fingerprint'], device_fingerprint) > 85:
                # Update existing device
                existing_devices[i]['last_seen'] = datetime.now()
                existing_devices[i]['usage_count'] += 1
                existing_devices[i]['trust_score'] = min(100, existing_devices[i]['trust_score'] + 5)
                return existing_devices[i]
        
        # Add new device
        self.known_devices[username].append(device_info)
        
        # Keep only last 10 devices per user
        if len(self.known_devices[username]) > 10:
            self.known_devices[username] = self.known_devices[username][-10:]
        
        return device_info
    
    def _compare_fingerprints(self, fp1: Dict, fp2: Dict) -> int:
        """Compare two fingerprints and return similarity score (0-100)"""
        if not fp1 or not fp2:
            return 0
        
        score = 0
        total_weight = 0
        
        # Define comparison weights
        comparisons = [
            ('userAgent', 20),
            ('screen', 15),
            ('timezone', 10),
            ('language', 10),
            ('platform', 15),
            ('canvas', 20),
            ('hash', 10)
        ]
        
        for field, weight in comparisons:
            total_weight += weight
            
            val1 = self._get_nested_value(fp1, field)
            val2 = self._get_nested_value(fp2, field)
            
            if val1 and val2:
                if isinstance(val1, dict) and isinstance(val2, dict):
                    if json.dumps(val1, sort_keys=True) == json.dumps(val2, sort_keys=True):
                        score += weight
                elif str(val1) == str(val2):
                    score += weight
        
        return int((score / total_weight) * 100) if total_weight > 0 else 0
    
    def _get_nested_value(self, obj: Dict, field: str):
        """Get nested value from object"""
        if '.' in field:
            parts = field.split('.')
            value = obj
            for part in parts:
                value = value.get(part) if isinstance(value, dict) else None
                if value is None:
                    break
            return value
        return obj.get(field)
    
    # ===================================
    # Risk Analysis
    # ===================================
    
    async def analyze_login_risk(self, username: str, device_fingerprint: Dict, ip: str) -> Dict:
        """Analyze login risk without database"""
        risk_factors = []
        risk_score = 0
        
        # Store/update device fingerprint
        device_info = self.store_device_fingerprint(username, device_fingerprint)
        
        # Get user profile (create if not exists)
        if username not in self.user_profiles:
            self.user_profiles[username] = {
                'first_login': datetime.now(),
                'usual_hours': set(),
                'usual_ips': set(),
                'login_count': 0
            }
        
        profile = self.user_profiles[username]
        profile['login_count'] += 1
        
        # 1. New device check
        if device_info['usage_count'] == 1:
            risk_score += 40
            risk_factors.append({
                'type': 'NEW_DEVICE',
                'severity': 'HIGH',
                'description': 'Login from previously unknown device',
                'weight': 40
            })
        
        # 2. Low trust device
        elif device_info['trust_score'] < 30:
            risk_score += 25
            risk_factors.append({
                'type': 'LOW_TRUST_DEVICE',
                'severity': 'MEDIUM',
                'description': f"Device trust score: {device_info['trust_score']}/100",
                'weight': 25
            })
        
        # 3. Unusual time check
        current_hour = datetime.now().hour
        profile['usual_hours'].add(current_hour)
        
        if len(profile['usual_hours']) > 5:  # Only check after some login history
            recent_hours = {h for h in profile['usual_hours']} 
            if len(recent_hours) > 0:
                hour_variance = max(recent_hours) - min(recent_hours)
                if hour_variance > 12 and current_hour not in recent_hours:
                    risk_score += 20
                    risk_factors.append({
                        'type': 'UNUSUAL_TIME',
                        'severity': 'MEDIUM',
                        'description': f'Login at unusual time: {current_hour}:00',
                        'weight': 20
                    })
        
        # 4. New IP check  
        profile['usual_ips'].add(ip)
        if len(profile['usual_ips']) > 10:  # Keep only recent IPs
            profile['usual_ips'] = set(list(profile['usual_ips'])[-10:])
        
        if ip not in profile['usual_ips'] and len(profile['usual_ips']) > 2:
            risk_score += 15
            risk_factors.append({
                'type': 'NEW_IP',
                'severity': 'LOW',
                'description': f'Login from new IP: {ip}',
                'weight': 15
            })
        
        # 5. Bot detection
        if self._is_likely_bot(device_fingerprint):
            risk_score += 50
            risk_factors.append({
                'type': 'BOT_DETECTED',
                'severity': 'CRITICAL',
                'description': 'Device fingerprint suggests automated access',
                'weight': 50
            })
        
        # Calculate final risk level
        if risk_score >= 80:
            risk_level = 'CRITICAL'
        elif risk_score >= 50:
            risk_level = 'HIGH'
        elif risk_score >= 25:
            risk_level = 'MEDIUM'
        else:
            risk_level = 'LOW'
        
        risk_analysis = {
            'username': username,
            'risk_score': min(100, risk_score),
            'risk_level': risk_level,
            'risk_factors': risk_factors,
            'device_trust_score': device_info['trust_score'],
            'is_new_device': device_info['usage_count'] == 1,
            'timestamp': datetime.now(),
            'ip': ip
        }
        
        # Cache analysis
        self.risk_cache[username] = risk_analysis
        
        return risk_analysis
    
    def _is_likely_bot(self, fingerprint: Dict) -> bool:
        """Detect if fingerprint suggests bot activity"""
        bot_indicators = [
            not fingerprint.get('webgl') or fingerprint.get('webgl') == 'not_supported',
            not fingerprint.get('canvas') or fingerprint.get('canvas') == 'error',
            fingerprint.get('languages') == '',
            not fingerprint.get('plugins') or len(fingerprint.get('plugins', [])) == 0,
            fingerprint.get('hardwareConcurrency') == 'unknown',
            not fingerprint.get('timezone'),
            fingerprint.get('audioFingerprint') == 'not_supported'
        ]
        
        bot_score = sum(1 for indicator in bot_indicators if indicator)
        return bot_score >= 4
    
    # ===================================
    # Alert Generation Methods
    # ===================================
    
    async def alert_failed_login(self, username: str, ip: str, attempts: int, device_fingerprint: Dict = None):
        """Alert for failed login attempts"""
        severity = 'CRITICAL' if attempts >= 5 else 'HIGH' if attempts >= 3 else 'WARNING'
        
        alert = {
            'type': 'FAILED_LOGIN',
            'severity': severity,
            'title': '🚨 Failed Login Attempt',
            'message': f"User '{username}' failed login attempt #{attempts} from {ip}",
            'data': {
                'username': username,
                'ip': ip,
                'attempts': attempts,
                'is_brute_force': attempts >= 3,
                'device_fingerprint': device_fingerprint
            },
            'actions': ['Block IP', 'Lock Account', 'View Details'],
            'category': 'AUTHENTICATION'
        }
        
        await self.broadcast_to_admins(alert)
    
    async def alert_high_risk_login(self, username: str, risk_analysis: Dict):
        """Alert for high-risk login attempts"""
        alert = {
            'type': 'HIGH_RISK_LOGIN',
            'severity': risk_analysis['risk_level'],
            'title': '⚠️ High Risk Login Detected',
            'message': f"Suspicious login: {username} (Risk: {risk_analysis['risk_score']}/100)",
            'data': {
                'username': username,
                'risk_score': risk_analysis['risk_score'],
                'risk_factors': risk_analysis['risk_factors'],
                'is_new_device': risk_analysis['is_new_device'],
                'ip': risk_analysis['ip']
            },
            'actions': ['Monitor Session', 'Require 2FA', 'Force Logout'],
            'category': 'RISK_ANALYSIS'
        }
        
        await self.broadcast_to_admins(alert)
    
    async def alert_new_device(self, username: str, device_fingerprint: Dict, ip: str):
        """Alert for new device detection"""
        alert = {
            'type': 'NEW_DEVICE',
            'severity': 'MEDIUM',
            'title': '🆕 New Device Detected',
            'message': f"User '{username}' logged in from unknown device",
            'data': {
                'username': username,
                'ip': ip,
                'device_info': {
                    'platform': device_fingerprint.get('platform'),
                    'userAgent': device_fingerprint.get('userAgent', '')[:100] + '...',
                    'screen': device_fingerprint.get('screen'),
                    'timezone': device_fingerprint.get('timezone')
                }
            },
            'actions': ['Approve Device', 'Block Login', 'Send Verification'],
            'category': 'DEVICE_MANAGEMENT'
        }
        
        await self.broadcast_to_admins(alert)
    
    async def alert_account_lockout(self, username: str, level: int, reason: str = None):
        """Alert for account lockout"""
        alert = {
            'type': 'ACCOUNT_LOCKOUT',
            'severity': 'CRITICAL',
            'title': '🔒 Account Locked',
            'message': f"Account '{username}' locked at Level {level}",
            'data': {
                'username': username,
                'lockout_level': level,
                'reason': reason or 'Multiple failed attempts'
            },
            'actions': ['Unlock Account', 'Contact User', 'View History'],
            'category': 'ACCOUNT_MANAGEMENT'
        }
        
        await self.broadcast_to_admins(alert)
    
    async def alert_session_terminated(self, username: str, terminated_by: str, reason: str = None):
        """Alert for forced session termination"""
        alert = {
            'type': 'SESSION_TERMINATED',
            'severity': 'HIGH',
            'title': '⚡ Session Terminated',
            'message': f"Session for '{username}' terminated by {terminated_by}",
            'data': {
                'username': username,
                'terminated_by': terminated_by,
                'reason': reason or 'Administrative action'
            },
            'actions': ['View Details', 'Contact User'],
            'category': 'SESSION_MANAGEMENT'
        }
        
        await self.broadcast_to_admins(alert)
    
    # ===================================
    # Statistics & Reporting
    # ===================================
    
    def get_alert_statistics(self) -> Dict:
        """Get alert statistics"""
        total_alerts = len(self.alert_history)
        recent_alerts = [a for a in self.alert_history 
                        if datetime.fromisoformat(a['timestamp']) > datetime.now() - timedelta(hours=24)]
        
        return {
            'total_alerts': total_alerts,
            'alerts_24h': len(recent_alerts),
            'alert_types': dict(self.alert_stats),
            'connected_admins': len(self.connected_admins),
            'known_devices_count': sum(len(devices) for devices in self.known_devices.values()),
            'tracked_users': len(self.user_profiles)
        }
    
    def get_recent_alerts(self, limit: int = 50) -> List[Dict]:
        """Get recent alerts"""
        return list(self.alert_history)[-limit:]

# Global instance
security_notifier = SecurityNotificationManager()