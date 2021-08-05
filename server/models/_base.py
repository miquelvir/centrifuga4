import uuid

from sqlalchemy.orm.attributes import InstrumentedAttribute
from sqlalchemy.ext.hybrid import hybrid_property
from server import db
import logging as log


class MyBase(db.Model):
    __abstract__ = True

    id: str  # common interface, all of our models must have a field id

    @classmethod
    def get_field(cls, item):
        field = cls.__dict__[item]

        if not isinstance(field, (InstrumentedAttribute, hybrid_property)):
            raise AttributeError("protected field '%s' can't be accessed" % item)

        return field

    @classmethod
    def generate_new_id(cls, avoid=None):
        return str(
            uuid.uuid4()
        )  # to avoid coupling to db since probability of collision is negligible

        if avoid is None:
            avoid = []

        """
        the probability of a uuid4 collision is of 1/E30 (extremely low)
        we check multiple times just in case, so that the program is fail proof
        since the code is readable and easy

        we could consider not checking if it supposed a noticeable overhead
        """
        attempts = 0
        while attempts < 10:
            id_ = str(uuid.uuid4())
            exists = (
                db.session.query(cls.id).filter(cls.id == id_).scalar() is not None
            )  # todo could actually collide with super
            if not exists and id_ not in avoid:
                return id_

            attempts += 1
            log.debug(
                "generated a uuid4 identifier which collided with an existing id; retying now."
            )

        raise ValueError("multiple collisions in a row when creating uuids")
