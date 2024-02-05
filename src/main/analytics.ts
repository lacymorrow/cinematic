import { initialize as aptabase } from '@aptabase/electron/main';

const initialize = () => {
	aptabase('A-US-6138101850'); // 👈 this is where you enter your App Key
};

export default {
	initialize,
};
