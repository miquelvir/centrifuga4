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
        print(item, cls.__dict__)
        field = cls.__dict__[item]
        print(field)

        if not isinstance(field, (InstrumentedAttribute, hybrid_property)):
            raise KeyError("protected field '%s' can't be accessed" % item)

        return field

    @classmethod
    def generate_new_id(cls, avoid=None):  # todo migrated to base model method
        if avoid is None:
            avoid = []

        while True:  # todo needed?
            id_ = str(uuid.uuid4())
            exists = db.session.query(cls.id).filter_by(id=id_).scalar() is not None
            if not exists and id_ not in avoid:
                return id_

            log.debug("generated a uuid4 identifier which collided with an existing id; retying now.")
