from dependency_injector import containers, providers

from server.blueprints.pre_enrolment.services.pre_enrolment_service import PreEnrolmentService
from server.recaptcha_service import RecaptchaService


class Container(containers.DeclarativeContainer):
    recaptcha_service = providers.Singleton(RecaptchaService)
    pre_enrolment_service = providers.Singleton(PreEnrolmentService)
