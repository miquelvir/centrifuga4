from dependency_injector import containers, providers

from server.blueprints.password_reset.services.password_reset_service import (
    PasswordResetService,
)
from server.blueprints.pre_enrolment.services.pre_enrolment_service import (
    PreEnrolmentService,
)
from server.blueprints.user_invites.services.user_invites_service import (
    UserInvitesService
)

from server.services.jwt_service import JwtService
from server.services.recaptcha_service import RecaptchaService


class Container(containers.DeclarativeContainer):  # todo can we migrate to not using this and just use patch in the mock library?
    recaptcha_service = providers.Singleton(RecaptchaService)
    jwt_service = providers.Factory(JwtService)

    pre_enrolment_service = providers.Singleton(PreEnrolmentService)
    password_reset_service = providers.Factory(
        PasswordResetService, jwt_service=jwt_service
    )
    user_invites_service = providers.Factory(
        UserInvitesService, jwt_service=jwt_service
    )
