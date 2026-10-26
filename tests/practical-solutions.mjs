// Soluções somente para testes do laboratório; não são servidas ao navegador.
export const solutions={
 'raios-1':{command:'chmod u+x deploy.sh'},'raios-8':{command:'journalctl -u nginx'},'raios-15':{command:'kill -15 4242'},
 'aurora-1':{command:'Get-Service -Name Spooler'},'aurora-8':{command:'Get-Process -Name appworker'},'aurora-15':{command:'Get-WinEvent -LogName System -MaxEvents 5'},
 'clouds-1':{entry:'balancer',zoneA:'app',zoneB:'app',data:'replicated'},'clouds-8':{min:'2',max:'6',metric:'cpu',target:'70'},'clouds-15':{storage:'object',access:'restricted',encryption:'on'},
 'mist-1':{source:'vpn',protocol:'tcp',port:'443'},'mist-8':{site:'A',mail:'MX',verification:'TXT'},'mist-15':{photos:'object',database:'block',temporary:'cache'},
 'nimbus-1':{policy:JSON.stringify({Version:'2012-10-17',Statement:[{Effect:'Allow',Action:['s3:GetObject'],Resource:['arn:aws:s3:::nexus-reports/relatorios/*']}]})},
 'nimbus-8':{identity:'workload',duration:'900',scope:'minimal'},'nimbus-15':{ana:'viewer',bia:'operator',caio:'auditor'},
 'storm-1':{order:['diagnose','contain','restore','validate']},'storm-8':{attempts:'3',delay:'backoff',jitter:'on',idempotency:'on'},'storm-15':{backup:'15',restore:'60',test:'tested'}
};
