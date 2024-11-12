from flask import Flask, jsonify
import psycopg2
import random
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=['http://localhost:3000'], supports_credentials=True)

# Database configuration
DB_CONFIG = {
    'dbname': 'chess_puzzles',
    'user': 'postgres',
    'password': 'sigma',
    'host': 'localhost',
    'port': 5432
}

def get_db_connection():
    connection = psycopg2.connect(**DB_CONFIG)
    return connection

@app.route('/api/random-puzzle', methods=['GET'])
def get_random_puzzle():
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        # Get the total count of puzzles
        cursor.execute('SELECT COUNT(*) FROM puzzle_ids')
        total_count = cursor.fetchone()[0]

        # Generate a random index
        random_index = random.randint(0, total_count - 1)

        # Get a random puzzle id using the random index
        cursor.execute('SELECT id FROM puzzle_ids OFFSET %s LIMIT 1', (random_index,))
        puzzle_id = cursor.fetchone()[0]

        # Retrieve the puzzle with the selected id
        cursor.execute('SELECT * FROM puzzles WHERE id = %s', (puzzle_id,))
        random_puzzle = cursor.fetchone()

        # Get column names for JSON formatting
        column_names = [desc[0] for desc in cursor.description]
        puzzle_dict = dict(zip(column_names, random_puzzle))

        return jsonify(puzzle_dict)
    except Exception as e:
        print(f'Error retrieving puzzle: {e}')
        return jsonify({'error': 'Error retrieving puzzle'}), 500
    finally:
        cursor.close()
        connection.close()

if __name__ == '__main__':
    app.run(port=5000)
