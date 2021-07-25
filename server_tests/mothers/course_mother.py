from server.models import Course


class CourseJsonMother:
    @staticmethod
    def three_ids():
        return [
            "1752828d-bda9-485f-88c9-74da6f203bae",
            "2752828d-bda9-485f-88c9-74da6f203bae",
            "3752828d-bda9-485f-88c9-74da6f203bae"
        ]


class CourseMother:
    @staticmethod
    def simple(id_="1", name="name", description="description", is_published=True):
        return Course(id=id_, name=name, description=description, is_published=is_published)

    @classmethod
    def not_published(cls, *args, **kwargs):
        simple = cls.simple(*args, **kwargs)
        simple.is_published = False
        return simple

    @classmethod
    def published(cls, *args, **kwargs):
        return cls.simple(*args, **kwargs)