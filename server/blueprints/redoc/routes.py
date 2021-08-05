from flask import Blueprint, render_template

redoc = Blueprint("redoc", __name__, template_folder="./templates")


@redoc.route("/redoc")
def re_doc():
    """ returns the redoc web ui """
    return render_template("redoc.html")
