"""
ML Model Server - Entry Point for Render Deployment
Loads and runs the Flask ML model API
"""

import sys
import os

# Add scripts directory to Python path
script_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'scripts')
sys.path.insert(0, script_dir)

# Import Flask app from backend integration
from scripts.backend_integration import app

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    
    print(f"""
    ╔════════════════════════════════════════╗
    ║   ML Model API Starting...             ║
    ║   Port: {port}                            ║
    ║   Environment: Production              ║
    ╚════════════════════════════════════════╝
    """)
    
    app.run(host='0.0.0.0', port=port, debug=False)
