from app import create_app
import os

app = create_app()

if __name__ == '__main__':
    # Port 5000 is taken by macOS AirPlay Receiver (ControlCenter), so the
    # local default is 5010. The Vite dev server proxies:
    #   /fraud-api  ->  http://localhost:5010/api
    port = int(os.environ.get('PORT', 5010))
    app.run(host='0.0.0.0', port=port, debug=True)