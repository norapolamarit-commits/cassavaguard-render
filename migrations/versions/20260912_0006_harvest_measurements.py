"""Add verified harvest labels paired with image predictions."""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260912_0006"
down_revision: Union[str, Sequence[str], None] = "20260731_0005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    if "harvest_measurements" in inspector.get_table_names():
        return
    op.create_table(
        "harvest_measurements",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("measured_at", sa.DateTime(), nullable=False),
        sa.Column("total_fresh_root_weight_kg", sa.Float(), nullable=False),
        sa.Column("harvested_plant_count", sa.Integer(), nullable=False),
        sa.Column("weight_kg_per_plant", sa.Float(), nullable=False),
        sa.Column("age_months", sa.Float(), nullable=False),
        sa.Column("height_cm", sa.Float(), nullable=False),
        sa.Column("stem_count", sa.Integer(), nullable=False),
        sa.Column("notes", sa.Text(), nullable=False, server_default=""),
        sa.Column("prediction_id", sa.Integer(), sa.ForeignKey("predictions.id"), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.UniqueConstraint("prediction_id"),
    )
    op.create_index("ix_harvest_measurements_created_at", "harvest_measurements", ["created_at"])
    op.create_index("ix_harvest_measurements_measured_at", "harvest_measurements", ["measured_at"])
    op.create_index("ix_harvest_measurements_prediction_id", "harvest_measurements", ["prediction_id"], unique=True)
    op.create_index("ix_harvest_measurements_user_id", "harvest_measurements", ["user_id"])


def downgrade() -> None:
    if "harvest_measurements" in sa.inspect(op.get_bind()).get_table_names():
        op.drop_table("harvest_measurements")
