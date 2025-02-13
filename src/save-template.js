const generateNewTemplateId = require('./generate-new-template-id');
const request = require('request');
const logger = require('./logger');

/**
 * store, store name
 * name, name of the template
 * html, content to save
* {
    store: 'modaoriginal',
    name: 'new-template',
    html: HTML,
  } 
*/
module.exports = async function(opts, cb) {
  let baseUrl = '.vtexcommercestable.com.br/admin/a/PortalManagement/SaveTemplate';
  let url = `https://${opts.store}${baseUrl}`;
  let templateId = opts.id || generateNewTemplateId(opts.name);
  let actionForm = (opts.id) ? 'Update' : 'Save';
  const log = opts.log !== false;
  
  try {
    return request({
      headers: {
        'Cache-Control': 'no-cache',
        'Accept': '*/*',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Cookie': `VtexIdclientAutCookie=${opts.authCookie};`,
      },
      method: 'POST',
      url: url,
      form: {
        templatename: opts.name,
        templateId: templateId,
        template: opts.html,   
        isSub: false,
        actionForm: actionForm,
        textConfirm: 'sim'
      }
    }, function(error, response, body){
      let success = false;
      if(error) {
        log && console.error(`\u001b[31m[ERROR] \u001b[0mTemplate ${opts.name} was not saved: `, error);
      }
      if(response.statusCode === 200 && !/originalMessage/.test(body)) {
        log && console.log(`\u001b[32m[SUCCESS] \u001b[0mTemplate ${opts.name} was saved on ${opts.store}`);
        success = true;
      } else {
        log && console.error(`\u001b[31m[ERROR] \u001b[0mTemplate ${opts.name} was not saved!`);
        log && console.error(`* check the logs! ./.vtex-deploy`);
      }

      logger(opts, body);
      if(typeof cb == 'function'){
        cb(success ? templateId : undefined);
      }
    });
  } catch(err) { 
    log && console.error(`\u001b[31m[ERROR] \u001b[0mTemplate ${opts.name} was not saved error: ${err}`); 
    if(typeof cb == 'function'){
      cb(null);
    }
  }
};
