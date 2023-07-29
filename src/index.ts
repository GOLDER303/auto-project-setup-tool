import { PrismaClient } from "@prisma/client"
import { exec } from "child_process"
import { copyFile } from "fs"

const PROJECT_PATH = process.argv[2]
const PROJECT_TYPE = process.argv[3]

const prisma = new PrismaClient()

const main = async () => {
    const projectType = await prisma.projectType.findUniqueOrThrow({ where: { name: PROJECT_TYPE }, include: { commandsToRun: true, filesToCopy: true } })

    const copyFilePromises = projectType.filesToCopy.map((fileToCopy) => {
        return new Promise((resolve, reject) => {
            copyFile(fileToCopy.filePath, PROJECT_PATH + fileToCopy.fileName, (error) => {
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
