from blinker import Namespace

signals = Namespace()

student_pre_enrolled = signals.signal('student_pre_enrolled')
user_password_reset_request = signals.signal('user_password_reset_request')
user_password_changed = signals.signal('user_password_reset_redeem')
