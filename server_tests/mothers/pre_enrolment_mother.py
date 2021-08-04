from server_tests.mothers.student_mother import StudentJsonMother


class PreEnrolmentMother:
    @staticmethod
    def adult_anna() -> dict:
        return {
            "body": StudentJsonMother.adult_anna(),
            "recaptcha": "sample-token"
        }

    @staticmethod
    def child_mark() -> dict:
        return {
            "body": StudentJsonMother.child_mark(),
            "recaptcha": "sample-token"
        }
