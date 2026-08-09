"""Store real laboratory, sensor, and field-kit soil measurements."""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260731_0004"
down_revision: Union[str, Sequence[str], None] = "20260725_0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    if "soil_samples" not in inspector.get_table_names():
        op.create_table(
            "soil_samples",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("sampled_at", sa.DateTime(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("source", sa.String(), nullable=False),
            sa.Column("lab_name", sa.String(), nullable=True),
            sa.Column("texture", sa.String(), nullable=True),
            sa.Column("ph", sa.Float(), nullable=True),
            sa.Column("om_pct", sa.Float(), nullable=True),
            sa.Column("n_ppm", sa.Float(), nullable=True),
            sa.Column("p_ppm", sa.Float(), nullable=True),
            sa.Column("k_ppm", sa.Float(), nullable=True),
            sa.Column("cec", sa.Float(), nullable=True),
            sa.Column("moisture_pct", sa.Float(), nullable=True),
            sa.Column("notes", sa.Text(), nullable=True),
            sa.Column(
                "field_id",
                sa.Integer(),
                sa.ForeignKey("fields.id"),
                nullable=False,
            ),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        )
    inspector = sa.inspect(op.get_bind())
    indexes = {item["name"] for item in inspector.get_indexes("soil_samples")}
    if "ix_soil_samples_sampled_at" not in indexes:
        op.create_index(
            "ix_soil_samples_sampled_at", "soil_samples", ["sampled_at"]
        )
    if "ix_soil_samples_field_id" not in indexes:
        op.create_index("ix_soil_samples_field_id", "soil_samples", ["field_id"])


def downgrade() -> None:
    if "soil_samples" in sa.inspect(op.get_bind()).get_table_names():
        op.drop_table("soil_samples")
