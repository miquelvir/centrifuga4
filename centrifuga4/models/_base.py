import uuid

from sqlalchemy.orm.attributes import InstrumentedAttribute
from sqlalchemy.ext.hybrid import hybrid_property
from centrifuga4 import db
import logging as log


class MyBase(db.Model):
    __abstract__ = True

    id: str

    @classmethod
    def get_field(cls, item):
        field = cls.__dict__[item]

        if not isinstance(field, (InstrumentedAttribute, hybrid_property)):
            raise KeyError("protected field '%s' can't be accessed" % item)

        return field

    @classmethod
    def generate_new_id(cls, avoid=None):
        if avoid is None:
            avoid = []

        """
        the probability of a uuid4 collision is of 1/E30 (extremely low)
        we check multiple times just in case, so that the program is fail proof
        since the code is readable and easy
        
        we could consider not checking if it supposed a noticeable overhead
        """
        attempts = 0
        while True:
            id_ = str(uuid.uuid4())
            exists = db.session.query(cls.id).filter_by(id=id_).scalar() is not None
            if not exists and id_ not in avoid:
                return id_

            attempts += 1
            log.debug("generated a uuid4 identifier which collided with an existing id; retying now.")

            if attempts > 10:
                raise ValueError("multiple collisions in a row when creating uuids")
