# Local Development with XAMPP

## Prerequisites
- XAMPP installed and running (Apache + MySQL)
- MySQL running on default port 3306

## Setup

1. **Start XAMPP MySQL**
   - Open XAMPP Control Panel
   - Start MySQL service

2. **Create Database**
   - Open phpMyAdmin (http://localhost/phpmyadmin)
   - Create a new database named `portfolio`
   - Or run: `mysql -u root -e "CREATE DATABASE portfolio;"`

3. **Configure Environment**
   ```bash
   cd server
   cp .env.local.example .env
   # Edit .env if needed (DB_PASSWORD if you set one in XAMPP)
   ```

4. **Run Migrations**
   ```bash
   npm run migrate
   ```

5. **Seed Data (Optional)**
   ```bash
   npm run seed
   ```

6. **Start Server**
   ```bash
   npm run dev
   ```

## Migration Commands

- `npm run migrate` - Run all pending migrations
- `npm run migrate:down` - Rollback last migration
- `npm run migrate:status` - Show migration status

## XAMPP Default Credentials
- Host: localhost
- Port: 3306
- User: root
- Password: (empty by default)
- Database: portfolio

## Troubleshooting

**Connection refused**: Make sure MySQL is running in XAMPP Control Panel.

**Access denied**: Check DB_USER and DB_PASSWORD in .env match your XAMPP setup.

**Port conflict**: If port 3306 is in use, change DB_PORT in .env and XAMPP MySQL config.