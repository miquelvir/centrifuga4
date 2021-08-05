OPENAPI_CONFIG = {
    "headers": [],
    "openapi": "3.0.2",
    "openapi_version": "3.0.2",
    "components": {
        "securitySchemes": {},
    },
    "servers": [
        {
            "url": "https://centrifuga4.herokuapp.com",
            "description": "Production server",
        },
        {"url": "https://localhost:4999", "description": "Local development server"},
    ],
    "title": "centrífuga4 API",
    "version": "4.1.0",
    "termsOfService": "",
    "contact": {"name": "API support", "email": "xamfra@xamfra.net", "url": ""},
}


FLASGGER_CONFIG = {
    **OPENAPI_CONFIG,
    "static_url_path": "/docs/static",
    "swagger_ui": True,
    "specs_route": "/docs/swagger",
    "description": "This is the Biodiversity Metrics API",
    "specs": [
        {
            "endpoint": "swagger",
            "route": "/characteristics/swagger.json",
            "rule_filter": lambda rule: True,  # all in
            "model_filter": lambda tag: True,  # all in
        }
    ],
}
