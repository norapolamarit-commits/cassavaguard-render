"""Persist independent auxiliary-model findings without corrupting softmax probabilities."""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260731_0005"
down_revision: Union[str, Sequence[str], None] = "20260731_0004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    columns = {item["name"] for item in inspector.get_columns("predictions")}
    if "auxiliary_json" not in columns:
        op.add_column(
            "predictions",
            sa.Column("auxiliary_json", sa.Text(), nullable=False, server_default="[]"),
        )


def downgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    columns = {item["name"] for item in inspector.get_columns("predictions")}
    if "auxiliary_json" in columns:
        op.drop_column("predictions", "auxiliary_json")
