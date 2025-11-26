## Visa Slot Scraper

### Overview
Scrapes the latest US visa appointment availability and alerts via WhatsApp (Twilio). Data is persisted in `visa_details.json` to detect changes.

### Prerequisites
- **Ruby** 3.x (or compatible)
- **Bundler** for dependency management
- **Google Chrome** installed
- **ChromeDriver** installed and available at `/opt/homebrew/bin/chromedriver` (default on Apple Silicon via Homebrew)
- (Optional for alerts) **Twilio** account with WhatsApp Sandbox enabled

### Install
1. Install Homebrew (if you don’t have it):
   - See `https://brew.sh`
2. Install Chrome and ChromeDriver:
   - `brew install --cask google-chrome`
   - `brew install chromedriver`
   - Verify path: `which chromedriver` should be `/opt/homebrew/bin/chromedriver`. Replace in code if it is installed in a different path
3. Install Ruby dependencies:
   - `gem install bundler` (if needed)
   - In the project directory: `bundle install`

### Configure (optional for WhatsApp alerts)
Export these environment variables in your shell before running:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `FROM_NUMBER` (format: `whatsapp:+XXXXXXXXXX` or your Twilio WhatsApp-enabled number)
- `TO_NUMBER` (format: `whatsapp:+XXXXXXXXXX`)

Example:
```bash
export TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
export TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
export FROM_NUMBER=+XXXXXXXXXX
export TO_NUMBER=+XXXXXXXXXX
```

Note: WhatsApp sending is currently commented out in `scraper.rb`. To enable, uncomment the line that calls `WhatsappMessager.send`.

### Run
In the project directory:
```bash
bundle exec ruby scraper.rb
```

- The script runs headless Chrome, scrapes the table, prints status, and updates `visa_details.json`.
- On subsequent runs, if dates change, it will print a change notice (and send WhatsApp if enabled and env vars are set).

### Running as CRON

Run `crontab -e` and add the below line to run it every minute

```bash
* * * * * /bin/bash -l -c 'source /path_to/rvm && cd /path_to/visa-slot-scraper && bundle exec ruby scraper.rb >> log.txt 2>&1'
```


### Troubleshooting
- "chromedriver not found": ensure `chromedriver` is installed and at `/opt/homebrew/bin/chromedriver`, or update the path in `scraper.rb`.
- SSL/Network issues: ensure internet access and that the site is reachable in a normal browser.
- Twilio errors: verify your SID/token, WhatsApp sandbox setup, and number formats.
