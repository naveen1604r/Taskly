# Taskly MySQL Database Backup & Recovery Strategy

This document outlines the backup, restoration, and disaster recovery strategy for the Taskly MySQL production database.

---

## 1. Overview

Taskly stores user deliverables, habits, focus records, recurring tasks, reminders, notes, and activity in MySQL. To guarantee zero data loss and business continuity:
- **Nightly automated full backups** must run via `mysqldump` or enterprise backup tools.
- **Hourly binlog backups** should be archived for Point-In-Time Recovery (PITR).
- Backups must be encrypted at rest and sent to offsite object storage (e.g. AWS S3, Google Cloud Storage, or Azure Blob).
- Real production dumps must **never be committed to Git** (enforced by `.gitignore`).

---

## 2. Backup Procedures

### A. Full Database Backup (Command Line)

To perform an immediate logical backup of the entire `taskly` database including all tables, indexes, constraints, and triggers:

```bash
mysqldump \
  --host="${DB_HOST:-localhost}" \
  --port="${DB_PORT:-3306}" \
  --user="${DB_USER:-root}" \
  --password="${DB_PASSWORD}" \
  --single-transaction \
  --quick \
  --routines \
  --triggers \
  --default-character-set=utf8mb4 \
  taskly | gzip > "taskly_backup_$(date +%Y%m%d_%H%M%S).sql.gz"
```

> **Flags Explained:**
> - `--single-transaction`: Consistent snapshot without locking InnoDB tables during backup.
> - `--quick`: Forces mysqldump to retrieve rows from the server one at a time rather than caching the entire rowset.
> - `--routines` / `--triggers`: Backs up stored procedures and triggers.
> - `gzip`: Compresses the SQL dump file to minimize storage.

---

### B. Automated Daily Backup Script (Cron Job)

Create a shell script on the production server (e.g., `/opt/taskly/scripts/backup.sh`):

```bash
#!/usr/bin/env bash
set -eo pipefail

BACKUP_DIR="/var/backups/taskly"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/taskly_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=30

mkdir -p "${BACKUP_DIR}"

# Source database credentials safely from secure file
source /opt/taskly/server/.env

echo "[$(date)] Starting Taskly database backup..."

mysqldump \
  -h "${DB_HOST}" \
  -P "${DB_PORT}" \
  -u "${DB_USER}" \
  -p"${DB_PASSWORD}" \
  --single-transaction \
  --quick \
  --default-character-set=utf8mb4 \
  "${DB_NAME}" | gzip > "${BACKUP_FILE}"

echo "[$(date)] Backup completed: ${BACKUP_FILE} ($(du -h "${BACKUP_FILE}" | cut -f1))"

# Prune backups older than 30 days
find "${BACKUP_DIR}" -name "taskly_*.sql.gz" -mtime +${RETENTION_DAYS} -delete
echo "[$(date)] Expired backups pruned."
```

Configure cron (`crontab -e`):
```cron
# Run Taskly database backup every night at 02:00 AM UTC
0 2 * * * /opt/taskly/scripts/backup.sh >> /var/log/taskly_backup.log 2>&1
```

---

## 3. Database Restoration Procedure

### Restoring from a Gzipped Backup

```bash
# 1. Unzip the backup file
gunzip < taskly_backup_20260906_120000.sql.gz | mysql \
  --host="${DB_HOST:-localhost}" \
  --port="${DB_PORT:-3306}" \
  --user="${DB_USER:-root}" \
  --password="${DB_PASSWORD}" \
  taskly
```

### Verifying Restoration
Once restored, verify row counts and table integrity:

```sql
USE taskly;
SELECT table_name, table_rows 
FROM information_schema.tables 
WHERE table_schema = 'taskly';
```

---

## 4. Disaster Recovery & Security
1. **Encryption**: Encrypt backups using GPG or AWS KMS before uploading to remote storage.
2. **Access Control**: Limit database backup read/write access to automated service accounts.
3. **Drills**: Schedule quarterly test restorations in an isolated staging environment to verify data integrity.
