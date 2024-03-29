#!/usr/bin/env node

import { execSync } from "child_process"
import { cp, existsSync, mkdirSync, readFileSync, readdirSync } from "fs"
import inquirer from "inquirer"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const CWD = process.cwd()
const TEMPLATES_DIR_PATH = path.join(__dirname, "..", "templates")
const COMMANDS_TO_RUN_FILE_NAME = "CommandsToRun.txt"

const copyFiles = async (source: string, destination: string) => {
    return new Promise((resolve, reject) => {
        cp(source, destination, { recursive: true, filter: (src, _) => !src.endsWith(COMMANDS_TO_RUN_FILE_NAME) }, (error) => {
            if (error) reject(error)
            else resolve(null)
        })
    })
}

const runCommands = (commandsToRun: string[], workingDirectory: string) => {
    commandsToRun.forEach((commandToRun) => {
        if (!commandToRun) {
            return
        }

        execSync(commandToRun, { cwd: workingDirectory, stdio: "ignore" })
    })
}

const getCommandsToRun = (sourceFile: string): string[] => {
    if (!existsSync(sourceFile)) {
        return []
    }

    const commandsFileData = readFileSync(sourceFile, "utf-8")

    if (commandsFileData.includes("\r")) {
        return commandsFileData.split("\r\n")
    } else {
        return commandsFileData.split("\n")
    }
}

const getProjectDetailsFromUser = async () => {
    const availableProjectTypes = readdirSync(TEMPLATES_DIR_PATH)

    const projectDetails: { projectName: string; projectType: string; setupGit: boolean } = await inquirer.prompt([
        {
            type: "input",
            name: "projectName",
            message: "Project name:",
            filter: (input: string) => input.trim().replaceAll(" ", "-"),
        },
        {
            type: "list",
            name: "projectType",
            message: "Choose project type:",
            choices: availableProjectTypes,
        },
        {
            type: "confirm",
            default: true,
            name: "setupGit",
            message: "Do you want to add Git?",
        },
    ])

    return projectDetails
}

const setupGitRepository = (repositoryPath: string) => {
    const commandsToRun = ["git init", "git add .", 'git commit -m "Initial commit"']
    runCommands(commandsToRun, repositoryPath)
}

const main = async () => {
    const projectDetails = await getProjectDetailsFromUser()

    const TEMPLATE_PATH = path.join(TEMPLATES_DIR_PATH, projectDetails.projectType)
    const PROJECT_PATH = path.join(CWD, projectDetails.projectName)

    if (!existsSync(PROJECT_PATH)) {
        mkdirSync(PROJECT_PATH)
    }

    try {
        await copyFiles(TEMPLATE_PATH, PROJECT_PATH)

        const commandsToRun = getCommandsToRun(path.join(TEMPLATE_PATH, COMMANDS_TO_RUN_FILE_NAME))
        runCommands(commandsToRun, PROJECT_PATH)

        if (projectDetails.setupGit) {
            setupGitRepository(PROJECT_PATH)
        }
    } catch (error) {
        console.error(error)
        process.exit(1)
    }
}

main()
