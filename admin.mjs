import {DatabaseSync} from 'node:sqlite';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createInterface} from 'node:readline/promises';
let [command,username]=process.argv.slice(2);
if(!command){const prompt=createInterface({input:process.stdin,output:process.stdout});console.log('Cadastre sua conta no jogo antes de usar esta ferramenta local.');username=(await prompt.question('Usuario que recebera permissao de administrador: ')).trim();command='grant';prompt.close()}
if(!['grant','revoke'].includes(command)||!username){console.error('Uso: node admin.mjs grant nome-do-usuario\n     node admin.mjs revoke nome-do-usuario');process.exit(1)}
const db=new DatabaseSync(resolve(dirname(fileURLToPath(import.meta.url)),'data/infraquest.sqlite'));
const user=db.prepare('SELECT id,username FROM users WHERE lower(username)=lower(?)').get(username);
if(!user){console.error('Cadastre a conta no jogo primeiro.');process.exit(1)}
if(command==='grant')db.prepare('INSERT OR IGNORE INTO admins VALUES(?)').run(user.id);else db.prepare('DELETE FROM admins WHERE uid=?').run(user.id);
db.prepare('INSERT INTO audit(actor,action,target,created) VALUES(?,?,?,?)').run('local-operator',command+'-admin',user.id,Date.now());db.close();console.log(`Permissão administrativa ${command==='grant'?'concedida':'revogada'} para ${user.username}. Entre novamente no jogo.`);
