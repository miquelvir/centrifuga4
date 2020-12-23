from sqlalchemy.orm.attributes import InstrumentedAttribute
from sqlalchemy.ext.hybrid import hybrid_property
from centrifuga4 import db


class MyBase(db.Model):
    __abstract__ = True

    @classmethod
    def get_field(cls, item):
        print(item, cls.__dict__)
        field = cls.__dict__[item]
        print(field)

        if not isinstance(field, (InstrumentedAttribute, hybrid_property)):
            raise KeyError("protected field '%s' can't be accessed" % item)

        return field
