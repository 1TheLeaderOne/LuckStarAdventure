import {lib,game,ui,get,ai,_status} from '../../../noname.js'

let basicPath = lib.init.getCurrentFileLocation(import.meta.url);

const basic={
    extensionDirectoryPath:basicPath.slice(0,basicPath.lastIndexOf('source/basic.js'))
};

export default basic;