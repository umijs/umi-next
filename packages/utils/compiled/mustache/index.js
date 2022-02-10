(function(){var e={716:function(e){(function(t,r){true?e.exports=r():0})(this,(function(){"use strict";
/*!
   * mustache.js - Logic-less {{mustache}} templates with JavaScript
   * http://github.com/janl/mustache.js
   */var e=Object.prototype.toString;var t=Array.isArray||function isArrayPolyfill(t){return e.call(t)==="[object Array]"};function isFunction(e){return typeof e==="function"}function typeStr(e){return t(e)?"array":typeof e}function escapeRegExp(e){return e.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&")}function hasProperty(e,t){return e!=null&&typeof e==="object"&&t in e}function primitiveHasOwnProperty(e,t){return e!=null&&typeof e!=="object"&&e.hasOwnProperty&&e.hasOwnProperty(t)}var r=RegExp.prototype.test;function testRegExp(e,t){return r.call(e,t)}var n=/\S/;function isWhitespace(e){return!testRegExp(n,e)}var i={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#x2F;","`":"&#x60;","=":"&#x3D;"};function escapeHtml(e){return String(e).replace(/[&<>"'`=\/]/g,(function fromEntityMap(e){return i[e]}))}var a=/\s*/;var s=/\s+/;var o=/\s*=/;var p=/\s*\}/;var u=/#|\^|\/|>|\{|&|=|!/;function parseTemplate(e,r){if(!e)return[];var n=false;var i=[];var l=[];var f=[];var h=false;var d=false;var v="";var g=0;function stripSpace(){if(h&&!d){while(f.length)delete l[f.pop()]}else{f=[]}h=false;d=false}var y,w,m;function compileTags(e){if(typeof e==="string")e=e.split(s,2);if(!t(e)||e.length!==2)throw new Error("Invalid tags: "+e);y=new RegExp(escapeRegExp(e[0])+"\\s*");w=new RegExp("\\s*"+escapeRegExp(e[1]));m=new RegExp("\\s*"+escapeRegExp("}"+e[1]))}compileTags(r||c.tags);var x=new Scanner(e);var C,_,k,b,T,E;while(!x.eos()){C=x.pos;k=x.scanUntil(y);if(k){for(var S=0,W=k.length;S<W;++S){b=k.charAt(S);if(isWhitespace(b)){f.push(l.length);v+=b}else{d=true;n=true;v+=" "}l.push(["text",b,C,C+1]);C+=1;if(b==="\n"){stripSpace();v="";g=0;n=false}}}if(!x.scan(y))break;h=true;_=x.scan(u)||"name";x.scan(a);if(_==="="){k=x.scanUntil(o);x.scan(o);x.scanUntil(w)}else if(_==="{"){k=x.scanUntil(m);x.scan(p);x.scanUntil(w);_="&"}else{k=x.scanUntil(w)}if(!x.scan(w))throw new Error("Unclosed tag at "+x.pos);if(_==">"){T=[_,k,C,x.pos,v,g,n]}else{T=[_,k,C,x.pos]}g++;l.push(T);if(_==="#"||_==="^"){i.push(T)}else if(_==="/"){E=i.pop();if(!E)throw new Error('Unopened section "'+k+'" at '+C);if(E[1]!==k)throw new Error('Unclosed section "'+E[1]+'" at '+C)}else if(_==="name"||_==="{"||_==="&"){d=true}else if(_==="="){compileTags(k)}}stripSpace();E=i.pop();if(E)throw new Error('Unclosed section "'+E[1]+'" at '+x.pos);return nestTokens(squashTokens(l))}function squashTokens(e){var t=[];var r,n;for(var i=0,a=e.length;i<a;++i){r=e[i];if(r){if(r[0]==="text"&&n&&n[0]==="text"){n[1]+=r[1];n[3]=r[3]}else{t.push(r);n=r}}}return t}function nestTokens(e){var t=[];var r=t;var n=[];var i,a;for(var s=0,o=e.length;s<o;++s){i=e[s];switch(i[0]){case"#":case"^":r.push(i);n.push(i);r=i[4]=[];break;case"/":a=n.pop();a[5]=i[2];r=n.length>0?n[n.length-1][4]:t;break;default:r.push(i)}}return t}function Scanner(e){this.string=e;this.tail=e;this.pos=0}Scanner.prototype.eos=function eos(){return this.tail===""};Scanner.prototype.scan=function scan(e){var t=this.tail.match(e);if(!t||t.index!==0)return"";var r=t[0];this.tail=this.tail.substring(r.length);this.pos+=r.length;return r};Scanner.prototype.scanUntil=function scanUntil(e){var t=this.tail.search(e),r;switch(t){case-1:r=this.tail;this.tail="";break;case 0:r="";break;default:r=this.tail.substring(0,t);this.tail=this.tail.substring(t)}this.pos+=r.length;return r};function Context(e,t){this.view=e;this.cache={".":this.view};this.parent=t}Context.prototype.push=function push(e){return new Context(e,this)};Context.prototype.lookup=function lookup(e){var t=this.cache;var r;if(t.hasOwnProperty(e)){r=t[e]}else{var n=this,i,a,s,o=false;while(n){if(e.indexOf(".")>0){i=n.view;a=e.split(".");s=0;while(i!=null&&s<a.length){if(s===a.length-1)o=hasProperty(i,a[s])||primitiveHasOwnProperty(i,a[s]);i=i[a[s++]]}}else{i=n.view[e];o=hasProperty(n.view,e)}if(o){r=i;break}n=n.parent}t[e]=r}if(isFunction(r))r=r.call(this.view);return r};function Writer(){this.templateCache={_cache:{},set:function set(e,t){this._cache[e]=t},get:function get(e){return this._cache[e]},clear:function clear(){this._cache={}}}}Writer.prototype.clearCache=function clearCache(){if(typeof this.templateCache!=="undefined"){this.templateCache.clear()}};Writer.prototype.parse=function parse(e,t){var r=this.templateCache;var n=e+":"+(t||c.tags).join(":");var i=typeof r!=="undefined";var a=i?r.get(n):undefined;if(a==undefined){a=parseTemplate(e,t);i&&r.set(n,a)}return a};Writer.prototype.render=function render(e,t,r,n){var i=this.getConfigTags(n);var a=this.parse(e,i);var s=t instanceof Context?t:new Context(t,undefined);return this.renderTokens(a,s,r,e,n)};Writer.prototype.renderTokens=function renderTokens(e,t,r,n,i){var a="";var s,o,p;for(var u=0,c=e.length;u<c;++u){p=undefined;s=e[u];o=s[0];if(o==="#")p=this.renderSection(s,t,r,n,i);else if(o==="^")p=this.renderInverted(s,t,r,n,i);else if(o===">")p=this.renderPartial(s,t,r,i);else if(o==="&")p=this.unescapedValue(s,t);else if(o==="name")p=this.escapedValue(s,t,i);else if(o==="text")p=this.rawValue(s);if(p!==undefined)a+=p}return a};Writer.prototype.renderSection=function renderSection(e,r,n,i,a){var s=this;var o="";var p=r.lookup(e[1]);function subRender(e){return s.render(e,r,n,a)}if(!p)return;if(t(p)){for(var u=0,c=p.length;u<c;++u){o+=this.renderTokens(e[4],r.push(p[u]),n,i,a)}}else if(typeof p==="object"||typeof p==="string"||typeof p==="number"){o+=this.renderTokens(e[4],r.push(p),n,i,a)}else if(isFunction(p)){if(typeof i!=="string")throw new Error("Cannot use higher-order sections without the original template");p=p.call(r.view,i.slice(e[3],e[5]),subRender);if(p!=null)o+=p}else{o+=this.renderTokens(e[4],r,n,i,a)}return o};Writer.prototype.renderInverted=function renderInverted(e,r,n,i,a){var s=r.lookup(e[1]);if(!s||t(s)&&s.length===0)return this.renderTokens(e[4],r,n,i,a)};Writer.prototype.indentPartial=function indentPartial(e,t,r){var n=t.replace(/[^ \t]/g,"");var i=e.split("\n");for(var a=0;a<i.length;a++){if(i[a].length&&(a>0||!r)){i[a]=n+i[a]}}return i.join("\n")};Writer.prototype.renderPartial=function renderPartial(e,t,r,n){if(!r)return;var i=this.getConfigTags(n);var a=isFunction(r)?r(e[1]):r[e[1]];if(a!=null){var s=e[6];var o=e[5];var p=e[4];var u=a;if(o==0&&p){u=this.indentPartial(a,p,s)}var c=this.parse(u,i);return this.renderTokens(c,t,r,u,n)}};Writer.prototype.unescapedValue=function unescapedValue(e,t){var r=t.lookup(e[1]);if(r!=null)return r};Writer.prototype.escapedValue=function escapedValue(e,t,r){var n=this.getConfigEscape(r)||c.escape;var i=t.lookup(e[1]);if(i!=null)return typeof i==="number"&&n===c.escape?String(i):n(i)};Writer.prototype.rawValue=function rawValue(e){return e[1]};Writer.prototype.getConfigTags=function getConfigTags(e){if(t(e)){return e}else if(e&&typeof e==="object"){return e.tags}else{return undefined}};Writer.prototype.getConfigEscape=function getConfigEscape(e){if(e&&typeof e==="object"&&!t(e)){return e.escape}else{return undefined}};var c={name:"mustache.js",version:"4.2.0",tags:["{{","}}"],clearCache:undefined,escape:undefined,parse:undefined,render:undefined,Scanner:undefined,Context:undefined,Writer:undefined,set templateCache(e){l.templateCache=e},get templateCache(){return l.templateCache}};var l=new Writer;c.clearCache=function clearCache(){return l.clearCache()};c.parse=function parse(e,t){return l.parse(e,t)};c.render=function render(e,t,r,n){if(typeof e!=="string"){throw new TypeError('Invalid template! Template should be a "string" '+'but "'+typeStr(e)+'" was given as the first '+"argument for mustache#render(template, view, partials)")}return l.render(e,t,r,n)};c.escape=escapeHtml;c.Scanner=Scanner;c.Context=Context;c.Writer=Writer;return c}))}};var t={};function __nccwpck_require__(r){var n=t[r];if(n!==undefined){return n.exports}var i=t[r]={exports:{}};var a=true;try{e[r].call(i.exports,i,i.exports,__nccwpck_require__);a=false}finally{if(a)delete t[r]}return i.exports}if(typeof __nccwpck_require__!=="undefined")__nccwpck_require__.ab=__dirname+"/";var r=__nccwpck_require__(716);module.exports=r})();