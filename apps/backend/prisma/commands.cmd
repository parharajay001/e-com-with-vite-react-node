npx prisma format && npx prisma generate 
@REM This will validate the schema and generate proper TypeScript types for your Prisma Client.

npx prisma migrate dev --name init
@REM Create a new migration file in prisma/migrations/
@REM Generate SQL commands based on your schema
@REM Apply the migration to your database
@REM Generate the Prisma Client

npx prisma migrate reset
@REM If you need to reset an existing database (use with caution!)

npx prisma migrate deploy
@REM For production environments This will execute the SQL DDL commands to create all tables, indexes, and relations

npx prisma db pull
@REM to create your schema.prisma file from the existing database structure first.