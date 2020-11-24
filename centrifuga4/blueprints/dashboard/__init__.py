# expose api blueprint
from .config import dashboard

# load all the api (does not expose)
from . import *

__version__ = '0.0.1'
