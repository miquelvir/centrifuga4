from centrifuga4 import db


class PeriodicDate(db.Model):
    __tablename__ = "periodic_date"

    id = db.Column(db.Integer,
                   primary_key=True)
    day_in_period = db.Column(db.Integer,
                              nullable=True)
    hour = db.Column(db.Integer,
                     nullable=True)
    minute = db.Column(db.Integer,
                       nullable=True)

    def __repr__(self):
        return '<Date | day: %s - hour: %s -  minute: %s>' \
               % (self.day_in_period, self.hour, self.minute)

