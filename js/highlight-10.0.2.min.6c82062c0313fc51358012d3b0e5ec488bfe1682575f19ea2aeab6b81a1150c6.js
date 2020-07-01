import deepFreeze from './vendor/deep_freeze';import TokenTreeEmitter from './lib/token_tree';import*as regex from './lib/regex';import*as utils from './lib/utils';import*as MODES from './lib/modes';import{compileLanguage}from './lib/mode_compiler';import*as packageJSON from '../package.json';const escape=utils.escapeHTML;const inherit=utils.inherit;const{nodeStream,mergeStreams}=utils;const HLJS=function(hljs){var ArrayProto=[];var languages={},aliases={},plugins=[];var SAFE_MODE=true;var fixMarkupRe=/((^(<[^>]+>|\t|)+|(?:\n)))/gm;var LANGUAGE_NOT_FOUND="Could not find the language '{}', did you forget to load/include a language module?";var options={noHighlightRe:/^(no-?highlight)$/i,languageDetectRe:/\blang(?:uage)?-([\w-]+)\b/i,classPrefix:'hljs-',tabReplace:null,useBR:false,languages:undefined,__emitter:TokenTreeEmitter};function shouldNotHighlight(language){return options.noHighlightRe.test(language);}
function blockLanguage(block){var match;var classes=block.className+' ';classes+=block.parentNode?block.parentNode.className:'';match=options.languageDetectRe.exec(classes);if(match){var language=getLanguage(match[1]);if(!language){console.warn(LANGUAGE_NOT_FOUND.replace("{}",match[1]));console.warn("Falling back to no-highlight mode for this block.",block);}
return language?match[1]:'no-highlight';}
return classes.split(/\s+/).find((_class)=>shouldNotHighlight(_class)||getLanguage(_class));}
function highlight(languageName,code,ignore_illegals,continuation){var context={code,language:languageName};fire("before:highlight",context);var result=context.result?context.result:_highlight(context.language,context.code,ignore_illegals,continuation);result.code=context.code;fire("after:highlight",result);return result;}
function _highlight(languageName,code,ignore_illegals,continuation){var codeToHighlight=code;function endOfMode(mode,lexeme){if(regex.startsWith(mode.endRe,lexeme)){while(mode.endsParent&&mode.parent){mode=mode.parent;}
return mode;}
if(mode.endsWithParent){return endOfMode(mode.parent,lexeme);}}
function keywordMatch(mode,match){var match_str=language.case_insensitive?match[0].toLowerCase():match[0];return mode.keywords.hasOwnProperty(match_str)&&mode.keywords[match_str];}
function processKeywords(){var keyword_match,last_index,match,result,buf;if(!top.keywords){emitter.addText(mode_buffer);return;}
last_index=0;top.lexemesRe.lastIndex=0;match=top.lexemesRe.exec(mode_buffer);buf="";while(match){buf+=mode_buffer.substring(last_index,match.index);keyword_match=keywordMatch(top,match);var kind=null;if(keyword_match){emitter.addText(buf);buf="";relevance+=keyword_match[1];kind=keyword_match[0];emitter.addKeyword(match[0],kind);}else{buf+=match[0];}
last_index=top.lexemesRe.lastIndex;match=top.lexemesRe.exec(mode_buffer);}
buf+=mode_buffer.substr(last_index);emitter.addText(buf);}
function processSubLanguage(){if(mode_buffer==="")return;var explicit=typeof top.subLanguage==='string';if(explicit&&!languages[top.subLanguage]){emitter.addText(mode_buffer);return;}
var result=explicit?_highlight(top.subLanguage,mode_buffer,true,continuations[top.subLanguage]):highlightAuto(mode_buffer,top.subLanguage.length?top.subLanguage:undefined);if(top.relevance>0){relevance+=result.relevance;}
if(explicit){continuations[top.subLanguage]=result.top;}
emitter.addSublanguage(result.emitter,result.language);}
function processBuffer(){if(top.subLanguage!=null)
processSubLanguage();else
processKeywords();mode_buffer='';}
function startNewMode(mode){if(mode.className){emitter.openNode(mode.className);}
top=Object.create(mode,{parent:{value:top}});}
function doIgnore(lexeme){if(top.matcher.regexIndex===0){mode_buffer+=lexeme[0];return 1;}else{continueScanAtSamePosition=true;return 0;}}
function doBeginMatch(match){var lexeme=match[0];var new_mode=match.rule;if(new_mode.__onBegin){let res=new_mode.__onBegin(match)||{};if(res.ignoreMatch)
return doIgnore(lexeme);}
if(new_mode&&new_mode.endSameAsBegin){new_mode.endRe=regex.escape(lexeme);}
if(new_mode.skip){mode_buffer+=lexeme;}else{if(new_mode.excludeBegin){mode_buffer+=lexeme;}
processBuffer();if(!new_mode.returnBegin&&!new_mode.excludeBegin){mode_buffer=lexeme;}}
startNewMode(new_mode);return new_mode.returnBegin?0:lexeme.length;}
function doEndMatch(match){var lexeme=match[0];var matchPlusRemainder=codeToHighlight.substr(match.index);var end_mode=endOfMode(top,matchPlusRemainder);if(!end_mode){return;}
var origin=top;if(origin.skip){mode_buffer+=lexeme;}else{if(!(origin.returnEnd||origin.excludeEnd)){mode_buffer+=lexeme;}
processBuffer();if(origin.excludeEnd){mode_buffer=lexeme;}}
do{if(top.className){emitter.closeNode();}
if(!top.skip&&!top.subLanguage){relevance+=top.relevance;}
top=top.parent;}while(top!==end_mode.parent);if(end_mode.starts){if(end_mode.endSameAsBegin){end_mode.starts.endRe=end_mode.endRe;}
startNewMode(end_mode.starts);}
return origin.returnEnd?0:lexeme.length;}
function processContinuations(){var list=[];for(var current=top;current!==language;current=current.parent){if(current.className){list.unshift(current.className);}}
list.forEach(item=>emitter.openNode(item));}
var lastMatch={};function processLexeme(text_before_match,match){var err;var lexeme=match&&match[0];mode_buffer+=text_before_match;if(lexeme==null){processBuffer();return 0;}
if(lastMatch.type=="begin"&&match.type=="end"&&lastMatch.index==match.index&&lexeme===""){mode_buffer+=codeToHighlight.slice(match.index,match.index+1);if(!SAFE_MODE){err=new Error('0 width match regex');err.languageName=languageName;err.badRule=lastMatch.rule;throw(err);}
return 1;}
lastMatch=match;if(match.type==="begin"){return doBeginMatch(match);}else if(match.type==="illegal"&&!ignore_illegals){err=new Error('Illegal lexeme "'+lexeme+'" for mode "'+(top.className||'<unnamed>')+'"');err.mode=top;throw err;}else if(match.type==="end"){var processed=doEndMatch(match);if(processed!=undefined)
return processed;}
if(match.type==="illegal"&&lexeme===""){return 1;}
if(iterations>100000&&iterations>match.index*3){const err=new Error('potential infinite loop, way more iterations than matches');throw err;}
mode_buffer+=lexeme;return lexeme.length;}
var language=getLanguage(languageName);if(!language){console.error(LANGUAGE_NOT_FOUND.replace("{}",languageName));throw new Error('Unknown language: "'+languageName+'"');}
compileLanguage(language);var top=continuation||language;var continuations={};var result;var emitter=new options.__emitter(options);processContinuations();var mode_buffer='';var relevance=0;var match;var processedCount;var index=0;var iterations=0;var continueScanAtSamePosition=false;try{top.matcher.considerAll();for(;;){iterations++;if(continueScanAtSamePosition){continueScanAtSamePosition=false;}else{top.matcher.lastIndex=index;top.matcher.considerAll();}
match=top.matcher.exec(codeToHighlight);if(!match)
break;let beforeMatch=codeToHighlight.substring(index,match.index);processedCount=processLexeme(beforeMatch,match);index=match.index+processedCount;}
processLexeme(codeToHighlight.substr(index));emitter.closeAllNodes();emitter.finalize();result=emitter.toHTML();return{relevance:relevance,value:result,language:languageName,illegal:false,emitter:emitter,top:top};}catch(err){if(err.message&&err.message.includes('Illegal')){return{illegal:true,illegalBy:{msg:err.message,context:codeToHighlight.slice(index-100,index+100),mode:err.mode},sofar:result,relevance:0,value:escape(codeToHighlight),emitter:emitter,};}else if(SAFE_MODE){return{relevance:0,value:escape(codeToHighlight),emitter:emitter,language:languageName,top:top,errorRaised:err};}else{throw err;}}}
function justTextHighlightResult(code){const result={relevance:0,emitter:new options.__emitter(options),value:escape(code),illegal:false,top:PLAINTEXT_LANGUAGE};result.emitter.addText(code)
return result;}
function highlightAuto(code,languageSubset){languageSubset=languageSubset||options.languages||Object.keys(languages);var result=justTextHighlightResult(code)
var second_best=result;languageSubset.filter(getLanguage).filter(autoDetection).forEach(function(name){var current=_highlight(name,code,false);current.language=name;if(current.relevance>second_best.relevance){second_best=current;}
if(current.relevance>result.relevance){second_best=result;result=current;}});if(second_best.language){result.second_best=second_best;}
return result;}
function fixMarkup(value){if(!(options.tabReplace||options.useBR)){return value;}
return value.replace(fixMarkupRe,function(match,p1){if(options.useBR&&match==='\n'){return '<br>';}else if(options.tabReplace){return p1.replace(/\t/g,options.tabReplace);}
return '';});}
function buildClassName(prevClassName,currentLang,resultLang){var language=currentLang?aliases[currentLang]:resultLang,result=[prevClassName.trim()];if(!prevClassName.match(/\bhljs\b/)){result.push('hljs');}
if(!prevClassName.includes(language)){result.push(language);}
return result.join(' ').trim();}
function highlightBlock(block){var node,originalStream,result,resultNode,text;var language=blockLanguage(block);if(shouldNotHighlight(language))
return;fire("before:highlightBlock",{block:block,language:language});if(options.useBR){node=document.createElement('div');node.innerHTML=block.innerHTML.replace(/\n/g,'').replace(/<br[ \/]*>/g,'\n');}else{node=block;}
text=node.textContent;result=language?highlight(language,text,true):highlightAuto(text);originalStream=nodeStream(node);if(originalStream.length){resultNode=document.createElement('div');resultNode.innerHTML=result.value;result.value=mergeStreams(originalStream,nodeStream(resultNode),text);}
result.value=fixMarkup(result.value);fire("after:highlightBlock",{block:block,result:result});block.innerHTML=result.value;block.className=buildClassName(block.className,language,result.language);block.result={language:result.language,re:result.relevance};if(result.second_best){block.second_best={language:result.second_best.language,re:result.second_best.relevance};}}
function configure(user_options){options=inherit(options,user_options);}
function initHighlighting(){if(initHighlighting.called)
return;initHighlighting.called=true;var blocks=document.querySelectorAll('pre code');ArrayProto.forEach.call(blocks,highlightBlock);}
function initHighlightingOnLoad(){window.addEventListener('DOMContentLoaded',initHighlighting,false);}
const PLAINTEXT_LANGUAGE={disableAutodetect:true,name:'Plain text'};function registerLanguage(name,language){var lang;try{lang=language(hljs);}
catch(error){console.error("Language definition for '{}' could not be registered.".replace("{}",name));if(!SAFE_MODE){throw error;}else{console.error(error);}
lang=PLAINTEXT_LANGUAGE;}
if(!lang.name)
lang.name=name;languages[name]=lang;lang.rawDefinition=language.bind(null,hljs);if(lang.aliases){lang.aliases.forEach(function(alias){aliases[alias]=name;});}}
function listLanguages(){return Object.keys(languages);}
function requireLanguage(name){var lang=getLanguage(name);if(lang){return lang;}
var err=new Error('The \'{}\' language is required, but not loaded.'.replace('{}',name));throw err;}
function getLanguage(name){name=(name||'').toLowerCase();return languages[name]||languages[aliases[name]];}
function autoDetection(name){var lang=getLanguage(name);return lang&&!lang.disableAutodetect;}
function addPlugin(plugin,options){plugins.push(plugin);}
function fire(event,args){var cb=event;plugins.forEach(function(plugin){if(plugin[cb]){plugin[cb](args);}});}
Object.assign(hljs,{highlight,highlightAuto,fixMarkup,highlightBlock,configure,initHighlighting,initHighlightingOnLoad,registerLanguage,listLanguages,getLanguage,requireLanguage,autoDetection,inherit,addPlugin});hljs.debugMode=function(){SAFE_MODE=false;};hljs.safeMode=function(){SAFE_MODE=true;};hljs.versionString=packageJSON.version;for(const key in MODES){if(typeof MODES[key]==="object")
deepFreeze(MODES[key]);}
Object.assign(hljs,MODES);return hljs;};export default HLJS({});