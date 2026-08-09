"""Invalidate access tokens after password or role changes."""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260725_0002"
down_revision: Union[str, Sequence[str], None] = "20260725_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    columns = {column["name"] for column in sa.inspect(op.get_bind()).get_columns("users")}
    if "auth_version" not in columns:
        op.add_column(
            "users",
            sa.Column("auth_version", sa.Integer(), nullable=False, server_default="0"),
        )


def downgrade() -> None:
    columns = {column["name"] for column in sa.inspect(op.get_bind()).get_columns("users")}
    if "auth_version" in columns:
        op.drop_column("users", "auth_version")
