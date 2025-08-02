# ===================================
# 🌐 WEBSOCKET SECURITY ALERTS SERVER
# Real-time notifications for security events
# ===================================

import asyncio
import json
import logging
from typing import Set
import websockets
from websockets.exceptions import ConnectionClosedError, ConnectionClosedOK
from .security_alerts import security_notifier

logger = logging.getLogger(__name__)

class SecurityWebSocketServer:
    def __init__(self, host="localhost", port=8001):
        self.host = host
        self.port = port
        self.server = None
        
    async def handle_connection(self, websocket, path):
        """Handle individual WebSocket connections"""
        try:
            # Wait for authentication message
            auth_message = await asyncio.wait_for(websocket.recv(), timeout=10.0)
            auth_data = json.loads(auth_message)
            
            # Validate authentication
            if not self.validate_auth(auth_data):
                await websocket.send(json.dumps({
                    "type": "ERROR",
                    "message": "Authentication failed"
                }))
                await websocket.close()
                return
            
            # Register admin connection
            user_info = {
                'username': auth_data.get('username'),
                'role': auth_data.get('role'),
                'ip': websocket.remote_address[0] if websocket.remote_address else 'unknown'
            }
            
            await security_notifier.register_admin(websocket, user_info)
            
            # Send confirmation
            await websocket.send(json.dumps({
                "type": "CONNECTED",
                "message": "Successfully connected to security alerts",
                "username": user_info['username']
            }))
            
            # Keep connection alive and handle messages
            await self.handle_messages(websocket, user_info)
            
        except asyncio.TimeoutError:
            logger.warning("[WEBSOCKET] Authentication timeout")
            await websocket.close()
        except json.JSONDecodeError:
            logger.error("[WEBSOCKET] Invalid JSON in auth message")
            await websocket.close()
        except ConnectionClosedError:
            logger.info("[WEBSOCKET] Connection closed by client")
        except Exception as e:
            logger.error(f"[WEBSOCKET] Connection error: {e}")
        finally:
            # Unregister connection
            await security_notifier.unregister_admin(websocket)
    
    def validate_auth(self, auth_data):
        """Validate authentication data"""
        # Basic validation - in production, verify JWT token
        required_fields = ['username', 'role', 'token']
        
        for field in required_fields:
            if field not in auth_data:
                return False
        
        # Check if user has admin/developer privileges
        allowed_roles = ['developer', 'admin', 'Administrator']
        if auth_data.get('role') not in allowed_roles:
            return False
        
        # TODO: Verify JWT token in production
        # For now, just check if token exists
        return auth_data.get('token') is not None
    
    async def handle_messages(self, websocket, user_info):
        """Handle incoming messages from client"""
        try:
            async for message in websocket:
                try:
                    data = json.loads(message)
                    await self.process_client_message(websocket, data, user_info)
                except json.JSONDecodeError:
                    await websocket.send(json.dumps({
                        "type": "ERROR",
                        "message": "Invalid JSON format"
                    }))
                except Exception as e:
                    logger.error(f"[WEBSOCKET] Message processing error: {e}")
                    
        except ConnectionClosedOK:
            logger.info(f"[WEBSOCKET] Connection closed normally: {user_info.get('username')}")
        except ConnectionClosedError:
            logger.info(f"[WEBSOCKET] Connection closed unexpectedly: {user_info.get('username')}")
    
    async def process_client_message(self, websocket, data, user_info):
        """Process messages from client"""
        message_type = data.get('type')
        
        if message_type == 'PING':
            # Respond to ping with pong
            await websocket.send(json.dumps({
                "type": "PONG",
                "timestamp": data.get('timestamp')
            }))
            
        elif message_type == 'GET_RECENT_ALERTS':
            # Send recent alerts
            recent_alerts = security_notifier.get_recent_alerts(
                limit=data.get('limit', 10)
            )
            await websocket.send(json.dumps({
                "type": "RECENT_ALERTS",
                "alerts": recent_alerts
            }))
            
        elif message_type == 'GET_STATISTICS':
            # Send alert statistics
            stats = security_notifier.get_alert_statistics()
            await websocket.send(json.dumps({
                "type": "STATISTICS",
                "data": stats
            }))
            
        else:
            await websocket.send(json.dumps({
                "type": "ERROR",
                "message": f"Unknown message type: {message_type}"
            }))
    
    async def start_server(self):
        """Start the WebSocket server"""
        try:
            # Start cleanup task
            await security_notifier.start_cleanup_task()
            
            # Start WebSocket server
            self.server = await websockets.serve(
                self.handle_connection,
                self.host,
                self.port,
                ping_interval=30,
                ping_timeout=10,
                close_timeout=10
            )
            
            logger.info(f"🚨 [WEBSOCKET] Security alerts server started on ws://{self.host}:{self.port}")
            print(f"🚨 [WEBSOCKET] Security alerts server started on ws://{self.host}:{self.port}")
            
            # Keep server running
            await self.server.wait_closed()
            
        except Exception as e:
            logger.error(f"[WEBSOCKET] Server start error: {e}")
            print(f"❌ [WEBSOCKET] Server start error: {e}")
    
    async def stop_server(self):
        """Stop the WebSocket server"""
        if self.server:
            self.server.close()
            await self.server.wait_closed()
            logger.info("[WEBSOCKET] Server stopped")

# Global server instance
websocket_server = SecurityWebSocketServer()

# Convenience functions
async def start_security_websocket_server():
    """Start the security WebSocket server"""
    await websocket_server.start_server()

async def stop_security_websocket_server():
    """Stop the security WebSocket server"""
    await websocket_server.stop_server()