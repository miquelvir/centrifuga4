from blinker import Namespace

signals = Namespace()

student_pre_enrolled = signals.signal('student_pre_enrolled')


