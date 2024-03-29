"""Initial migration.

Revision ID: 8cdc979d8b2e
Revises: 
Create Date: 2021-08-23 15:31:46.558203

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "8cdc979d8b2e"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "role",
        sa.Column("id", sa.Text(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("name", sa.Text(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("id"),
    )
    op.drop_table("user_need")
    op.drop_table("need")
    op.add_column(
        "attendance", sa.Column("id", sa.String(), nullable=False, primary_key=True)
    )
    op.add_column("attendance", sa.Column("status", sa.Integer(), nullable=False))
    op.add_column("attendance", sa.Column("comment", sa.Text(), nullable=True))
    op.create_unique_constraint(None, "attendance", ["date", "course_id", "student_id"])
    op.add_column("user", sa.Column("role_id", sa.Text(), nullable=True))
    op.add_column("user", sa.Column("teacher_id", sa.Text(), nullable=True))
    op.create_foreign_key(None, "user", "role", ["role_id"], ["id"])
    op.create_foreign_key(None, "user", "teacher", ["teacher_id"], ["id"])
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, "user", type_="foreignkey")
    op.drop_constraint(None, "user", type_="foreignkey")
    op.drop_column("user", "teacher_id")
    op.drop_column("user", "role_id")
    op.drop_constraint(None, "attendance", type_="unique")
    op.drop_column("attendance", "comment")
    op.drop_column("attendance", "status")
    op.drop_column("attendance", "id")
    op.create_table(
        "need",
        sa.Column("description", sa.TEXT(), nullable=False),
        sa.Column("id", sa.TEXT(), nullable=False),
        sa.Column("type", sa.TEXT(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("id"),
    )
    op.create_table(
        "user_need",
        sa.Column("user_id", sa.TEXT(), nullable=True),
        sa.Column("need_id", sa.TEXT(), nullable=True),
        sa.ForeignKeyConstraint(
            ["need_id"],
            ["need.id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["user.id"],
        ),
    )
    op.drop_table("role")
    # ### end Alembic commands ###
