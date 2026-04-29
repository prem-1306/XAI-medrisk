import sqlite3
import json

conn = sqlite3.connect('xaimedrisk.db')
cursor = conn.cursor()
cursor.execute("SELECT id, status, result FROM tasks ORDER BY created_at DESC LIMIT 1")
row = cursor.fetchone()
if row:
    print(f"Task ID: {row[0]}")
    print(f"Status: {row[1]}")
    print(f"Result: {row[2]}")
else:
    print("No tasks found.")
conn.close()
