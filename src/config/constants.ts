import path from 'node:path';

export const STATIC_FOLDER_NAME = 'static';

// Remove the last part of the path (/config)
const dir = __dirname.split(path.sep);
dir.pop();

export const STATIC_FOLDER = path.join(dir.join('/'), STATIC_FOLDER_NAME);
export const TEAM_IMAGES_FOLDER_NAME = '/images/teams';
export const TEAM_PLACEHOLDERS_FOLDER_NAME = '/images/placeholders';
export const TEAM_PLACEHOLDERS_FOLDER = STATIC_FOLDER + TEAM_PLACEHOLDERS_FOLDER_NAME;
