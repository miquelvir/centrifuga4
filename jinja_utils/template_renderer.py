from jinja2 import Environment, FileSystemLoader, select_autoescape, StrictUndefined, UndefinedError, TemplateError
import email_queue.config as config
import logging as log


class TemplateRenderer:
    """ creates a context to render jinja2 templates to strings """

    def __init__(self, templates_folder: str = config.TEMPLATES_FOLDER):
        """
        create a jinja2 envirnoment
        initialise the renderer creating a jinja2 environment
        in the given templates folder (if not given, the default one)
        using an environment enables template inheritance between them
        """
        self._env = Environment(
            loader=FileSystemLoader(templates_folder),  # from templates directory path
            autoescape=select_autoescape(['html', 'xml']),  # recommended by DOC since it might be automatic soon
            undefined=StrictUndefined  # don't allow undeclared variables
        )

        log.debug("environment created at '%s'" % templates_folder)

    def render_template(self, template_name: str, **kwargs) -> str:
        """ renders a template in the templates folder given its name and variables to use for rendering """

        try:
            template = self._env.get_template(template_name)
            rendered = template.render(**kwargs)
        except TemplateError:
            log.exception("can't render template with name '%s'" % template_name)
            raise
        else:
            log.debug("rendered template '%s' using env" % template_name)
            return rendered
