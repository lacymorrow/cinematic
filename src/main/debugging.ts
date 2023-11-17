// Add debugging extensions like `react-devtools` and `redux-devtools`
const installer = require('electron-devtools-installer');

const installExtensions = async () => {
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.warn);
};

const debugging = {
  installExtensions,
};

export default debugging;
