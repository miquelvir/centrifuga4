from typing import Optional

from pydantic import BaseModel


class UserInviteJwtBody(BaseModel):
    user_email: str
    role_id: Optional[str]
