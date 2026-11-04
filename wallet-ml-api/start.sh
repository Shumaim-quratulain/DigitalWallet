#!/bin/bash

# Run Flask backend on port 5000 (internal use only)
gunicorn -w 4 -b 0.0.0.0:5000 wsgi:app &

# Run Streamlit frontend on the exposed $PORT
streamlit run app/frontend/streamlit_app.py --server.port $PORT --server.address 0.0.0.0