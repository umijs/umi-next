(function(){"use strict";var e={660:function(e){e.exports=({onlyFirst:e=false}={})=>{const r=["[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)","(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))"].join("|");return new RegExp(r,e?undefined:"g")}},744:function(e,r,_){const n=_(660);e.exports=e=>typeof e==="string"?e.replace(n(),""):e}};var r={};function __nccwpck_require__(_){var n=r[_];if(n!==undefined){return n.exports}var t=r[_]={exports:{}};var i=true;try{e[_](t,t.exports,__nccwpck_require__);i=false}finally{if(i)delete r[_]}return t.exports}if(typeof __nccwpck_require__!=="undefined")__nccwpck_require__.ab=__dirname+"/";var _=__nccwpck_require__(744);module.exports=_})();