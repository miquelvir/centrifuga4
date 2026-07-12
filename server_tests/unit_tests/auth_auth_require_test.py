from server.auth_auth import require as require_module
from server.auth_auth.require import EnsureCRUDRolePermissions, EmptyCRUDRolePermissions, Require


def test_require_can_and_ensure_are_callable_classmethods(monkeypatch):
    class DummyUser:
        role = None

    monkeypatch.setattr(require_module, "current_user", DummyUser())

    can_provider = Require.can()
    ensure_provider = Require.ensure()

    assert isinstance(can_provider, EmptyCRUDRolePermissions)
    assert isinstance(ensure_provider, EnsureCRUDRolePermissions)
    assert isinstance(ensure_provider.permission_provider, EmptyCRUDRolePermissions)
