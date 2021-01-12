import os
from os.path import join, dirname

from dotenv import load_dotenv

load_dotenv(join(dirname(__file__), '.env'))

import redis
from rq import Worker, Queue, Connection

listen = ['default']

redis_url = os.getenv('REDIS_URL', os.getenv('REDIS_URL'))
print(os.getenv('SECRET'))
conn = redis.from_url(redis_url)

if __name__ == '__main__':
    print(redis_url)
    print("here")
    with Connection(conn):
        print("with conn")

        worker = Worker(list(map(Queue, listen)))
        worker.work()
