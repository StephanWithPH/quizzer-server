import path from 'node:path';
import fs from 'fs';
import { STATIC_FOLDER, STATIC_FOLDER_NAME, TEAM_IMAGES_FOLDER_NAME } from '../config/constants';
import crypto from 'crypto';

export function writeBase64ToFileInTargetFolder(image: string) {
    const targetFolder = path.join(STATIC_FOLDER, '/images/teams');
    const imgName = crypto.randomBytes(20).toString('hex');

    const imagePath = path.join(targetFolder, imgName + '.png');
    // Remove the base64 part from the image
    const imageBase64 = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(imageBase64, 'base64');

    // Create the target folder if it doesn't exist
    if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder, { recursive: true });
    }

    fs.writeFileSync(imagePath, buffer);

    return path.join(STATIC_FOLDER_NAME, TEAM_IMAGES_FOLDER_NAME, imgName + '.png');
}
