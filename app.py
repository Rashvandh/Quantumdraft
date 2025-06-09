from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_mail import Mail, Message
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure your email settings from environment variables
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

mail = Mail(app)

@app.route('/api/contact', methods=['POST'])
def contact():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    message = data.get('message')

    if not name or not email or not message:
        return jsonify({'success': False, 'message': 'All fields are required.'}), 400

    try:
        # Send to site owner
        msg = Message(
            subject=f"Contact Form Submission from {name}",
            recipients=[app.config['MAIL_USERNAME']],
            body=f"From: {name} <{email}>\n\n{message}"
        )
        mail.send(msg)

        # Optional: Send confirmation to user
        confirm = Message(
            subject="Thank you for contacting QuantumDraft!",
            recipients=[email],
            body=f"Hi {name},\n\nThank you for reaching out! We have received your message and will get back to you soon.\n\nBest,\nQuantumDraft Team"
        )
        mail.send(confirm)

        return jsonify({'success': True, 'message': 'Message sent successfully!'})
    except Exception as e:
        print("Mail error:", e)
        return jsonify({'success': False, 'message': 'Failed to send message.'}), 500

if __name__ == '__main__':
    app.run(port=3001, debug=True)