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




cron.schedule('* 23 * * *', function () {
    // วิ นาที ชมโมง วัน เดือน วันใน7วัน
    let dir = './backup';
    fse.ensureDirSync(dir)
    let dirBackup = path.join(dir, moment().format('YYYY_MM_DD'));
    fse.ensureDirSync(dirBackup)
    // fse.ensureDir(dir, err => {
    getConnection().then((result) => {
        console.log('start backup');
        for (const r of result) {

            let fileName = r.dbName + '.sql'
            let filepath = path.join(dirBackup, fileName);
            if (!shelljs.which('mysqldump')) {
                shelljs.echo('Sorry, this script requires mysqldump');
                shelljs.exit(1);
            } else {
                shelljs.echo(`Ok starting backup ${r.dbName}`);
                let cmd = `mysqldump --host=${r.dbHost} --port=3306 --add-drop-table ${r.dbName} --user=${r.dbUser} --password=${r.dbPassword} > ${filepath} `
                shelljs.exec(cmd, async (code, stdout, stderr) => {
                    if (code !== 0) {
                        shelljs.echo(`${dirBackup} - error ${r.dbName}`);
                    } else {
                        shelljs.echo(`${dirBackup}- Success ${r.dbName}`);
                    }
                });
            }
        }
        console.log('Success backup');

    });
});
