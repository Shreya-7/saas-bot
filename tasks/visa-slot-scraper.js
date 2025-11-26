const { exec } = require('child_process');
const path = require("node:path");

module.exports = {
    name: "Visa Slot Scraper",
    description: "executes a ruby script to scrape visa slots",
    frequency: "* * * * *",
    async execute(client) {
        const scriptPath = "visa-slot-scraper"
        const command = `cd ${scriptPath} && bundle exec ruby scraper.rb`
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                // message.channel.send(`Error executing script: \n\`\`\`${stderr}\`\`\``);
                return;
            }
            if (stderr) {
                console.warn(`Script stderr: ${stderr}`);
                // message.channel.send(`Script output (with warnings/errors): \n\`\`\`${stdout}\n${stderr}\`\`\``);
                return;
            }
            // message.channel.send(`Script executed successfully: \n\`\`\`${stdout}\`\`\``);
        });
    }
}