

<div align="center">
    <img alt="platform" src="https://camo.githubusercontent.com/27d9a984b7c15ec14322b53f221c964e8218459b0209e7f8f6fb3d68c5d80351/68747470733a2f2f696d672e736869656c64732e696f2f7374617469632f76313f7374796c653d666f722d7468652d6261646765266d6573736167653d526f626c6f7826636f6c6f723d303030303030266c6f676f3d526f626c6f78266c6f676f436f6c6f723d464646464646266c6162656c3d">
    <h1>VOLT Beta</h1>
    <img src="./assets/VoltLogo.png" width="300" height="300" alt="blueprint illustration">
    <p>
        <img alt="language" src="https://img.shields.io/github/languages/top/KhanPython/Volt-beta" >
        <img alt="code size" src="https://img.shields.io/github/languages/code-size/KhanPython/Volt-beta">
        <img alt="issues" src="https://img.shields.io/github/issues/KhanPython/Volt-beta" >
        <img alt="issues" src="https://img.shields.io/github/last-commit/KhanPython/Volt-Beta" >
        <img alt="license" src="https://img.shields.io/github/license/KhanPython/VOLT-Beta" >
    </p>
</div>


###### Powered by [WOKCommands](https://docs.wornoffkeys.com/)
### A private **experimental** admin commands discord.js bot for Roblox experiences using Roblox Open Cloud APIs.

#
## Required Environment Variables (GitHub Secrets):
* `discordToken` - Your Discord [bot token](https://docs.discordbotstudio.org/setting-up-dbs/finding-your-bot-token) 
* `robloxAPIKey` - Your Roblox [Open Cloud API key](https://developer.roblox.com/en-us/docs/cloud/getting-started)
* `universeID` - Your Roblox experience universe ID

#
## Setup Instructions:

### 1. Local Development
Copy `.env.example` to `.env` and fill in your secrets:
```bash
cp .env.example .env
```

### 2. GitHub Actions / Production Deployment
Add these secrets to your GitHub repository:
- Go to **Settings** → **Secrets and variables** → **Actions**
- Create three new repository secrets:
  - `DISCORD_TOKEN`
  - `ROBLOX_API_KEY`
  - `UNIVERSE_ID`

### 3. Installation & Running
```bash
npm install
npm start
```

### 4. Using Commands
Execute Discord commands like:
- `/ban <userId> <reason> [duration]` - Ban a player (e.g., "10d", "2h", "30m")
- `/unban <userId>` - Unban a player
- `/give <userId> <amount>` - Give currency to a player

#
## Features:
* **User Restrictions API** - Native Roblox ban system (permanent & temporary bans)
* **DataStore Integration** - Player currency management
* **Open Cloud** - Native Roblox APIs, no external databases required
* **Discord Integration** - Easy admin commands from Discord

#
## Architecture:
* **Framework**: discord.js v13.9.0
* **Command Handler**: wokcommands v1.5.3
* **Roblox SDK**: rbxcloud v1.2.0