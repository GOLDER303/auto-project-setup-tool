import { CommandToRun, FileToCopy, PrismaClient } from "@prisma/client"
import { exec } from "child_process"
import { copyFile, existsSync, mkdirSync } from "fs"
import inquirer from "inquirer"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const CWD = process.cwd()

const prisma = new PrismaClient()

const copyFiles = async (filesToCopy: FileToCopy[], destinationPath: string) => {
    const copyFilePromises = filesToCopy.map((fileToCopy) => {
        return new Promise((resolve, reject) => {
            if (fileToCopy.destinationDirectory) {
                destinationPath = path.join(destinationPath, fileToCopy.destinationDirectory)
            }

            if (!existsSync(destinationPath)) {
                mkdirSync(destinationPath)
            }

            copyFile(path.join(__dirname, fileToCopy.filePath), path.join(destinationPath, fileToCopy.fileName), (error) => {
                if (error) reject(error)
                else resolve(null)
            })
        })
    })

    return Promise.all(copyFilePromises)
}

const runCommands = (commandsToRun: CommandToRun[], workingDirectory: string) => {
    commandsToRun.forEach((commandToRun) => {
        exec(commandToRun.command, { cwd: workingDirectory }, (error, _, stderr) => {
            if (error) {
                throw error
            } else if (stderr) {
                throw stderr
            }
        })
    })
}

const getProjectDetailsFromUser = async () => {
    const availableProjectTypes = await prisma.projectType.findMany()

    const projectDetails: { projectName: string; projectType: string } = await inquirer.prompt([
        {
            type: "input",
            name: "projectName",
            message: "Project name:",
        },
        {
            type: "list",
            name: "projectType",
            message: "Choose project type:",
            choices: availableProjectTypes,
        },
    ])

    return projectDetails
}

const main = async () => {
    const projectDetails = await getProjectDetailsFromUser()

    const PROJECT_PATH = CWD + projectDetails.projectName == "." ? "" : projectDetails.projectName
    if (!existsSync(PROJECT_PATH)) {
        mkdirSync(PROJECT_PATH)
    }

    const projectType = await prisma.projectType.findUniqueOrThrow({ where: { name: projectDetails.projectType }, include: { commandsToRun: true, filesToCopy: true } })

    try {
        await copyFiles(projectType.filesToCopy, PROJECT_PATH)
        runCommands(projectType.commandsToRun, PROJECT_PATH)
    } catch (error) {
        console.error(error)
        process.exit(1)
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (error) => {
        console.error(error)
        await prisma.$disconnect()
        process.exit(1)
    })
