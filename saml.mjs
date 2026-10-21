import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash,randomBytes} from 'node:crypto';

// Adaptador SAML SP-initiated para AWS IAM Identity Center.
// O pacote é necessário somente quando o SSO SAML é configurado.
export async function createSaml({db,origin,base}){
 const entryPoint=process.env.AWS_SAML_ENTRY_POINT,idpIssuer=process.env.AWS_SAML_IDP_ISSUER,certFile=process.env.AWS_SAML_CERT_FILE;
 if(!entryPoint||!idpIssuer||!certFile)return {enabled:false};
 if(!origin.startsWith('https:')||!entryPoint.startsWith('https:'))throw Error('IAM Identity Center SAML requer APP_ORIGIN e endpoint HTTPS.');
 const {SAML}=await import('@node-saml/node-saml');
 const issuer=origin+'/auth/identity-center/metadata',callbackUrl=origin+'/auth/identity-center/callback';
 const saml=new SAML({entryPoint,idpIssuer,issuer,audience:issuer,callbackUrl,idpCert:await readFile(resolve(base,certFile),'utf8'),validateInResponseTo:'always',requestIdExpirationPeriodMs:600000,maxAssertionAgeMs:300000,acceptedClockSkewMs:30000,wantAssertionsSigned:true,wantAuthnResponseSigned:true,disableRequestedAuthnContext:true,identifierFormat:'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',signatureAlgorithm:'sha256',digestAlgorithm:'sha256'});
 db.exec('CREATE TABLE IF NOT EXISTS saml_flows(relay TEXT PRIMARY KEY,browser TEXT,expires INTEGER)');
 const digest=s=>createHash('sha256').update(s).digest('hex'),random=()=>randomBytes(32).toString('base64url');
 return {enabled:true,metadata:()=>saml.generateServiceProviderMetadata(null,null),async start(res){const relay=random(),browser=random();db.prepare('DELETE FROM saml_flows WHERE expires<?').run(Date.now());db.prepare('INSERT INTO saml_flows VALUES(?,?,?)').run(digest(relay),digest(browser),Date.now()+600000);res.setHeader('Set-Cookie',`iq_saml=${browser}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=600`);return saml.getAuthorizeUrlAsync(relay,undefined,{})},async consume(req){let text='';for await(const c of req){text+=c;if(Buffer.byteLength(text)>1024*1024)throw Error('Resposta SAML muito grande');}const form=new URLSearchParams(text),relay=form.get('RelayState')||'',browser=(req.headers.cookie||'').split(';').map(c=>c.trim()).find(c=>c.startsWith('iq_saml='))?.slice(8)||'';const flow=db.prepare('SELECT * FROM saml_flows WHERE relay=?').get(digest(relay));db.prepare('DELETE FROM saml_flows WHERE relay=?').run(digest(relay));if(!flow||flow.expires<Date.now()||flow.browser!==digest(browser))throw Error('Fluxo SAML não vinculado ao navegador');const {profile}=await saml.validatePostResponseAsync({SAMLResponse:form.get('SAMLResponse')||''});if(!profile?.nameID||profile.issuer!==idpIssuer)throw Error('Identidade SAML inválida');return {issuer:idpIssuer,subject:profile.nameID,name:String(profile.displayName||profile.nameID).slice(0,24)}}};
}
