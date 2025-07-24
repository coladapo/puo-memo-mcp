#!/usr/bin/env python3
"""
Database migration script for PUO Memo multi-tenant platform
Run this to set up the database schema for user authentication and multi-tenancy
"""
import os
import asyncio
import asyncpg
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def run_migration(conn: asyncpg.Connection, migration_file: Path):
    """Run a single migration file"""
    logger.info(f"Running migration: {migration_file.name}")
    
    with open(migration_file, 'r') as f:
        sql = f.read()
    
    try:
        await conn.execute(sql)
        logger.info(f"✅ Successfully applied: {migration_file.name}")
    except Exception as e:
        logger.error(f"❌ Failed to apply {migration_file.name}: {e}")
        raise


async def main():
    """Run all database migrations"""
    # Get database connection details
    db_config = {
        'host': os.getenv('DB_HOST', 'aws-0-us-west-1.pooler.supabase.com'),
        'port': int(os.getenv('DB_PORT', 6543)),
        'database': os.getenv('DB_NAME', 'postgres'),
        'user': os.getenv('DB_USER', 'postgres.bcmsutoahlxqriealrjb'),
        'password': os.getenv('DB_PASSWORD', '')
    }
    
    if not db_config['password']:
        logger.error("DB_PASSWORD environment variable not set!")
        return
    
    logger.info("🚀 Starting database migration...")
    
    try:
        # Connect to database
        conn = await asyncpg.connect(**db_config)
        logger.info("✅ Connected to database")
        
        # Enable UUID extension
        await conn.execute("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";")
        
        # Get migration files
        migrations_dir = Path(__file__).parent.parent / 'migrations'
        migration_files = sorted(migrations_dir.glob('*.sql'))
        
        if not migration_files:
            logger.warning("No migration files found!")
            return
        
        # Run each migration
        for migration_file in migration_files:
            await run_migration(conn, migration_file)
        
        # Create initial admin user (optional)
        create_admin = input("\nCreate admin user? (y/n): ").lower() == 'y'
        if create_admin:
            from src.core.auth import AuthManager, UserCreate
            
            admin_email = input("Admin email: ")
            admin_password = input("Admin password: ")
            
            auth_manager = AuthManager(
                os.getenv('SUPABASE_URL'),
                os.getenv('SUPABASE_SERVICE_KEY')
            )
            
            admin_data = UserCreate(
                email=admin_email,
                password=admin_password,
                full_name="Admin User"
            )
            
            result = await auth_manager.create_user(admin_data)
            logger.info(f"✅ Admin user created: {result['user']['email']}")
            logger.info(f"🔑 API Key: {result['api_key'].key}")
            logger.info("⚠️  Save this API key - you won't see it again!")
        
        logger.info("\n✅ Database migration completed successfully!")
        
        await conn.close()
        
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(main())