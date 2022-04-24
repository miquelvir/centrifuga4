import pyotp
import hmac

from cryptography.fernet import Fernet
from flask import current_app


class TotpService:
    @staticmethod
    def generate_totp(totp_secret) -> str:
        """ :returns the current TOTP """
        return pyotp.TOTP(totp_secret).now()

    def is_valid(self, totp_secret: str, totp: str) -> bool:
        return hmac.compare_digest(self.generate_totp(totp_secret), totp)

    @staticmethod
    def generate_totp_secret() -> str:
        return pyotp.random_base32()

    @staticmethod
    def _encryption_key(encryption_key: str = None):
        return (
            current_app.config["TOTP_ENCRYPTION_KEY"]
            if encryption_key is None
            else encryption_key
        )

    @staticmethod
    def encrypt_totp_secret(totp_secret, encryption_key: str = None) -> str:
        return (
            Fernet(bytes(TotpService._encryption_key(encryption_key), "utf-8"))
            .encrypt(bytes(totp_secret, "utf-8"))
            .decode("utf-8")
        )

    @staticmethod
    def decrypt_totp_secret(encrypted_secret, encryption_key: str = None) -> str:
        return (
            Fernet(bytes(TotpService._encryption_key(encryption_key), "utf-8"))
            .decrypt(bytes(encrypted_secret, "utf-8"))
            .decode("utf-8")
        )

    @staticmethod
    def generate_url(totp_secret: str, username: str) -> str:
        return pyotp.totp.TOTP(totp_secret).provisioning_uri(
            name=username, issuer_name="centrífuga4 (Xamfrà)"
        )
