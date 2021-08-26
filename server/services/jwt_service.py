from typing import Optional, Dict, Union, Tuple

import jwt
from flask import current_app
from datetime import datetime
from datetime import timedelta


class JwtService:
    JWT_ALGORITHM = "HS256"
    ENCODING = "UTF-8"

    @staticmethod
    def _secret(secret: Optional[str]):
        """:returns the secret used for signing"""
        return current_app.config["PASSWORD_RESET_SECRET"] if secret is None else secret

    @staticmethod
    def _get_datetime_now():
        return datetime.utcnow()

    def encode(
        self,
        data: Optional[Dict] = None,
        secret: str = None,
        expires_in: Optional[timedelta] = None,
        expires_at: Optional[datetime] = None,
        **kwargs,
    ) -> str:
        """:returns a signed JWT for the given data"""
        secret = self._secret(secret)
        if data is None:
            data = {}

        if expires_in is not None and expires_at is not None:
            raise ValueError("only one of 'expires_in' or 'expires_at' can be given at a time")

        if expires_in is not None:
            if type(expires_in) is not timedelta:
                raise ValueError(f"expires_in must be of type {timedelta} not {type(expires_in)}")
            expires_at = self._get_datetime_now() + expires_in

        if expires_at is not None:
            if type(expires_at) is not datetime:
                raise ValueError(f"expires_in must be of type {datetime} not {type(expires_at)}")
            data = {**data, "exp": expires_at}

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
        except jwt.DecodeError:
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
