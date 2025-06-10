require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  // Basic validation
  if (!name || name.length < 2) {
    return res.json({ success: false, error: 'Name must be at least 2 characters.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.json({ success: false, error: 'Invalid email address.' });
  }
  if (!message || message.length < 10) {
    return res.json({ success: false, error: 'Message must be at least 10 characters.' });
  }

  // Configure your Gmail SMTP
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS // Use environment variables!
    }
  });

  let mailOptions = {
    from: email,
    to: 'rashvandhappukutty@gmail.com',
    subject: `New Contact Form Submission from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false, error: 'Failed to send email.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Remove or comment out this block before deploying to Vercel
/*
fetch('http://localhost:5000/api/contact', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john.doe@example.com',
    message: 'Hello, this is a test message.'
  })
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('Message sent successfully!');
  } else {
    console.error('Error sending message:', data.error);
  }
})
.catch(error => console.error('Fetch error:', error));
*/