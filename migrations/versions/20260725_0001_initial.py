"""Baseline CassavaGuard schema, safe for existing create_all databases."""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260725_0001"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_table(inspector, name: str) -> bool:
    return name in inspector.get_table_names()


def _ensure_index(inspector, table: str, name: str, columns: list[str], unique: bool = False) -> None:
    if name not in {item["name"] for item in inspector.get_indexes(table)}:
        op.create_index(name, table, columns, unique=unique)


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not _has_table(inspector, "users"):
        op.create_table(
            "users",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("email", sa.String(), nullable=False),
            sa.Column("full_name", sa.String(), nullable=True),
            sa.Column("hashed_password", sa.String(), nullable=False),
            sa.Column("role", sa.String(), nullable=True),
            sa.Column("language", sa.String(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=True),
            sa.Column("reset_token", sa.String(), nullable=True),
            sa.UniqueConstraint("email"),
        )
    inspector = sa.inspect(bind)
    _ensure_index(inspector, "users", "ix_users_email", ["email"], unique=True)

    if not _has_table(inspector, "fields"):
        op.create_table(
            "fields",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("name", sa.String(), nullable=False),
            sa.Column("name_th", sa.String(), nullable=True),
            sa.Column("province", sa.String(), nullable=True),
            sa.Column("variety", sa.String(), nullable=True),
            sa.Column("area_rai", sa.Float(), nullable=True),
            sa.Column("plant_count", sa.Integer(), nullable=True),
            sa.Column("planted_at", sa.DateTime(), nullable=True),
            sa.Column("lat", sa.Float(), nullable=False),
            sa.Column("lon", sa.Float(), nullable=False),
            sa.Column("boundary_json", sa.Text(), nullable=False),
            sa.Column("health_score", sa.Float(), nullable=True),
            sa.Column("risk_level", sa.String(), nullable=True),
            sa.Column("owner_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        )

    inspector = sa.inspect(bind)
    if not _has_table(inspector, "predictions"):
        op.create_table(
            "predictions",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("created_at", sa.DateTime(), nullable=True),
            sa.Column("source", sa.String(), nullable=True),
            sa.Column("filename", sa.String(), nullable=True),
            sa.Column("image_path", sa.String(), nullable=True),
            sa.Column("heatmap_path", sa.String(), nullable=True),
            sa.Column("top_class", sa.String(), nullable=True),
            sa.Column("confidence", sa.Float(), nullable=True),
            sa.Column("probs_json", sa.Text(), nullable=True),
            sa.Column("symptoms_json", sa.Text(), nullable=True),
            sa.Column("features_json", sa.Text(), nullable=True),
            sa.Column("explanation", sa.Text(), nullable=True),
            sa.Column("explanation_th", sa.Text(), nullable=True),
            sa.Column("inference_ms", sa.Float(), nullable=True),
            sa.Column("model_id", sa.String(), nullable=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("field_id", sa.Integer(), sa.ForeignKey("fields.id"), nullable=True),
        )
    inspector = sa.inspect(bind)
    _ensure_index(inspector, "predictions", "ix_predictions_created_at", ["created_at"])
    inspector = sa.inspect(bind)
    _ensure_index(inspector, "predictions", "ix_predictions_top_class", ["top_class"])

    inspector = sa.inspect(bind)
    if not _has_table(inspector, "alerts"):
        op.create_table(
            "alerts",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("created_at", sa.DateTime(), nullable=True),
            sa.Column("kind", sa.String(), nullable=True),
            sa.Column("severity", sa.String(), nullable=True),
            sa.Column("title", sa.String(), nullable=True),
            sa.Column("title_th", sa.String(), nullable=True),
            sa.Column("message", sa.Text(), nullable=True),
            sa.Column("message_th", sa.Text(), nullable=True),
            sa.Column("read", sa.Boolean(), nullable=True),
            sa.Column("field_id", sa.Integer(), sa.ForeignKey("fields.id"), nullable=True),
        )
    inspector = sa.inspect(bind)
    _ensure_index(inspector, "alerts", "ix_alerts_created_at", ["created_at"])

    inspector = sa.inspect(bind)
    if not _has_table(inspector, "logs"):
        op.create_table(
            "logs",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("created_at", sa.DateTime(), nullable=True),
            sa.Column("level", sa.String(), nullable=True),
            sa.Column("method", sa.String(), nullable=True),
            sa.Column("path", sa.String(), nullable=True),
            sa.Column("status_code", sa.Integer(), nullable=True),
            sa.Column("duration_ms", sa.Float(), nullable=True),
            sa.Column("user_email", sa.String(), nullable=True),
        )
    inspector = sa.inspect(bind)
    _ensure_index(inspector, "logs", "ix_logs_created_at", ["created_at"])


def downgrade() -> None:
    for table in ("logs", "alerts", "predictions", "fields", "users"):
        if table in sa.inspect(op.get_bind()).get_table_names():
            op.drop_table(table)
