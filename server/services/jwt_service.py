from typing import Optional, Dict, Union, Tuple

import jwt
from flask import current_app
from datetime import datetime


class JwtService:
    JWT_ALGORITHM = "HS256"
    ENCODING = "UTF-8"

    @staticmethod
    def _secret(secret: Optional[str]):
        """:returns the secret used for signing"""
        return current_app.config["PASSWORD_RESET_SECRET"] if secret is None else secret

    def encode(
        self,
        data: Optional[Dict] = None,
        secret: str = None,
        expires_in: Optional[datetime] = None,
        **kwargs,
    ) -> str:
        """:returns a signed JWT for the given data"""
        secret = self._secret(secret)
        if data is None:
            data = {}

        if expires_in is not None:
            data = {**data, "exp": expires_in}

        return jwt.encode(data, secret, algorithm=self.JWT_ALGORITHM, **kwargs).decode(
            self.ENCODING
        )

    def _token(self, token: Union[bytes, str]) -> bytes:
        return (
            bytes(token, encoding=self.ENCODING) if type(token) is not bytes else token
        )

    def decode(
        self,
        token: Union[str, bytes],
        secret: str = None,
        verify: bool = True,
        **kwargs,
    ) -> dict:
        """:returns the payload of a JWT token"""
        secret = self._secret(secret)
        token = self._token(token)

        try:
            return jwt.decode(
                token, secret, verify=verify, algorithms=[self.JWT_ALGORITHM], **kwargs
            )
        except jwt.exceptions.DecodeError:
            raise

    def is_valid(self, token: Union[str, bytes]) -> Tuple[bool, Optional[dict]]:
        token = self._token(token)
        # noinspection PyBroadException
        try:
            data = self.decode(token)
        except:
            return False, None
        else:
            return True, data
