import { PrismaClient } from "@prisma/client"
import { exec } from "child_process"
import { copyFile, existsSync, mkdirSync } from "fs"
import inquirer from "inquirer"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const CWD = process.cwd()

const prisma = new PrismaClient()

const main = async () => {
    const availableProjectTypes = await prisma.projectType.findMany()

    const setupAnswers: { projectName: string; projectType: string } = await inquirer.prompt([
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

    const PROJECT_TYPE = setupAnswers.projectType

    const PROJECT_PATH = CWD + setupAnswers.projectName == "." ? "" : setupAnswers.projectName
    if (!existsSync(PROJECT_PATH)) {
        mkdirSync(PROJECT_PATH)
    }

    const projectType = await prisma.projectType.findUniqueOrThrow({ where: { name: PROJECT_TYPE }, include: { commandsToRun: true, filesToCopy: true } })

    const copyFilePromises = projectType.filesToCopy.map((fileToCopy) => {
        return new Promise((resolve, reject) => {
            let destinationPath = PROJECT_PATH

            if (fileToCopy.destinationDirectory) {
                destinationPath = path.join(PROJECT_PATH, fileToCopy.destinationDirectory)
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

    try {
        await Promise.all(copyFilePromises)
    } catch (error) {
        console.error(error)
        process.exit(1)
    }

    projectType.commandsToRun.forEach((commandToRun) => {
        exec(commandToRun.command, { cwd: PROJECT_PATH }, (error, _, stderr) => {
            if (error) {
                console.error(error)
                process.exit(1)
            } else if (stderr) {
                console.error(error)
                process.exit(1)
            }
        })
    })
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
