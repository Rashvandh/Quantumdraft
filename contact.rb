require 'sinatra'
require 'json'
require 'mail'

# ✅ Enable CORS to allow frontend requests from other ports (like 8001)
before do
  response.headers['Access-Control-Allow-Origin'] = '*'
  response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
  response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
end

# ✅ Handle preflight (OPTIONS) request for CORS
options '/contact' do
  200
end

# ✅ POST /contact to receive form submission
post '/contact' do
  content_type :json

  begin
    data = JSON.parse(request.body.read)
    name = data['name'].to_s.strip
    email = data['email'].to_s.strip
    message = data['message'].to_s.strip

    # Basic validation
    if name.length < 2
      return { success: false, error: 'Name must be at least 2 characters.' }.to_json
    end

    unless email =~ /\A[^@\s]+@[^@\s]+\z/
      return { success: false, error: 'Invalid email address.' }.to_json
    end

    if message.length < 10
      return { success: false, error: 'Message must be at least 10 characters.' }.to_json
    end

    # Configure email delivery using Gmail SMTP
    Mail.defaults do
      delivery_method :smtp, {
        address: "smtp.gmail.com",
        port: 587,
        user_name: ENV['GMAIL_USER'],      # Set in terminal or .env
        password: ENV['GMAIL_PASS'],       # App password, not Gmail login password
        authentication: 'plain',
        enable_starttls_auto: true
      }
    end

    # Create the email
    mail = Mail.new do
      from    email
      to      'rashvandhappukutty@gmail.com'
      subject "New Contact Form Submission from #{name}"
      body    "Name: #{name}\nEmail: #{email}\nMessage:\n#{message}"
    end

    # Send the email
    mail.deliver!
    { success: true }.to_json

  rescue => e
    { success: false, error: "Failed to process request: #{e.message}" }.to_json
  end
end
