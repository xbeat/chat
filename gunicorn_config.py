import os

bind = "0.0.0.0:" + os.getenv("PORT", "5000")
workers = 1  # Per Socket.IO è meglio usare un solo worker
worker_class = "gevent"  # Cambiato da eventlet a gevent
timeout = 120
keepalive = 5