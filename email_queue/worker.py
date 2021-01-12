import os
from os.path import join, dirname

from dotenv import load_dotenv

load_dotenv(join(dirname(__file__), '.env'))

import redis
from rq import Worker, Queue, Connection

listen = ['default']

redis_url = os.getenv('REDISTOGO_URL', 'redis://127.0.0.1:6379')
conn = redis.from_url(redis_url)

if __name__ == '__main__':
    with Connection(conn):
        worker = Worker(list(map(Queue, listen)))
        worker.work()
