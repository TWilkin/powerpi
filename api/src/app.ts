import bodyParser from 'body-parser';
import Path from 'path';
import { ServerLoader, ServerSettings } from '@tsed/common';

const rootDir = Path.resolve(__dirname);

@ServerSettings({
    rootDir: rootDir,
    httpPort: 3000,
    httpsPort: false,
    mount: {
        '/': [
            `${rootDir}/controllers/*.ts`
        ]
    },
    acceptMimes: ['application/json']
})
export default class Server extends ServerLoader {
    public $beforeRoutesInit() {
        this.use(bodyParser.json())
    }
};

new Server().start();
