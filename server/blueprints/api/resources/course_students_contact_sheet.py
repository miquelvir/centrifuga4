import csv
import io
from datetime import datetime

from flasgger import SwaggerView
from flask_restful import Resource

from server.auth_auth.action_need import PostPermission
from server.auth_auth.requires import Requires
from server.auth_auth.resource_need import StudentsPermission, CoursesPermission
from server.blueprints.api.errors import NotFound
from server.constants import SHORT_NAME
from server.file_utils.string_bytes_io import make_response_with_file
from server.models import Course


def write_students(students, spamwriter):
    emails = {}

    spamwriter.writerow(
        [
            "[student: és un estudiant / es un estudiante / is a student | guardian: és un contacte de l'estudiant superior / es un contacto del estudiante superior / is a guardian of the student above]",
            "[student|[relation]]",
            "està matriculat / está matriculado / is enrolled",
            "id",
            "nom / nombre / name",
            "primer cognom / primer apellido / first surname",
            "segon cognom / segundo apellido / second surname",
            "nom complet / nombre completo / full name",
            "estat matrícula / estado de la matrícula / enrolment status",
            "correu / correo / email",
            "telèfon / teléfono / phone",
            "adreça postal / dirección postal / physical address",
            "codi postal / código postal / postal code",
            "ciutat / ciudad / city",
            "estat d'origen / estado de origen / country of origin",
            "data de naixement / fecha de nacimiento / birth date",
            "edat / edad / age",
            "major d'edat / mayor de edad / overage",
            "menor d'edat / menor de edad / underage",
            "preu per trimestre / precio por trimestre / price per term",
            "gènere / género / gender",
            "acord d'ús d'imatge / acuerdo de uso de imagen / image agreement",
            "comentaris pagament / comentarios pago / payment comments",
            "mètode de pagament per defecte / método de pago por defecto / default payment method",
            "dni / dni / id",
            "comentaris / comentarios / comments",
            "estudia / estudia / studies",
            "entitat d'educació / entidad de educación / education entity",
            "curs / curso / education year",
            "treballa / trabaja / works",
            "professió / profesión / career",
            "anys a Xamfrà / años en Xamfrà / years in Xamfrà",
            "# pagaments efectuats / # pagos efectuados / # payments",
            "ids dels pagaments / ids de los pagos / payment ids",
            "quantitats pagades / cantidades pagadas / paid quantities",
            "total pagat / total pagado / total paid",
            "total esperat / total esperado / expected total",
            "ids de los cursos / ids dels cursos / courses' ids",
            "noms dels cursos / nombres de los cursos / courses' names",
            "correu per notificacions / correo para notificaciones / notifications' email",
        ]
    )
    for student in students:
        if student.enrolment_status not in emails:
            emails[student.enrolment_status] = {
                "official_contact_emails": set(),
                "guardian_emails": set(),
                "student_emails": set(),
            }

        if student.email:
            emails[student.enrolment_status]["student_emails"].add(student.email)

        for email in student.official_notification_emails:
            emails[student.enrolment_status]["official_contact_emails"].add(email)

        spamwriter.writerow(
            [
                "student",
                "student",
                student.is_enrolled,
                student.id,
                student.name,
                student.surname1,
                student.surname2,
                student.full_name,
                student.enrolment_status,
                student.email,
                student.phone,
                student.address,
                student.zip,
                student.city,
                student.country_of_origin,
                student.birth_date,
                student.age,
                student.is_overage,
                student.is_underage,
                student.price_term,
                student.gender,
                student.image_agreement,
                student.payment_comments,
                student.default_payment_method,
                student.dni,
                student.other_comments,
                student.is_studying,
                student.education_entity,
                student.education_year,
                student.is_working,
                student.career,
                student.years_in_xamfra,
                len(student.payments),
                ", ".join([g.id for g in student.payments]),
                ", ".join([p.user_representation() for p in student.payments]),
                sum([p.quantity for p in student.payments]),
                student.annual_price,
                ", ".join([c.id for c in student.courses]),
                ", ".join([c.user_representation() for c in student.courses]),
                ", ".join(student.official_notification_emails),
            ]
        )

        for guardian in student.guardians:
            if guardian.email:
                emails[student.enrolment_status]["guardian_emails"].add(guardian.email)

            spamwriter.writerow(
                [
                    "guardian",
                    guardian.relation,
                    student.is_enrolled,
                    guardian.id,
                    guardian.name,
                    guardian.surname1,
                    guardian.surname2,
                    guardian.full_name,
                    None,
                    guardian.email,
                    guardian.phone,
                    guardian.address,
                    guardian.zip,
                    guardian.city,
                    guardian.country_of_origin,
                    None,
                    None,
                    None,
                    None,
                    None,
                    None,
                    None,
                    None,
                    None,
                    guardian.dni,
                    None,
                    guardian.is_studying,
                    guardian.education_entity,
                    guardian.education_year,
                    guardian.is_working,
                    guardian.career,
                    None,
                    None,
                ]
            )

    spamwriter.writerow([])
    spamwriter.writerow([])

    emails["all"] = {
        "official_contact_emails": set(),
        "guardian_emails": set(),
        "student_emails": set(),
    }

    for status in emails:
        emails["all"]["official_contact_emails"] = emails["all"][
            "official_contact_emails"
        ].union(emails[status]["official_contact_emails"])
        emails["all"]["guardian_emails"] = emails["all"]["guardian_emails"].union(
            emails[status]["guardian_emails"]
        )
        emails["all"]["student_emails"] = emails["all"]["student_emails"].union(
            emails[status]["student_emails"]
        )

    for status in emails:
        student_emails = emails[status]["student_emails"]
        official_contact_emails = emails[status]["official_contact_emails"]
        guardian_emails = emails[status]["guardian_emails"]
        all_emails = student_emails.union(guardian_emails)

        spamwriter.writerow(["email lists [%s]" % status])
        spamwriter.writerow(["student emails >", ", ".join(student_emails)])
        spamwriter.writerow(
            ["the previous email list has all personal emails from the students"]
        )
        spamwriter.writerow(
            ["official contact emails >", ", ".join(official_contact_emails)]
        )
        spamwriter.writerow(
            [
                "the previous email list has all emails which should be contacted in official communications (that is: the student if +18; if underage, their guardians if available, otherwise the personal email from the student)"
            ]
        )
        spamwriter.writerow(["guardians emails >", ", ".join(guardian_emails)])
        spamwriter.writerow(
            ["the previous email list has all emails from the guardians"]
        )
        spamwriter.writerow(["all emails >", ", ".join(all_emails)])
        spamwriter.writerow(["the previous email list has all emails available"])
        spamwriter.writerow([])


class CourseContactSheet(Resource, SwaggerView):
    @Requires(PostPermission, CoursesPermission, StudentsPermission)
    def post(self, id_):
        query = Course.query.filter(Course.id == id_)
        course: Course = query.first()

        if not course:
            raise NotFound("resource with the given id not found", requestedId=id_)

        filename = "%s-export-contacts-%s-%s.csv" % (
            SHORT_NAME,
            course.id,
            datetime.now().strftime("%Y%m%dT%H%M%S"),
        )

        with io.StringIO() as proxy:

            spamwriter = csv.writer(proxy)
            spamwriter.writerow(["id >", course.id])
            spamwriter.writerow(["nom / nombre / name >", course.name])
            spamwriter.writerow(
                ["descripció / descripción / description >", course.description]
            )
            spamwriter.writerow([])
            spamwriter.writerow([])
            spamwriter.writerow(["students"])
            write_students(course.students, spamwriter)

            return make_response_with_file(
                proxy, filename, "text/csv", encoding="utf-8-sig"
            )
