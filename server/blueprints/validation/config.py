from flask import Blueprint
from flask_restful import Api

from server.blueprints.validation.resources.validation import Validation

validation_blueprint = Blueprint("validation", __name__, template_folder="templates")

api = Api(validation_blueprint)

api.add_resource(Validation, "/<token>")
