

<div align="center">
    <img alt="platform" src="https://camo.githubusercontent.com/27d9a984b7c15ec14322b53f221c964e8218459b0209e7f8f6fb3d68c5d80351/68747470733a2f2f696d672e736869656c64732e696f2f7374617469632f76313f7374796c653d666f722d7468652d6261646765266d6573736167653d526f626c6f7826636f6c6f723d303030303030266c6f676f3d526f626c6f78266c6f676f436f6c6f723d464646464646266c6162656c3d">
    <h1>VOLT Beta</h1>
    <img src="./assets/VoltLogo.png" width="300" height="300" alt="blueprint illustration">
    <p>
        <img alt="language" src="https://img.shields.io/github/languages/top/KhanPython/Volt-beta" >
        <img alt="code size" src="https://img.shields.io/github/languages/code-size/KhanPython/Volt-beta">
        <img alt="issues" src="https://img.shields.io/github/issues/KhanPython/Volt-beta" >
        <img alt="issues" src="https://img.shields.io/github/last-commit/KhanPython/Volt-Beta" >
    </p>
</div>


###### Powered by [WOKCommands](https://docs.wornoffkeys.com/)
### A private **experimental** admin commands discord.js bot for Roblox experiences that uses OpenCloudAPI and MessagingService, hosted on [Replit](https://replit.com/@pythonlittlegam/VOLT-Beta#index.js). 

#
## Required Secrets:
* A mongoDB [connection string](https://www.mongodb.com/docs/compass/current/connect/)
* Discord [bot token](https://docs.discordbotstudio.org/setting-up-dbs/finding-your-bot-token) 
* Roblox experience universe ID
* Roblox [opencloud API key](https://developer.roblox.com/en-us/articles/open-cloud)
#
## To use:
* Fork the [Replit](https://replit.com/@pythonlittlegam/VOLT-Beta#index.js) repo
* Start a mongoDB project and create a new cluster
* Generate the aforementioned secrets via the forked Replit repo
* In your Roblox experience, subsribe to any of the given topic names; [example usage](example/ExampleUsage.lua)
* Run `node init` in Replit CLI (Shell) to install all of the required dependencies
* Run the forked Replit repository 
* Execute the desired discord command, i.e: 
  #### ``` /ban `<userId>`, `<reason>`, `<duration>`* ``` 
* **(Additional)** WOKCommands extends beyond available commands, allowing to expose/cover certain commands to a certain discord role. Read more on this on WOKCommands' official [documentation](https://docs.wornoffkeys.com/built-in-commands-and-features/configurable-required-roles).
#
## Available Roblox MessagingService topics (**Under construction**):
  > `DiscordKick` 
  >
  > `DiscordBan`
  >
  > `DiscordUnban`
  >
  > `DiscordServerBan`
  >
  > `DiscordServerUnBan`