"""Track notification read state per user."""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260725_0003"
down_revision: Union[str, Sequence[str], None] = "20260725_0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    if "alert_reads" not in sa.inspect(op.get_bind()).get_table_names():
        op.create_table(
            "alert_reads",
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), primary_key=True),
            sa.Column("alert_id", sa.Integer(), sa.ForeignKey("alerts.id"), primary_key=True),
            sa.Column("read_at", sa.DateTime(), nullable=False),
        )


def downgrade() -> None:
    if "alert_reads" in sa.inspect(op.get_bind()).get_table_names():
        op.drop_table("alert_reads")
