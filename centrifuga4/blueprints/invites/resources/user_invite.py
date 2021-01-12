import jwt
from flask import request, current_app
from flask_restful import Resource, abort

from centrifuga4.auth_auth.action_need import InvitePermission
from centrifuga4.auth_auth.requires import Requires
from centrifuga4.auth_auth.resource_need import UsersPermission
from centrifuga4.models import User
from email_queue.emails.invite_email import my_job
from centrifuga4 import q
from email_queue.url_utils import merge_url_query_params


def generate_signup_link(_token, _email, frontend_url=None):
    return merge_url_query_params(
        "%s/signup" % (frontend_url if frontend_url else current_app.config["FRONTEND_SERVER_URL"]),
        {"token": _token, "email": _email, "lan": "cat"}), \
           merge_url_query_params(
        "%s/signup" % (frontend_url if frontend_url else current_app.config["FRONTEND_SERVER_URL"]),
        {"token": _token, "email": _email, "lan": "eng"})


class UserInviteCollectionRes(Resource):

    @Requires({InvitePermission, UsersPermission})
    def post(self):
        try:
            user_email = request.json["userEmail"].lower()
        except KeyError:
            abort(400)

        try:
            needs = request.json["needs"]
        except KeyError:
            abort(400)

        clean_needs = []
        for need in needs:
            clean_needs.append(need)  # todo check is a valid legitimate need

        if User.query.filter_by(username=user_email).count() > 0:
            abort(400)

        token = jwt.encode({'userEmail': user_email,
                           "needs": clean_needs},
                   current_app.config["INVITES_SECRET"],
                   algorithm='HS256')

        job = q.enqueue_call(
            func=my_job, args=(*generate_signup_link(token, user_email), user_email, ), result_ttl=5000
        )

        return job.get_id()


if __name__ == "__main__":
    user_email = input("user_email: ")
    clean_needs = [{"type": "res", "name": "students"}, {"type": "action", "name": "get"}]
    # simulate one
    token = jwt.encode({'userEmail': user_email,
                        "needs": clean_needs},
                       "super-secret",
                       algorithm='HS256')

    job = q.enqueue_call(
        func=my_job, args=(*generate_signup_link(token, user_email, frontend_url="https://127.0.0.1:4999"), user_email,), result_ttl=5000
    )

    print(job.get_id())
