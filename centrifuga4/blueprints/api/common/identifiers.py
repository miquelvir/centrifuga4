import uuid
import logging as log

from centrifuga4.models import Person


def generate_new_id(db, model=Person, avoid=None):  # todo migrated to base model method
    if avoid is None:
        avoid = []

    while True:
        id_ = str(uuid.uuid4())
        exists = db.session.query(model.id).filter_by(id=id_).scalar() is not None
        if not exists and id_ not in avoid:
            return id_

        log.debug("generated a uuid4 identifier which collided with an existing id; retying now.")
