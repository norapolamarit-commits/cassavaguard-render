"""Add field provenance required for leakage-safe yield training."""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "20260912_0007"
down_revision: Union[str, Sequence[str], None] = "20260912_0006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    existing = {column["name"] for column in inspector.get_columns("harvest_measurements")}
    columns = {
        "variety": sa.Column("variety", sa.String(), nullable=False, server_default="unknown"),
        "field_code": sa.Column("field_code", sa.String(), nullable=False, server_default=""),
        "latitude": sa.Column("latitude", sa.Float(), nullable=True),
        "longitude": sa.Column("longitude", sa.Float(), nullable=True),
        "root_volume_cm3_per_plant": sa.Column("root_volume_cm3_per_plant", sa.Float(), nullable=True),
        "root_images_json": sa.Column("root_images_json", sa.Text(), nullable=False, server_default="[]"),
        "season": sa.Column("season", sa.String(), nullable=False, server_default=""),
    }
    for name, column in columns.items():
        if name not in existing:
            op.add_column("harvest_measurements", column)
    op.create_index("ix_harvest_measurements_variety", "harvest_measurements", ["variety"])
    op.create_index("ix_harvest_measurements_field_code", "harvest_measurements", ["field_code"])


def downgrade() -> None:
    for name in ("season", "root_images_json", "root_volume_cm3_per_plant", "longitude", "latitude", "field_code", "variety"):
        op.drop_column("harvest_measurements", name)
