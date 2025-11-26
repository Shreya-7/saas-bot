# frozen_string_literal: true
require 'bundler/setup'
require 'selenium-webdriver'
require 'debug'
require 'date'
require 'json'
require 'twilio-ruby'

class VisaTableData
  def self.parse(table_el)
    results = {}

    rows = table_el.find_elements(css: "tbody tr")
    rows.each do |tr|
      tds = tr.find_elements(css: "td")
      next if tds.size < 6

      city_key = tds[0].text.strip

      # Earliest Date (3rd col) may be inside an <a>
      earliest_date =
        begin
          tds[2].find_element(css: "a").text.strip
        rescue Selenium::WebDriver::Error::NoSuchElementError
          tds[2].text.strip
        end

      results[city_key] = earliest_date
    end

    results
  end
end

class VisaDetailsStore
  FILE_PATH = File.join(Dir.pwd, "visa_details.json")

  class << self
    def write(data)
      # Ensure data is a Hash before writing
      raise ArgumentError, "data must be a Hash" unless data.is_a?(Hash)

      File.open(FILE_PATH, "w") do |f|
        f.write(JSON.pretty_generate(data))
      end
    end

    def read
      return {} unless File.exist?(FILE_PATH)

      content = File.read(FILE_PATH)
      return {} if content.strip.empty?

      JSON.parse(content)
    rescue JSON::ParserError
      {}
    end
  end
end


class WhatsappMessager
  def self.send(message)
    account_sid = ENV['TWILIO_ACCOUNT_SID']
    auth_token = ENV['TWILIO_AUTH_TOKEN']
    @client = Twilio::REST::Client.new(account_sid, auth_token)

    message = @client.messages.create(
      body: message,
      from: "whatsapp:#{ENV['FROM_NUMBER']}",
      to: "whatsapp:#{ENV['TO_NUMBER']}"
    )

    puts "Sent whatsapp alert - SID: #{message.sid}"
  end
end


class VisaSlotAlerter
  def self.call(data)
    old_data = VisaDetailsStore.read
    messages = []

    data.each do |city, new_date|
      old_date = old_data[city]

      # Only trigger if old data exists and has a date
      if old_date && new_date && old_date != new_date
        messages << "#{city.capitalize} - #{new_date}"
      end
    end

    if messages.empty?
      puts "No changes in slots"
    else
      puts "Slot change identified - Triggering message"
      messages.unshift("Visa slot updated")
      notification_message = messages.join("\n")
      puts "Message to send: #{notification_message}"
      # WhatsappMessager.send(notification_message)
    end

    VisaDetailsStore.write(data)
  end
end


# Configure Selenium to use Chrome
def process
  options = Selenium::WebDriver::Chrome::Options.new
#   options.add_argument('--headless')
  options.add_argument('--disable-gpu')
  options.add_argument('--no-sandbox')

  # Start the driver
  service = Selenium::WebDriver::Service.chrome(path: "/opt/homebrew/bin/chromedriver")
  driver  = Selenium::WebDriver.for :chrome, service: service, options: options

  begin
    puts "Running Visa slot tracker - #{Time.now}"
    # Navigate to target webpage
    url = "https://checkvisaslots.com/latest-us-visa-availability.html"
    driver.navigate.to url

    # Wait for JS-rendered content
    wait = Selenium::WebDriver::Wait.new(timeout: 10)
    wait.until { driver.find_element(css: '#B1Regular') }

    # Extract visible text
    table_el = driver.find_element(css: '#B1Regular')

    puts "Found B1 Visa slot data"
    data = VisaTableData.parse(table_el)

    puts "Parsing successful, checking mismatches"

    VisaSlotAlerter.call(data)

    puts "Completed"
    puts "*" * 50
  rescue => e
    puts "Error: #{e.message}, #{e.backtrace}"
  ensure
    driver.quit
  end
end

process