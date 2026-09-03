using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IncidentFlow.Api.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddIncidentArchiving : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "ArchivedAt",
                table: "Incidents",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "Incidents",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_Incidents_IsArchived",
                table: "Incidents",
                column: "IsArchived");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Incidents_IsArchived",
                table: "Incidents");

            migrationBuilder.DropColumn(
                name: "ArchivedAt",
                table: "Incidents");

            migrationBuilder.DropColumn(
                name: "IsArchived",
                table: "Incidents");
        }
    }
}
