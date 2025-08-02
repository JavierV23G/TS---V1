# ===================================
# 🧠 INTELLIGENT AUTHENTICATION SYSTEM
# Risk analysis + Device fingerprinting + Smart notifications
# ===================================

import asyncio
from datetime import datetime
from typing import Dict, Optional, Tuple
from fastapi import Request
import logging

# Import existing security manager
from .security_manager import BankLevelSecurityManager

# Import notification system
try:
    from notifications.security_alerts import security_notifier
    NOTIFICATIONS_ENABLED = True
except ImportError:
    NOTIFICATIONS_ENABLED = False
    print("⚠️ [INTELLIGENT-AUTH] Notification system not available")

logger = logging.getLogger(__name__)

class IntelligentAuthenticationSystem:
    def __init__(self, security_manager: BankLevelSecurityManager):
        self.security_manager = security_manager
        
        # Risk thresholds
        self.RISK_THRESHOLDS = {
            'LOW': 25,
            'MEDIUM': 50, 
            'HIGH': 80,
            'CRITICAL': 90
        }
        
    async def analyze_login_attempt(self, request: Request, username: str, password: str, 
                                  device_fingerprint: Dict = None) -> Dict:
        """
        🧠 INTELLIGENT LOGIN ANALYSIS
        
        Performs comprehensive risk analysis before authentication
        Returns: {
            'allowed': bool,
            'action': str,  # 'ALLOW', 'REQUIRE_2FA', 'BLOCK', 'MONITOR'
            'risk_analysis': dict,
            'response': dict
        }
        """
        ip = self.security_manager._get_real_ip(request)
        
        print(f"[INTELLIGENT-AUTH] 🧠 Analyzing login: {username} from {ip}")
        
        # 1. Check basic security (existing system)
        is_allowed, block_info = await self.security_manager.check_security(request, username)
        
        if not is_allowed:
            # User is blocked - no further analysis needed
            return {
                'allowed': False,
                'action': 'BLOCK',
                'risk_analysis': {'risk_level': 'BLOCKED', 'risk_score': 100},
                'response': block_info
            }
        
        # 2. Perform risk analysis with device fingerprinting
        risk_analysis = None
        if NOTIFICATIONS_ENABLED and device_fingerprint:
            try:
                risk_analysis = await security_notifier.analyze_login_risk(
                    username=username,
                    device_fingerprint=device_fingerprint,
                    ip=ip
                )
                print(f"[INTELLIGENT-AUTH] Risk analysis: {risk_analysis['risk_score']}/100 ({risk_analysis['risk_level']})")
            except Exception as e:
                print(f"[INTELLIGENT-AUTH] Risk analysis error: {e}")
                risk_analysis = {'risk_score': 0, 'risk_level': 'LOW', 'risk_factors': []}
        
        # 3. Determine action based on risk
        action = self._determine_action(risk_analysis)
        
        # 4. Send notifications if needed
        if NOTIFICATIONS_ENABLED and risk_analysis:
            await self._send_risk_notifications(username, risk_analysis, action)
        
        return {
            'allowed': True,
            'action': action,
            'risk_analysis': risk_analysis,
            'response': None
        }
    
    def _determine_action(self, risk_analysis: Optional[Dict]) -> str:
        """Determine what action to take based on risk analysis"""
        if not risk_analysis:
            return 'ALLOW'
        
        risk_score = risk_analysis.get('risk_score', 0)
        risk_factors = risk_analysis.get('risk_factors', [])
        
        # Check for critical factors
        critical_factors = [f for f in risk_factors if f.get('severity') == 'CRITICAL']
        if critical_factors:
            return 'BLOCK'
        
        # Risk-based decisions
        if risk_score >= self.RISK_THRESHOLDS['CRITICAL']:
            return 'BLOCK'
        elif risk_score >= self.RISK_THRESHOLDS['HIGH']:
            return 'REQUIRE_2FA'
        elif risk_score >= self.RISK_THRESHOLDS['MEDIUM']:
            return 'MONITOR'
        else:
            return 'ALLOW'
    
    async def _send_risk_notifications(self, username: str, risk_analysis: Dict, action: str):
        """Send appropriate notifications based on risk analysis"""
        try:
            risk_level = risk_analysis.get('risk_level', 'LOW')
            
            # Send high-risk login alert
            if risk_level in ['HIGH', 'CRITICAL']:
                await security_notifier.alert_high_risk_login(username, risk_analysis)
            
            # Send new device alert
            if risk_analysis.get('is_new_device'):
                device_fingerprint = risk_analysis.get('device_fingerprint', {})
                await security_notifier.alert_new_device(
                    username=username,
                    device_fingerprint=device_fingerprint,
                    ip=risk_analysis.get('ip', 'unknown')
                )
                
        except Exception as e:
            print(f"[INTELLIGENT-AUTH] Notification error: {e}")
    
    async def verify_credentials_intelligent(self, request: Request, username: str, password: str,
                                           device_fingerprint: Dict = None) -> Tuple[bool, Optional[Dict]]:
        """
        🔐 INTELLIGENT CREDENTIAL VERIFICATION
        
        Enhanced version of credential verification with risk analysis
        """
        # 1. Perform intelligent analysis
        analysis = await self.analyze_login_attempt(request, username, password, device_fingerprint)
        
        if not analysis['allowed']:
            # User blocked by security system
            return False, analysis['response']
        
        # 2. Verify actual credentials (you'll need to implement this based on your auth system)
        # For now, we'll assume credentials are valid if we get here
        # In real implementation, check password hash here
        
        action = analysis['action']
        risk_analysis = analysis['risk_analysis']
        
        # 3. Handle different actions
        if action == 'BLOCK':
            return False, {
                "error": "High Risk Login Blocked",
                "message": f"Login blocked due to high risk score: {risk_analysis['risk_score']}/100",
                "risk_factors": [f['description'] for f in risk_analysis.get('risk_factors', [])],
                "contact_admin": True
            }
        
        elif action == 'REQUIRE_2FA':
            return False, {
                "error": "Two-Factor Authentication Required",
                "message": "Please complete two-factor authentication to continue",
                "require_2fa": True,
                "risk_score": risk_analysis['risk_score'],
                "session_token": "temp_2fa_token_here"  # Generate temp token for 2FA flow
            }
        
        elif action == 'MONITOR':
            # Allow login but with enhanced monitoring
            print(f"[INTELLIGENT-AUTH] ⚠️ Login allowed with monitoring for {username}")
            return True, {
                "success": True,
                "message": "Login successful - session being monitored",
                "monitoring": True,
                "risk_score": risk_analysis['risk_score']
            }
        
        else:  # ALLOW
            print(f"[INTELLIGENT-AUTH] ✅ Normal login for {username}")
            return True, {
                "success": True,
                "message": "Login successful",
                "risk_score": risk_analysis.get('risk_score', 0) if risk_analysis else 0
            }
    
    async def handle_successful_login(self, request: Request, username: str, 
                                    device_fingerprint: Dict = None):
        """Handle post-login actions"""
        # Record successful login in existing system
        self.security_manager.record_successful_login(request, username)
        
        # Store device fingerprint for future analysis
        if NOTIFICATIONS_ENABLED and device_fingerprint:
            try:
                security_notifier.store_device_fingerprint(username, device_fingerprint)
                print(f"[INTELLIGENT-AUTH] Device fingerprint stored for {username}")
            except Exception as e:
                print(f"[INTELLIGENT-AUTH] Error storing fingerprint: {e}")
    
    async def handle_failed_login(self, request: Request, username: str,
                                device_fingerprint: Dict = None):
        """Handle failed login attempts"""
        # Record failed attempt in existing system
        self.security_manager.record_failed_attempt(request, username)
        
        # Additional intelligent analysis is already handled in record_failed_attempt
        print(f"[INTELLIGENT-AUTH] Failed login recorded for {username}")

# Factory function to create intelligent auth system
def create_intelligent_auth_system(security_manager: BankLevelSecurityManager) -> IntelligentAuthenticationSystem:
    """Create intelligent authentication system"""
    return IntelligentAuthenticationSystem(security_manager)