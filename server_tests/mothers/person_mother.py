class JsonPersonMother:
    @staticmethod
    def adult_anna() -> dict:
        return {
            "name": "name",
            "surname1": "surname1",
            "surname2": "surname2",
            "email": "noreply@xamfra.net",
            "address": "address",
            "city": "city",
            "zip": 8019,
            "dni": "22233301K",
            "phone": "669423016",
            "is_studying": False,
            "is_working": True,
            "education_entity": None,
            "education_year": None,
            "career": "software engineer",
        }

    @staticmethod
    def child_mark() -> dict:
        return {
            "name": "name",
            "surname1": "surname1",
            "surname2": "surname2",
            "email": "noreply@xamfra.net",
            "address": "address",
            "city": "city",
            "zip": 8019,
            "dni": "22233301K",
            "phone": "669423016",
            "is_studying": True,
            "is_working": False,
            "education_entity": "escola pia sarrià",
            "education_year": "eso_4",
            "career": None
        }
