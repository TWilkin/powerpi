import bodyParser from 'body-parser';
import cors from 'cors';
import Path from 'path';
import { ServerLoader, ServerSettings } from '@tsed/common';

const rootDir = Path.resolve(__dirname);

@ServerSettings({
    rootDir: rootDir,
    httpPort: 3000,
    httpsPort: false,
    mount: {
        '/api': [
            `${rootDir}/controllers/*.ts`
        ]
    },
    acceptMimes: ['application/json']
})
export default class Server extends ServerLoader {
    public $beforeRoutesInit() {
        this
            .use(cors({
                origin: true,
                methods: [ 'GET', 'POST' ],
                allowedHeaders: ['Content-Type', 'X-User']
            }))
            .use(bodyParser.json())
    }
};

new Server().start();
