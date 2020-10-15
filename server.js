const cron = require('node-cron');
const mysqldump = require('mysqldump');
const moment = require('moment');
const fse = require('fs-extra');
const fs = require('fs');
const shelljs = require('shelljs');
const path = require('path');




async function getConnection() {
    try {
        const json = await fse.readJson('./connection.json');
        return json;
    } catch (err) {
        console.error(err)
    }
}

async function backup() {
    try {

        let dir = './backup';
        fse.ensureDirSync(dir)
        let dirBackup = path.join(dir, moment().format('YYYY_MM_DD'));
        fse.ensureDirSync(dirBackup)
        // fse.ensureDir(dir, err => {
        getConnection().then((result) => {
            console.log('start backup');
            for (const r of result) {
                let fileName = '';
                if (r.dbSaveName) {
                    fileName = r.dbSaveName + '.sql'
                } else {
                    fileName = r.dbName + '.sql'
                }
                let filepath = path.join(dirBackup, fileName);
                if (!shelljs.which('mysqldump')) {
                    shelljs.echo('Sorry, this script requires mysqldump');
                    shelljs.exit(1);
                } else {
                    shelljs.echo(`Ok starting backup ${fileName}`);
                    let cmd = `mysqldump --host=${r.dbHost} --port=3306 --add-drop-table ${r.dbName} --user=${r.dbUser} --password=${r.dbPassword} > ${filepath} `
                    shelljs.exec(cmd, async (code, stdout, stderr) => {
                        if (code !== 0) {
                            shelljs.echo(`${dirBackup} - error ${fileName}`);
                        } else {
                            shelljs.echo(`${dirBackup}- Success ${fileName}`);
                        }
                    });
                }
            }
            console.log('Success backup');

        });
    } catch (err) {
        console.error(err)
    }
}


backup();


