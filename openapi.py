import json
from apispec.ext.marshmallow import MarshmallowPlugin
from apispec_webframeworks.flask import FlaskPlugin
from apispec import APISpec
import centrifuga4.schemas as schemas
from centrifuga4.blueprints.api.resources.students import StudentsRes
from centrifuga4 import init_app

# Create spec
spec = APISpec(
    title='My Awesome API',
    version='1.0.42',
    info=dict(
        description='You know, for devs'
    ),
    plugins=[
        FlaskPlugin(), MarshmallowPlugin()
    ],
    openapi_version="3.0.2"
)

spec.components.schema("User", schema=schemas.UserSchema)
spec.components.schema("Teacher", schema=schemas.TeacherSchema)
# We need a working context for apispec introspection.
app = init_app()


with app.test_request_context():
    spec.path(view=StudentsRes.patch)

# We're good to go! Save this to a file for now.
with open('swagger.json', 'w') as f:
    json.dump(spec.to_dict(), f)
