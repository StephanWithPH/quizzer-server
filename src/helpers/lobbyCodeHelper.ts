import { LOBBY_CODE_CHARACTERS_AMOUNT } from '../config/config';

export const generateLobbyCode = () => {
    let code = "";
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const charactersLength = alphabet.length;
    for (let i = 0; i < LOBBY_CODE_CHARACTERS_AMOUNT; i++) {
        code += alphabet.charAt(Math.floor(Math.random() * charactersLength));
    }
    return code;
};
