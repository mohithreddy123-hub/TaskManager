#!/usr/bin/env bash
# Render Build Script for TrackNest Django Backend
# Render runs this script automatically on every deploy.
set -o errexit   # Exit immediately if any command fails

echo "==> Installing Python dependencies..."
pip install -r requirements.txt

echo "==> Collecting static files..."
python manage.py collectstatic --noinput

echo "==> Applying database migrations..."
python manage.py migrate --noinput

echo "==> Build complete!"
