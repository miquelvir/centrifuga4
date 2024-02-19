from flask import current_app, request
from flask_login import current_user
import requests


def get_ip():
    try:
        if request.environ.get("HTTP_X_FORWARDED_FOR") is None:
            return request.environ["REMOTE_ADDR"]
        else:
            return request.environ["HTTP_X_FORWARDED_FOR"]  # if behind a proxy
    except:
        return "?"


def try_get_email():
    try:
        return current_user.email
    except:
        return "?"


def audit_log(level: str, message: str):
    try:
        emoji = "⚠️" if level == "warn" else "🚨" if level == "alert" else "✅"
        dest = current_app.config["DISCORD_LOGIN_NOTIFICATIONS_ALERT"] if level == "alert" else current_app.config["DISCORD_LOGIN_NOTIFICATIONS"]
        requests.post(
            dest, 
            json={
            "content": f"{emoji} [email: {try_get_email()}] [ip: {get_ip()}] {message}"
        })
    except:
        print(f"Failed to post audit log")


def audit_log_info(message: str):
    return audit_log("info", message)


def audit_log_warn(message: str):
    return audit_log("warn", message)


def audit_log_alert(message: str):
    return audit_log("alert", message)
