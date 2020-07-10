/*

Discord bot, Botchi

Excute
http://excute.xyz
oys1751@gmail.com
Twitter	: @Excute
Github	: https://github.com/Excute

*/

/**
 * @todo	Use forEach or for-of instead of Array.map()
 */

"use strict";

require("dotenv").config();

const Discord = require("discord.js"); // For discord API
const Os = require("os"); // For system uptime, ip address
const Process = require("process"); // For process uptime
const PublicIp = require("public-ip"); // For ip address
const Http = require("http"); // For request
const Https = require("https");
const { google } = require("googleapis"); // For google APIs
const CustomSearch = google.customsearch("v1");
const CustomSearchJP = google.customsearch("v1");
const HtmlEntities = require("html-entities").AllHtmlEntities;
// const Convert = ConvertApi.auth({ secret: process.env.CONVERT_API_SECRET });

const Bot = new Discord.Client();
const BOT_TOKEN = process.env.BOT_TOKEN;
const BOT_PREFIX = process.env.BOT_PREFIX;

const BOT_ID_PUBLIC = process.env.BOT_ID_PUBLIC;
const BOT_ID_LOCAL = process.env.BOT_ID_LOCAL;
const BOT_ID_PROTOTYPE = process.env.BOT_ID_PROTOTYPE;

var BOT_SELF_ID = "";
const DEVELOPER_ID = process.env.DEVELOPER_ID;
const DEVELOPER_DMID = process.env.DEVELOPER_DMID;

const LOGGING_GUILD_ID = process.env.LOGGING_GUILD_ID;
const LOGGING_CHANNEL_ID = process.env.LOGGING_CHANNEL_ID;
const DEVS_ROLE_ID = process.env.DEVS_ROLE_ID;

const GOOGLE_API_KEY_KR = process.env.GOOGLE_API_KEY_KR;
const GOOGLE_API_KEY_JP = process.env.GOOGLE_API_KEY_JP;
const CSE_ID_KR = process.env.CSE_ID_KR;
const CSE_ID_JP = process.env.CSE_ID_JP;

/**
 * @typedef	{object}	Command
 * @property	{string}	command	Command name
 * @property	{Array<string>}	inputs
 * @property	{Array<CommandOption>}	options
 * @property	{string}	short_usage
 * @property	{string}	usage
 * @property	{boolean}	visible
 * @property	{boolean}	public	Whether public only or not
 */

/**
 * @typedef	{object}	CommandOption
 * @property	{string}	name
 * @property	{Array<string>}	inputs
 * @property	{boolean}	need_arg
 * @property	{string}	usage
 */

/**	@type	{Array<Command>} */
const Commands = require("./commands.json");
// const AllCommands = require("./commands.json");
// var Commands = [];
const OPTION_PREFIX = "--";

const COLOR_GREEN = 0x4caf50;
const COLOR_INFO = 0x2196f3;
const COLOR_WARN = 0xffc107;
const COLOR_ERROR = 0xf44336;
const COLOR_DEBUG = 0x9c27b0;

const MSG_TEXT_LIMIT = 2048; // description, footer.text
const MSG_TITLE_LIMIT = 256; // title, field.name, author.name
const MSG_FIELDS_LIMIT = 25; // fields
const MSG_VALUE_LIMIT = 1024; // field.value
const MSG_EMBED_TOTAL_LIMIT = 6000;

const DICE_LIMIT = 200;

/**
 *
 * @enum	{string}
 */
const CONSOLE_COLOR_CODE = {
	Reset: "\x1b[0m",
	Bright: "\x1b[1m",
	Dim: "\x1b[2m",
	Underscore: "\x1b[4m",
	Blink: "\x1b[5m",
	Reverse: "\x1b[7m",
	Hidden: "\x1b[8m",

	FgBlack: "\x1b[30m",
	FgRed: "\x1b[31m",
	FgGreen: "\x1b[32m",
	FgYellow: "\x1b[33m",
	FgBlue: "\x1b[34m",
	FgMagenta: "\x1b[35m",
	FgCyan: "\x1b[36m",
	FgWhite: "\x1b[37m",

	BgBlack: "\x1b[40m",
	BgRed: "\x1b[41m",
	BgGreen: "\x1b[42m",
	BgYellow: "\x1b[43m",
	BgBlue: "\x1b[44m",
	BgMagenta: "\x1b[45m",
	BgCyan: "\x1b[46m",
	BgWhite: "\x1b[47m",
};

/* ~~~~ Core functions ~~~~ */
/**
 * Do things before bot destroy.
 * @param {string} exitSignal
 * @returns	{Promise<boolean>}
 */
function prepareExit(exitSignal) {
	return new Promise((resolve, reject) => {
		printLog(`${CONSOLE_COLOR_CODE.BgGreen}[LOG]${CONSOLE_COLOR_CODE.Reset}  Got exit Signal [${exitSignal}]`, undefined, {
			embed: {
				title: `Bot destroy`,
				color: COLOR_INFO,
				fields: [
					{
						name: `Exit signal`,
						value: exitSignal,
						inline: true,
					},
				],
				footer: {
					text: getLogTimeString(),
				},
			},
		}).then((isLogged) => {
			if (isLogged) {
				resolve(true);
			} else {
				reject(false);
			}
		});
	});
}

/*
function prepareCommands() {
	AllCommands.map(aCmd => {
		if ((!aCmd.public) || (process.env.BOT_ID_THIS === process.env.BOT_ID_PUBLIC)) {
			Commands.push(aCmd);
		}
	});
}
*/

/* ~~~~ General funtions ~~~~ */
/**
 * Form digit
 * @param	{number}	val	Input value
 * @param	{number}	length	Output string length
 * @returns	{string}	Formatted text
 */
function formDigit(val, length) {
	var tVal = Number(val) % Math.pow(10, length);
	var res = "";
	for (var i = 1; i < length; i++) {
		if (tVal < Math.pow(10, i)) {
			res += "0";
		}
	}
	return res + tVal;
	/*
	return new Promise(resolve => {
		resolve(res + tVal);
	});
	*/
}

/**
 * Get time string for logging
 * @returns	{string}	Formatted time text
 * */
function getLogTimeString() {
	var now = new Date();
	var utcString = `UTC `;
	if (now.getTimezoneOffset < 0) {
		utcString += "-";
	} else {
		utcString += "+";
	}
	utcString += `${formDigit(Math.floor(Math.abs(now.getTimezoneOffset()) / 60), 2)}:${formDigit(now.getTimezoneOffset() % 60, 2)}`;
	return `${utcString} ${formDigit(now.getFullYear(), 4)}.${formDigit(now.getMonth() + 1, 2)}.${formDigit(now.getDate(), 2)} ${formDigit(
		now.getHours(),
		2
	)}:${formDigit(now.getMinutes(), 2)}:${formDigit(now.getSeconds(), 2)}.${formDigit(now.getMilliseconds(), 3)}`;
	/*
	return new Promise(resolve => {
		resolve(`${utcString} ${formDigit(now.getFullYear(), 4)}.${formDigit(now.getMonth() + 1, 2)}.${formDigit(now.getDate(), 2)} ${formDigit(now.getHours(), 2)}:${formDigit(now.getMinutes(), 2)}:${formDigit(now.getSeconds(), 2)}.${formDigit(now.getMilliseconds(), 3)}`);
	});
	*/
}

/**
 * @typedef	{object}	KoreanLetter
 * @property	{string}	f	자음
 * @property	{string}	s	모음
 * @property	{string}	t	받침
 */

/**
 * Deconstruct Korean letter
 * @param {string} kor	ONLY THE FIRST CHARACTER of the string matters
 * @returns	{KoreanLetter}
 * @see	{@link https://blog.naver.com/tk2rush90/221085154547|Scripter - 한글 자음 모음 분리 / 초성 * 중성 * 종성}
 */
function getConstantVowel(kor) {
	// https://blog.naver.com/tk2rush90/221085154547
	const f = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
	const s = ["ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ", "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ"];
	const t = [
		"",
		"ㄱ",
		"ㄲ",
		"ㄳ",
		"ㄴ",
		"ㄵ",
		"ㄶ",
		"ㄷ",
		"ㄹ",
		"ㄺ",
		"ㄻ",
		"ㄼ",
		"ㄽ",
		"ㄾ",
		"ㄿ",
		"ㅀ",
		"ㅁ",
		"ㅂ",
		"ㅄ",
		"ㅅ",
		"ㅆ",
		"ㅇ",
		"ㅈ",
		"ㅊ",
		"ㅋ",
		"ㅌ",
		"ㅍ",
		"ㅎ",
	];

	const ga = 44032;
	let uni = kor.charCodeAt(0);

	uni = uni - ga;

	let fn = parseInt(uni / 588);
	let sn = parseInt((uni - fn * 588) / 28);
	let tn = parseInt(uni % 28);

	return {
		f: f[fn],
		s: s[sn],
		t: t[tn],
	};
}

/**
 * 어미 알아서 다듬어버리기
 * @param {string} text
 * @param	{string}	addMiddle
 * @param {string} marker	ONLY THE FIRST CHARACTER of the string matters
 * @returns	{string}
 * @see	{@link https://blog.naver.com/tk2rush90/221085154547|Scripter - 한글 자음 모음 분리 / 초성 * 중성 * 종성}
 */
function getKoreanWithMaker(text, addMiddle, marker) {
	var tLetter = marker.charAt(0);
	/*
	const subjective = ["이", "가"];
	const objective = ["을", "를"];
	const assist = ["은", "는"];
	*/
	const krGa = 44032;
	const theArray = [
		["이", "가"],
		["을", "를"],
		["은", "는"],
	];

	var theType = theArray.find((aSet) => {
		return aSet.some((aString) => {
			return aString === tLetter;
		});
	});

	if ((text.slice(-1).charCodeAt(0) - krGa) % 28 > 0) {
		// 받침 있음
		return text + addMiddle + theType[0];
	} else {
		return text + addMiddle + theType[1];
	}
}

/**
 * For uptime functions
 * @param {number} iSecs	Seconds to convert
 * @returns	{string}
 */
function secsToString(iSecs) {
	return `${Math.floor(iSecs / 3600)}h ${Math.floor((iSecs % 3600) / 60)}m ${Math.round((iSecs % 60) * 100) / 100}s`;
}

/**
 * (Number of dice) d (Number of face of dice)
 * @param {number} dices	Dices
 * @param {number} faces	Faces
 * @returns	{Promise}	Rolled dices
 */
function rollDices(dices, faces) {
	let nDices = Number(dices);
	let nFaces = Number(faces);
	return new Promise((resolve, reject) => {
		if (!(Number.isInteger(nDices) && Number.isInteger(nFaces))) {
			reject("Not a number");
		} else if (nDices < 0 || nDices > DICE_LIMIT || nFaces < 0 || nFaces > DICE_LIMIT) {
			reject("Wrong number"); // OHHHHHHHHHHHHHH
		} else {
			let diceResult = [];
			for (let i = 0; i < nDices; i++) {
				diceResult.push(Math.floor(Math.random() * nFaces + 1));
			}
			resolve(diceResult);
		}
	});
}

/**
 * Make html snippet with html-things to Discord markdown text
 * @param {string} snippet
 * @returns	{string}
 */
function htmlSnippetToMarkdown(snippet) {
	let tString = HtmlEntities.decode(snippet);
	const rules = [
		{
			htmls: [],
			htmls_regExp: undefined,
			replace: "*",
			replace_regExp: "\\*",
			reverse_replace: "＊",
		},
		{
			htmls: ["<b>", "</b>"],
			htmls_regExp: "(<b>|</b>)",
			replace: "**",
			replace_regExp: "\\*\\*",
			reverse_replace: "＊＊",
		},
		{
			htmls: ["<i>", "</i>", "<em>", "</em>"],
			htmls_regExp: "(<i>|</i>|<em>|</em>)",
			replace: "_",
			replace_regExp: "_",
			reverse_replace: "＿",
		},
		{
			htmls: ["<strike>", "</strike>"],
			htmls_regExp: "(<strike>|</strike>)",
			replace: "~~",
			replace_regExp: "~~",
			reverse_replace: "～～",
		},
		{
			htmls: ["<br>", "</br>", "<br />"],
			htmls_regExp: "(<br>|</br>|<br />)",
			replace: "",
			reverse_replace: undefined,
		},
		{
			htmls: [],
			replace: "`",
			replace_regExp: "\\`",
			reverse_replace: "｀",
		},
	];

	for (let rule of rules) {
		if (rule.reverse_replace != undefined) {
			tString = tString.replace(new RegExp(rule.replace_regExp, "g"), rule.reverse_replace);
		}
		if (rule.htmls_regExp != undefined) {
			tString = tString.replace(new RegExp(rule.htmls_regExp, "g"), rule.replace);
		}
	}
	return tString;
}

/**
 * Avoid discord markdown characters
 * @param {string} text
 * @returns	{string}
 */
function avoidMarkdown(text) {
	let iText = text;
	const rules = [
		{
			from: "\\*",
			to: "＊",
		},
		{
			from: "_",
			to: "＿",
		},
		{
			from: "~~",
			to: "～～",
		},
	];
	for (let rule of rules) {
		iText = iText.replace(new RegExp(rule.from, "g"), rule.to);
	}
	return iText;
}

/**
 * Find a property for all nested objects deep in an object
 * @param {object} obj
 * @param {string} addr	End property name
 * @typedef	{object}	deepFound
 * @property	{string}	deepFound.name
 * @property	{*}	deepFound.value
 * @returns	{deepFound}
 */
function findDeepProperty(obj, addr) {
	let tAddrs = addr;
	let tAddr;
	if (tAddrs.includes(".")) {
		tAddr = tAddrs.slice(0, tAddrs.indexOf("."));
		tAddrs = tAddrs.substr(tAddrs.indexOf(".") + 1);
	} else {
		tAddr = tAddrs;
		tAddrs = undefined;
	}
	// console.log("CHECK");

	for (let ele in obj) {
		if (obj.hasOwnProperty(ele)) {
			let eleName = Array.isArray(obj) ? `[${ele}]` : `.${ele}`;
			if (ele === tAddr) {
				//if (tAddrs.includes(".")) { // Have to go deeper
				if (tAddrs !== undefined) {
					// Have to go deeper
					let child = findDeepProperty(obj[ele], tAddrs);
					if (child !== undefined) {
						return {
							name: eleName + child.name,
							value: child.value,
						};
					} // else return undefined;
				} else {
					// The end of searching
					return { name: eleName, value: obj[ele] };
				}
			} else if (typeof obj[ele] === "object") {
				// Nest
				let fNest = findDeepProperty(obj[ele], addr);
				if (fNest !== undefined) {
					return { name: eleName + fNest.name, value: fNest.value };
				} // else return undefined;
			} // else (No name match, No nest) return undefined
		}
	}
}

/* ~~~~ Complex functions ~~~~ */

/**
 * Google custom search API Request
 * @see	{@link https://developers.google.com/custom-search/v1/reference/rest/v1/cse/list}
 * @typedef	{object}	CseQuery
 * @property	{string}	[cr]	Restricts search results to documents originating in a particular country.
 * @property	{string}	cx	The custom search engine ID to use for this request.
 * @property	{string}	[dateRestrict]	Restricts results to URLs based on date.
 * @property	{string}	[exactTerms]	Identifies a phrase that all documents in the search results must contain.
 * @property	{string}	[excludeTerms]	Identifies a word or phrase that should not appear in any documents in the search results.
 * @property	{string}	[fileType]	Restricts results to files of a specified extension.
 * @property	{string}	[filter]	Controls turning on or off the duplicate content filter.
 * @property	{string}	[gl]	Geolocation of end user.
 * @property	{string}	[highRange]	Specifies the ending value for a search range.
 * @property	{string}	[hl]	Sets the user interface language.
 * @property	{string}	[hq]	Appends the specified query terms to the query, as if they were combined with a logical AND operator.
 * @property	{enum<ImgColorType>}	[imgColorType]	Returns black and white, grayscale, transparent, or color images.
 * @property	{enum<ImgDominantColor>}	[imgDominantColor]	Returns images of a specific dominant color.
 * @property	{enum<ImgSize>}	[imgSize]	Returns images of a specified size.
 * @property	{enum<ImgType>}	[imgType]	Returns images of a type.
 * @property	{string}	[linkSite]	Specifies that all search results should contain a link to a particular URL.
 * @property	{string}	[lowRange]	Specifies the starting value for a search range.
 * @property	{string}	[lr]	Restricts the search to documents written in a particular language.
 * @property	{number}	[num]	Number of search results to return.
 * @property	{string}	[orTerms]	Provides additional search terms to check for in a document, where each document in the search results must contain at least one of the additional search terms.
 * @property	{string}	q	Query
 * @property	{string}	[relatedSite]	Specifies that all search results should be pages that are related to the specified URL.
 * @property	{string}	[rights]	Filters based on licensing.
 * @property	{enum<Safe>}	[safe]	Search safety level.
 * @property	{enum<SearchType>}	[searchType]	Specifies the search type: image.
 * @property	{string}	[siteSearch]	Specifies a given site which should always be included or excluded from results.
 * @property	{enum<SiteSearchFilter}	[siteSearchFilter]	Controls whether to include or exclude results from the site named in the "siteSearch" parameter.
 * @property	{string}	[sort]	The sort expression to apply to the results.
 * @property	{number}	[start]	The index of the first result to return.
 */

/**
 * Google custom search API - Search query extends
 * @typedef	{object}	searchQuery
 * @property	{string}	auth	API key
 * @property	{string}	[c2coff]	Enables or disables Simplified and Traditional Chinese Search.
 *
 */

/**
 * Google custom search API - Query in response
 * @typedef	{object}	responseQuery
 * @property {string} title	A description of the query.
 * @property	{string}	totalResults	(int64 format) Estimated number of total search results.
 * @property	{string}	searchTerms	The search terms entered by the user.
 * @property	{number}	count	Number of search results returned in this set.
 * @property	{number}	startIndex	The index of the current set of search results into the total set of results, where the index of the first result is 1.
 * @property	{number}	startPage	The page number of this set of results, where the page length is set by the count property.
 * @property	{string}	language	The language of the search results.
 * @property	{string}	inputEncoding	The character encoding supported for search requests.
 * @property	{string}	outputEncoding	The character encoding supported for search results.
 * @property	{string}	googleHost	Specifies the Google domain to which the search should be limited.
 * @property	{string}	disableCnTwTranslation	Enables or disables the Simplified and Traditional Chinese Search feature.
 */

/**
 * Google custom search API Response config
 * @typedef	{object}	CseConfig
 * @property	{string}	url	Data url
 * @property	{string}	method	"GET"
 * @property	{object}	userAgentDirectives	Google things...
 * @property	{object}	headers	Another google things...
 * @property	{CseQuery&sesarchQuery}	params	Query parameters
 * @property	{boolean}	retry
 * @property	{string}	responseType	Usually "json"
 */

/**
 * Google custom search API Response - Result
 * @see	{@link https://developers.google.com/custom-search/v1/reference/rest/v1/Search}
 * @typedef	{object}	CseResult
 * @property	{string}	kind	"customsearch#result"
 * @property	{string}	title	The title of the search result, in plain text.
 * @property	{string}	htmlTitle	The title of the search result, in HTML.
 * @property	{string}	link	The full URL to which the search result is pointing.
 * @property	{string}	displayLink	An abridged version of this search result’s URL.
 * @property	{string}	snippet	The snippet of the search result, in plain text.
 * @property	{string}	htmlSnippet	The snippet of the search result, in HTML.
 * @property	{string}	cacheId	Indicates the ID of Google's cached version of the search result.
 * @property	{string}	formattedUrl	The URL displayed after the snippet for each search result.
 * @property	{string}	htmlFormattedUrl	The HTML-formatted URL displayed after the snippet for each search result.
 * @property	{object}	pagemap	Contains PageMap information for this search result.
 * @property	{string}	mime	The MIME type of the search result.
 * @property	{string}	fileFormat	The file format of the search result.
 * @property	{object}	image	Encapsulates all information about an image returned in search results.
 * @property	{string}	image.contextLink	A URL pointing to the webpage hosting the image.
 * @property	{number}	image.height	The height of the image, in pixels.
 * @property	{number}	image.width	The width of the image, in pixels.
 * @property	{number}	image.byteSize	The size of the image, in pixels.
 * @property	{string}	image.thumbnailLink	A URL to the thumbnail image.
 * @property	{number}	image.thumbnailHeight	The height of the thumbnail image, in pixels.
 * @property	{number}	image.thumbnailWidth	The width of the thumbnail image, in pixels.
 * @property	{Array<CseResultLabel>}	labels	Encapsulates all information about refinement labels.
 * @typedef	CseResultLabel
 * @property	{string}	name	The name of a refinement label, which you can use to refine searches. Don't display this in your user interface; instead, use displayName.
 * @property	{string}	displayName	The display name of a refinement label.
 * @property	{string}	label_with_op	Refinement label and the associated refinement operation.
 */

/**
 * Google custom search API Response - Data
 * @see	{@link https://developers.google.com/custom-search/v1/reference/rest/v1/Search}
 * @typedef	{object}	CseData
 * @property	{string}	kind	Unique identifier for the type of current object. (customsearch#search)
 * @property	{object}	url	The OpenSearch URL element that defines the template for this API.
 * @property	{string}	url.type	The MIME type of the OpenSearch URL template for the Custom Search API.
 * @property	{string}	url.template	The actual OpenSearch template for this API.
 * @property	{object}	queries	Contains one or more sets of query metadata, keyed by role name.
 * @property	{Array<CseQuery&responseQuery>}	data.queries.previousPage	Metadata representing the previous page of results, if applicable.
 * @property	{Array<CseQuery&responseQuery>}	data.queries.request	Metadata representing the current request.
 * @property	{Array<CseQuery&responseQuery>}	data.queries.nextPage	Metadata representing the next page of results, if applicable.
 * @property	{Array<object>}	data.promotions	The set of promotions.
 * @property	{object}	context	Metadata and refinements associated with the given search engine.
 * @property	{object}	searchInfomation	Metadata about about this search.
 * @property	{number}	searchInfomation.searchTime	The time taken for the server to return search results.
 * @property	{string}	searchInfomation.formattedSearchTime	The time taken for the server to return search results, formatted according to locale style.
 * @property	{string}	searchInformation.totalResult	The total number of search results returned by the query.
 * @property	{string}	searchInformation.formattedTotalResults	The total number of search results, formatted according to locale style.
 * @property	{object}	spelling	Encapsulates a corrected query.
 * @property	{string}	spelling.correctedQuery	The corrected query.
 * @property	{string}	htmlCorrectedQuery	The corrected query, formatted in HTML.
 * @property	{Array<CseResult>}	items	The current set of custom search results.
 */

/**
 * Google custom search API Response
 * @typedef	{object}	CustomSearchResponse
 * @property	{CseConfig}	config	Meta data
 * @property	{object}	retryConfig
 * @property	{number}	retryConfig.retry	How much to retry
 * @property	{CseData}	data	Result data
 * @property	{object}	headers	What? Another header? I don't care...
 * @property	{number}	status	Status code, 200 is good
 * @property	{string}	statusText	... Rly? You need this?
 * @property	{object}	request	Request AGAIN?
 * @property	{string}	responseURL	Same as result data. What? You object is for only this element?
 */

/**
 * Google custom search API Error
 * @typedef	{object}	CustomSearchError
 * @property {CustomSearchResponse}	response	Why they put this in here?
 * @property	{CseConfig}	config	Why is config here again?
 * @property	{number}	code	Status code of error, maybe 400?
 * @property	{object}	errors	Error message object. Finally!
 * @property	{string}	errors.message	Error description. Kindly!
 * @property	{string}	errors.domain	I saw it was "global". That's all what I know.
 * @property	{string}	errors.reason	"badRequest" it said. Is this some kind of code or something?
 *
 */

/**
 * Use custom search engine
 * @param {CseQuery & searchQuery} searchOptions
 * @returns	{Promise<CustomSearchResponse>}
 */
function searchGoogle(searchOptions) {
	searchOptions.auth = GOOGLE_API_KEY_KR;
	searchOptions.cx = CSE_ID_KR;
	return new Promise((resolve, reject) => {
		CustomSearch.cse
			.list(searchOptions)
			.then((cseRes) => {
				resolve(cseRes);
			})
			.catch((cseErr) => {
				if (cseErr.toString().startsWith("Error: This API requires billing")) {
					printError(true, `Custom search KR query limit exceeded`);
					searchOptions.auth = GOOGLE_API_KEY_JP;
					searchOptions.cx = CSE_ID_JP;
					CustomSearchJP.cse
						.list(searchOptions)
						.then((cseJpRes) => {
							resolve(cseJpRes);
						})
						.catch((cseJpErr) => {
							reject(cseJpErr);
						});
				} else {
					reject(cseErr);
				}
			});
	});
}

/**
 *	@typedef	{object}	HttpGetError
 *	@property	{number}	statusCode
 *	@property	{string}	statusMessage
 *	@property	{Http.headers}	headers
 */

/**
 * Http.GET()
 * @param {string} url
 * @param {Http.RequestOptions} [options]
 */
function getHttpGet(url, options) {
	return new Promise((resolve, reject) => {
		/** @param {Http.IncomingMessage} hRes */
		function callBackResponse(hRes) {
			let headers = hRes.headers;
			let statusCode = hRes.statusCode;
			/** @type	{HttpGetError} */
			let reason = {
				statusCode: statusCode,
				statusMessage: hRes.statusMessage,
				headers: headers,
			};
			if (statusCode >= 200 && statusCode < 300) {
				//	Good response, maybe?
				let rawData = "";
				hRes.on("data", (chunk) => {
					rawData += chunk;
				});
				hRes.on("end", () => {
					resolve(rawData);
				});
				hRes.on("error", (dErr) => {
					reject(dErr);
				});
			} else if (statusCode >= 300 && statusCode < 400 && headers.location !== undefined) {
				getHttpGet(headers.location, options)
					.then((redirectRes) => {
						resolve(redirectRes);
					})
					.catch((redirectErr) => {
						reject(redirectErr);
					});
			} else {
				reject(reason);
			}
			/*
			else if (statusCode >= 400) {
				reject(reason);
			}
			*/
		}

		if (url.startsWith("https:")) {
			Https.get(url, options, callBackResponse);
		} else {
			Http.get(url, options, callBackResponse);
		}
	});
}

/**
 * Http.GET() => redirect => statusCode
 * @param {string} url
 * @param {Http.RequestOptions} [options]
 * @returns	{Promise<boolean>}
 */
function checkHttpGetable(url, options) {
	// printDebug(`checkHttpGetable(${url})`);
	let tOptions = options !== undefined ? options : { method: "GET" };
	let tReq;
	return new Promise((resolve) => {
		/** @param {Http.IncomingMessage} hRes */
		function callBackResponse(hRes) {
			hRes.setEncoding("utf8");
			// printDebug(`checkHttpGetable(): hRes.statusCode: ${hRes.statusCode}`);
			if (hRes.statusCode >= 200 && hRes.statusCode < 300) {
				resolve(true);
			} else if (hRes.statusCode >= 300 && hRes.statusCode < 400) {
				if (hRes.headers.location !== undefined) {
					let reUrl = hRes.headers.location;
					checkHttpGetable(reUrl, options).then((redirectRes) => {
						resolve(redirectRes);
					});
				} else {
					printError(true, `checkHttpGetable(): statusCode: ${hRes.statusCode} but no redirect`, {
						statusCode: hRes.statusCode,
						statusMessage: hRes.statusMessage,
						headers: hRes.headers,
					});
					resolve(false);
				}
			} else {
				printError(true, `checkHttpGetable(): statusCode: ${hRes.statusCode}`, {
					statusCode: hRes.statusCode,
					statusMessage: hRes.statusMessage,
					headers: hRes.headers,
				});
				resolve(false);
			}
		}
		if (url.startsWith("https:")) {
			// printDebug(`checkHttpGetable(): url starts with https:`);
			tReq = Https.get(url, tOptions, callBackResponse);
			tReq.end();
		} else {
			// printDebug(`checkHttpGetable(): url starts with http:`);
			tReq = Http.get(url, tOptions, callBackResponse);
			tReq.end();
		}
	});
}

/* ~~~~ Message functions ~~~~ */
/**
 * Print raw log
 * @async
 * @param {string} [consoleText]	For log. DO PREFIX (ex. [LOG])
 * @param {string} [logText]	For DM log message.
 * @param {Discord.MessageOptions} [logOptions]	For DM log message options.
 * @returns	{Promise<boolean>}
 */
async function printLog(consoleText, logText, logOptions) {
	return new Promise((resolve, reject) => {
		try {
			if (consoleText != undefined) {
				console.log(getLogTimeString() + "  " + consoleText);
			}

			if (logText != undefined || logOptions != undefined) {
				Bot.channels
					.fetch(LOGGING_CHANNEL_ID)
					.then((logChan) => {
						logChan.send(logText, logOptions);
					})
					.then((sentMsg) => {
						resolve(true);
					});
			}
		} catch (logErr) {
			console.log(`[!!!] pringLog() FAIL!!!\n${logErr}`);
			reject(logErr);
		}
	});

	/*
	if ((logText != undefined) || (logOptions != undefined)) {
		Bot.channels.fetch(LOGGING_CHANNEL_ID)
			.then(logChan => {
				logChan.send(logText, logOptions);
				return true;
			})
			.catch(sendError => {
				printError(false, `printlog(): send() Error`, sendError);
				return false;
			});
	} else {
		return false;
	}
	*/
}

/**
 * Print error
 * @param {boolean} iWarn	Define warning or error
 * @param {string} iText	Short description of error
 * @param {object|string} [iError]	Full description of error
 * @param {Discord.Message} [callMsg]	Message what called the bot
 */
async function printError(iWarn, iText, iError, callMsg) {
	return new Promise((resolve) => {
		let tEmbed = {
			title: iText,
			color: iWarn ? COLOR_WARN : COLOR_ERROR,
			footer: {
				text: `${getLogTimeString()}`,
			},
			fields: [],
		};

		if (iError != undefined) {
			// tEmbed.description = iError;
			if (typeof iError === "object") {
				tEmbed.description = "```JSON\n" + JSON.stringify(iError, undefined, "\t") + "\n```";
			} else if (typeof iError === "string") {
				// tEmbed.description = iError;
				tEmbed.description = iError;
			}
		}
		// tEmbed.description = iError.toString();
		// tEmbed.description = iError;

		if (callMsg != undefined) {
			if (callMsg.channel.guild != undefined) {
				tEmbed.fields.push({
					name: `server`,
					value: callMsg.channel.guild.name + "\n(Owner : " + `<@${callMsg.channel.guild.ownerID}>` + ")",
					inline: true,
				});
			}
			if (callMsg.channel != undefined) {
				tEmbed.fields.push({
					name: `channel`,
					value: `<#${callMsg.channel.id}>`,
					inline: true,
				});
			}
			if (callMsg.author != undefined) {
				tEmbed.fields.push({
					name: `author`,
					value: `<@!${callMsg.author.id}>`,
					inline: true,
				});
			}
			if (callMsg.content != undefined) {
				tEmbed.fields.push({
					name: `content`,
					value: "```" + callMsg.content + "```",
					inline: false,
				});
			}
		}

		printLog(
			(iWarn ? `${CONSOLE_COLOR_CODE.BgYellow}[WRN]${CONSOLE_COLOR_CODE.Reset}  ` : `${CONSOLE_COLOR_CODE.BgRed}[ERR]${CONSOLE_COLOR_CODE.Reset}  `) +
				iText +
				"\n" +
				(typeof iError === "object" ? JSON.stringify(iError, undefined, "\t") : iError),
			iWarn ? `☢️ ＷＡＲＮＩＮＧ ☢️` : `‼️ ＥＲＲＯＲ ‼️ <@${DEVELOPER_ID}>`,
			{ embed: tEmbed }
		)
			.then((isLogged) => {
				resolve(isLogged);
			})
			.catch((logErr) => {
				console.log(`${CONSOLE_COLOR_CODE.BgRed}[!!!]${CONSOLE_COLOR_CODE.Reset}  printError(): printLog() ERROR :\n${logErr}\n`);
			});
	});
}

/**
 *
 * @param {string} [consoleText]
 * @param {string} [logChanText]
 * @param {Discord.MessageOptions} [logChanOptions]
 */
function printDebug(consoleText, logChanText, logChanOptions) {
	/*
	if (consoleText != undefined) {
		printLog(`${CONSOLE_COLOR_CODE.FgCyan}[DEB]  ${CONSOLE_COLOR_CODE.Reset}${consoleText}`);
	}
	if (channelText != undefined) {
		printLog(undefined, channelText);
	}
	if (channelOptions != undefined) {
		printLog(undefined, undefined, channelOptions);
	}
	*/
	printLog(
		consoleText != undefined ? `${CONSOLE_COLOR_CODE.BgCyan}[DEB]${CONSOLE_COLOR_CODE.Reset}  ${consoleText}` : undefined,
		logChanText,
		logChanOptions
	);
}

/**
 * Answer to call(Discord.Message)
 * @async
 * @param {Discord.Message} callMsg	Discord.Message object what called the bot
 * @param {string} [content]	Text to answer
 * @param {Discord.MessageOptions|Discord.MessageAdditions} [options]	Options(embed) to answer
 * @returns	{Promise<Discord.Message>}
 */
async function answer(callMsg, content, options) {
	return new Promise((resolve, reject) => {
		if (content === undefined && options === undefined) {
			reject(`answer(): params are undefined`);
		} else {
			callMsg.channel
				.send(content, options)
				.then((sentMsg) => {
					resolve(sentMsg);
				})
				.catch((sendErr) => {
					printError(false, `answer(): callMsg.channel.send() error`, sendErr, callMsg);
					reject(sendErr);
				});
		}
	});
}

/**
 * Chainning after answer()
 * @param {Discord.Message} sentMsg
 * @param	{boolean}	[force=false]
 */
function stopTypingWithMsg(sentMsg, force) {
	sentMsg.channel.stopTyping(force);
}

/* ~~~~ Event functions ~~~~ */
/**
 * Check whether the message called bot or not
 * @param {Discord.Message} theMsg	The incomming message to check
 */
function checkBotCall(theMsg) {
	if (theMsg.author.id != Bot.user.id) {
		switch (theMsg.channel.type) {
			default:
			case "dm":
				handleCall(theMsg, theMsg.content);
				break;
			case "text":
			case "group":
				var botName = Bot.user.username;
				if (theMsg.channel.type === "text" && theMsg.guild.me.nickname != undefined && theMsg.guild.me.nickname != null) {
					botName = theMsg.guild.me.nickname;
				}
				if (theMsg.content.startsWith(BOT_PREFIX)) {
					handleCall(theMsg, theMsg.content.replace(BOT_PREFIX, "").trim());
				} else if (theMsg.content.startsWith(botName)) {
					handleCall(theMsg, theMsg.content.replace(botName, "").trim());
				} else if (theMsg.mentions.users.has(BOT_SELF_ID)) {
					handleCall(message, message.content.replace(`<@!${BOT_SELF_ID}>`, "").trim());
				}
				/* Discord.Message.isMentioned() DEPRECATED!!
				 * else if (message.isMentioned(BOT_SELF_ID)) {
					handleCall(message, message.content.replace(`<@!${BOT_SELF_ID}>`, "").trim());
				}
				*/
				break;
		}
	}
}

/**
 * Types of handleArgsError
 * @enum	{number}
 * */
const handleArgsErrorType = {
	NO_TEXT: 1,
	WRONG_COMMAND: 2,
	NOT_PUBLIC: 3,
	WRONG_OPTION: 4,
	NO_OPTION_ARG: 5,
};

/**
 * Error object of handleArgs
 * @typedef	{object}	handleArgsError
 * @property	{handleArgsErrorType}	type
 * @property	{string}	text	Cause of error
 */

/**
 * An option argument object
 * @typedef	{object} ArgOption
 * @property	{string}	name	Option name
 * @property	{string}	value	Option value
 */

/**
 * Command object
 * @typedef	{object}	BotRequest
 * @property	{string}	command	Command name
 * @property	{Array<ArgOption>}	options	Command options
 * @property	{string}	arg	Command argument
 */

/**
 * handleArgsPromiseResolve()
 * @callback	handleArgsPromiseResolve
 * @param	{BotRequest}	botReq
 */

/**
 * handleArgsPromiseReject()
 * @callback	handleArgsPromiseReject
 * @param	{handleArgsError}	hdErr
 */

/**
 * Make command object with called text
 * @param {string} callText	The text
 * @returns	{Promise<handleArgsError|BotRequest>}
 */
function handleArgs(callText) {
	return new Promise((resolve, reject) => {
		if (callText === undefined || callText === null || callText.length < 1) {
			//	reject("Text is undefined or null");
			/** @param	{handleArgsError} */
			reject({ type: handleArgsErrorType.NO_TEXT, text: undefined });
		} else {
			/*
			callText = callText.replace(/ /g, " ");
			var si = 0; // Start index
			var bi = -1; // Bracket Indicator
			for (var i = 0; i < callText.length; i++) {
				if ((callText[i] === `"`) && (si === i - 1) && (bi < 0)) {
					si = i;
					bi = 1;
				} else if ((callText[i] === `"`) && (bi === 1)) {
					
				}
			}
			*/
			var rawArgsArray = callText.replace(/ /g, " ").split(" ");

			/**	@type	{Command} */
			var foundCommand = Commands.find((aCmd) => {
				return aCmd.inputs.find((anInput) => {
					return anInput === rawArgsArray[0].toLowerCase();
				});
			});
			if (foundCommand === undefined) {
				// reject("Command not found");
				// reject(handleArgsErrorType.WRONG_COMMAND);
				reject({
					type: handleArgsErrorType.WRONG_COMMAND,
					text: rawArgsArray[0],
				});
			} else if (foundCommand.public && BOT_SELF_ID != BOT_ID_PUBLIC) {
				reject({
					type: handleArgsErrorType.NOT_PUBLIC,
					text: rawArgsArray[0],
				});
			} else {
				if (foundCommand.command === "help") {
					resolve({ command: "help" });
				} else {
					/**	@type	{BotRequest} */
					let argsStruct = {
						command: foundCommand.command,
						options: [],
						arg: "",
					};

					rawArgsArray.shift();

					let helpFlag = false;
					let optionArgFlag = false;
					/**	@type	{CommandOption} */
					let foundOption = undefined;
					/**	@type	{ArgOption} */
					let tmpOption = undefined;

					for (let i = 0; i < rawArgsArray.length; i++) {
						if (!helpFlag) {
							if (optionArgFlag) {
								//argsStruct.options.push
								tmpOption.value = rawArgsArray[i];
								optionArgFlag = false;
								argsStruct.options.push(tmpOption);
							} else if (rawArgsArray[i].startsWith(OPTION_PREFIX)) {
								let nOpIn = rawArgsArray[i].replace(OPTION_PREFIX, "").trim();
								// printDebug(`nOpIn = "${nOpIn}"`);
								// printDebug(`foundCommand.options = ${JSON.stringify(foundCommand.options, undefined, "\t")}`);
								foundOption = foundCommand.options.find((anOpt) => {
									let hasInput = false;
									hasInput = anOpt.inputs.some((anOptInput) => {
										return anOptInput === nOpIn;
									});
									return hasInput;
								});

								if (foundOption === undefined) {
									reject({
										type: handleArgsErrorType.WRONG_OPTION,
										text: rawArgsArray[i],
									});
								} else {
									// 옵션 검색됨
									// printDebug(`foundOption.name = "${foundOption.name}"`);
									tmpOption = {
										name: foundOption.name,
										value: undefined,
									};

									if (foundOption.need_arg) {
										optionArgFlag = true;
									} else {
										argsStruct.options.push(tmpOption);
										// argsStruct.options.push({ name: foundOption.name, value: undefined });
									}
								}
							} else {
								// argsStruct.arg += " " + rawArgsArray[i];
								argsStruct.arg = `${argsStruct.arg} ${rawArgsArray[i]}`.trim();
							}
						}
					}
					if (optionArgFlag) {
						reject({
							type: handleArgsErrorType.NO_OPTION_ARG,
							text: undefined,
						});
					} else {
						resolve(argsStruct);
					}
				}
			}
		}
	});
}

/**
 * Main function of this bot. DO ANSWER EVERY CALL
 * @async
 * @param {Discord.Message} callMsg	Incomming message what called the bot
 * @param {String} callText	The message's content
 */
async function handleCall(callMsg, callText) {
	/**	@type	{BotRequest} */
	var hInput;
	try {
		hInput = await handleArgs(callText);
	} catch (nHandleArgsError) {
		switch (nHandleArgsError.type) {
			case handleArgsErrorType.NO_TEXT:
				answer(callMsg, `🤔❓ 명령어가 없다...`);
				break;
			case handleArgsErrorType.WRONG_COMMAND:
				answer(callMsg, `🤔❓ *${getKoreanWithMaker(nHandleArgsError.text, "* ", "는")} 모르는 명령어다...`);
				return;
				break;
			case handleArgsErrorType.NOT_PUBLIC:
				answer(callMsg, `🤤 *${nHandleArgsError.text}* 명령어는 내가 처리할 수 없다...`);
				return;
				break;
			case handleArgsErrorType.WRONG_OPTION:
				answer(callMsg, `🤔❓ *${getKoreanWithMaker(nHandleArgsError.text, "* ", "는")} 모르는 옵션이다...`);
				return;
				break;
		}
	}

	// answer(callMsg, "```JSON\n" + JSON.stringify(hInput, undefined, "\t") + "\n```");

	// await printDebug(`hInput = ${JSON.stringify(hInput, undefined, "\t")}`);
	switch (hInput.command) {
		default:
		case "help":
			answer(callMsg, `😏 녀석── 도움말 기능은 아직 『준비』중이다...`).then((sentMsg) => {
				sentMsg.channel.stopTyping();
			});
			break;
		case "debug":
			// let loggingGuild = callMsg.author.client.guilds.cache.get(LOGGING_GUILD_ID);
			// printDebug(`Got in Debug`);
			let devsRole = Bot.guilds.cache.get(LOGGING_GUILD_ID).roles.cache.get(DEVS_ROLE_ID).members.get(callMsg.author.id);
			if (devsRole === undefined) {
				// printDebug(`Not Devs`);
				answer(callMsg, `😏 네 놈은 내 개발자가 아니군...`);
			} else {
				// printDebug(`Got Devs`);
				// printDebug(`hInput.options.length = "${hInput.options.length}"`);
				if (hInput.options.length === 0) {
					if (hInput.arg.length < 1) {
						answer(callMsg, `디버그 문구 없음`).then((sentMsg) => {
							sentMsg.channel.stopTyping();
						});
					} else {
						answer(callMsg, hInput.arg).then((sentMsg) => {
							sentMsg.channel.stopTyping();
						});
					}
				} else {
					/*
					printDebug(`Before startTyping()`);
					await callMsg.channel.startTyping();
					printDebug(`After startTyping()`);
					*/
					callMsg.channel.startTyping(); // startTyping() returns AFTER stopTyping()... WTF??

					// printDebug(`hInput.options = ${JSON.stringify(hInput.options, undefined, "\t")}`);
					hInput.options.map((anOption) => {
						// printDebug(`anOption = "${anOption.name}"`);
						switch (anOption.name) {
							case "embed":
								answer(callMsg, undefined, JSON.parse(anOption.value)).then((sentMsg) => {
									sentMsg.channel.stopTyping();
								});
								break;
							case "uptime":
								// printDebug(`Os.uptime() = "${Os.uptime()}"`);
								answer(callMsg, undefined, {
									embed: {
										color: COLOR_GREEN,
										description: `업타임 : ${secsToString(Os.uptime())}`,
										footer: {
											text: getLogTimeString(),
										},
									},
								}).then((sentMsg) => {
									sentMsg.channel.stopTyping();
								});
								break;
							case "process":
								printDebug(`Process.uptime() = "${Process.uptime()}"`);
								answer(callMsg, undefined, {
									embed: {
										color: COLOR_GREEN,
										description: `프로세스 업타임 : ${secsToString(Process.uptime())}`,
										footer: {
											text: getLogTimeString(),
										},
									},
								}).then((sentMsg) => {
									sentMsg.channel.stopTyping();
								});
								break;
							case "chanid":
								// printDebug(`callMsg.channel = "${callMsg.channel}"`);
								answer(callMsg, `이 채널의 ID : \`${callMsg.channel.toString()}\``).then((sentMsg) => {
									sentMsg.channel.stopTyping();
								});
								break;
							case "restart":
								answer(callMsg, `😏 날 이길수 있을거라 생각했나...?`);
								break;
							case "database":
								answer(callMsg, `😏 난 데이터베이스따위 갖고 있지 않다...`).then((sentMsg) => {
									sentMsg.channel.stopTyping();
								});
								break;
							case "stoptyping":
								answer(callMsg, `😤 멈춘다`).then((sentMsg) => {
									sentMsg.channel.stopTyping(true);
								});
								break;
						}
					});
				}
			}
			break;
		case "ip": //	https://www.npmjs.com/package/public-ip
			let publicIp = await PublicIp.v4();
			// let localIp = undefined;
			let localIps = [];
			const netIfs = Os.networkInterfaces();

			for (const i in netIfs) {
				if (netIfs.hasOwnProperty(i)) {
					for (const anAddr of netIfs[i]) {
						if (!anAddr.internal && anAddr.family === "IPv4") {
							localIps.push(anAddr.address);
						}
					}
				}
			}

			let localIpStr = "";

			for (const anIp of localIps) {
				localIpStr += "내부 아이피 = `" + anIp + "`\n";
			}
			answer(callMsg, `>>> ${localIpStr.trim()}\n외부 아이피 = \`${publicIp}\``);

			break;
		case "dice":
			callMsg.channel.startTyping();
			let diceString = hInput.arg.toLowerCase();
			let diceParams = diceString.split("d");

			rollDices(diceParams != undefined && diceParams[0].length > 0 ? diceParams[0] : 1, diceParams.length > 1 ? diceParams[1] : 6)
				.then((dices) => {
					if (dices.length === 1) {
						answer(callMsg, `🎲 <@!${callMsg.author.id}>, 주사위를 굴려 **${dices[0]}**`).then((sentMsg) => {
							sentMsg.channel.stopTyping();
						});
					} else {
						let dicesSum = dices.reduce((dSum, aDice) => {
							return dSum + aDice;
						});
						let dicesStr = "";
						for (let i = 0; i < dices.length; i++) {
							if (i === 0) {
								dicesStr = "" + dices[i];
							} else {
								dicesStr = `${dicesStr} + ${dices[i]}`;
							}
						}
						dicesStr = `${dicesStr}\n= **${dicesSum}**`;
						answer(callMsg, `🎲 <@!${callMsg.author.id}>, 주사위를 굴려 **${dicesSum}**`, {
							embed: {
								color: COLOR_GREEN,
								description: dicesStr,
							},
						})
							.then((sentMsg) => {
								sentMsg.channel.stopTyping();
							})
							.catch((answerErr) => {
								printError(false, `dice: answer() error`, answerErr, callMsg);
								answer(callMsg, `🤔❓ 결과 전송에 실패했다...`).then((sentMsg) => {
									sentMsg.channel.stopTyping();
								});
							});
					}
				})
				.catch((diceErr) => {
					if (diceErr === "Not a number") {
						// *${diceString}* 은
						answer(callMsg, `🤔❓ 숫자가 아니다...`).then((sentMsg) => {
							sentMsg.channel.stopTyping();
						});
					} else if (diceErr === "Wrong number") {
						// *${diceString}* 은
						answer(callMsg, `🤔❓ 너무 크다... *${DICE_LIMIT}* 까지만 하라고...`).then((sentMsg) => {
							sentMsg.channel.stopTyping();
						});
					} else {
						printError(false, `dice: Unknown error`, `dice: with a number: rollDices() throws unknown error`, callMsg);
						answer(callMsg, `🤔❓ *${diceString}* ...!? 뭐냐 이건...!?`).then((sentMsg) => {
							sentMsg.channel.stopTyping();
						});
					}
				});
			break;
		case "swpower":
			answer(callMsg, `🤤 아직 준비 못했다구...`);
			break;
		case "google":
		case "image":
		case "youtube":
		case "namu":
		case "soundcloud":
			if (hInput.arg.length < 1) {
				answer(callMsg, `🤔❓ 무얼 검색할 것이냐...?`);
			} else {
				/**	@type	{CseQuery&searchQuery} */
				let csQuery = {
					q: hInput.arg,
					num: 3,
					start: 1,
				};
				let oPage = null;
				let oDetail = false;
				let oDebug = false;

				if (hInput.command === "image" || hInput.command === "youtube" || hInput.command === "soundcloud") {
					csQuery.num = 1;
				}
				if (hInput.command === "namu") {
					csQuery.siteSearch = "namu.wiki/w/";
				} else if (hInput.command === "image") {
					csQuery.searchType = "image";
				} else if (hInput.command === "youtube") {
					csQuery.siteSearch = "www.youtube.com/watch";
				} else if (hInput.command === "soundcloud") {
					csQuery.siteSearch = "soundcloud.com";
				}

				if (hInput.options.length > 0) {
					for (let anOpt of hInput.options) {
						switch (anOpt.name) {
							case "quantity":
								csQuery.num = Number(anOpt.value);
								break;
							case "page":
								oPage = Number(anOpt.value);
								break;
							case "index":
								csQuery.start = Number(anOpt.value);
								break;
							case "detail":
								oDetail = true;
								break;
							case "debug":
								oDebug = true;
								break;
						}
					}
				}
				if (oPage != null) {
					csQuery.start = (oPage - 1) * csQuery.num + 1;
				}
				if (csQuery.num < 1 || csQuery.num > 10) {
					answer(callMsg, `✋☹️ 한번에 *${csQuery.num}* 개만큼 검색할수는 없다...`);
				} else if (csQuery.start < 1) {
					answer(callMsg, `✋☹️ *${csQuery.start}* 부터 검색할수는 없다... 자연수를 넣으라고...`);
				} else {
					callMsg.channel.startTyping();
					try {
						let searchResponse = await searchGoogle(csQuery);
						if (oDebug) {
							let sentDebug = await answer(callMsg, undefined, {
								embed: {
									color: COLOR_GREEN,
									description: `[searchResponse.config.url](${searchResponse.config.url})`,
									fields: [
										{
											name: `searchResponse.status`,
											value: searchResponse.status,
										},
									],
								},
							});
							stopTypingWithMsg(sentDebug);
						} else {
							if (oDetail || hInput.command === "google" || hInput.command === "namu") {
								// let sentInfoMsg = await answer(callMsg, `\`*${csQuery.q}* 검색 ${searchResponse.data.searchInformation.formattedTotalResults}건 중 ${searchResponse.data.items.length}건 표시 (${csQuery.start}~${csQuery.num}번째 결과) ${searchResponse.data.searchInformation.searchTime}초 소요\``);
								let sentInfoMsg = await answer(
									callMsg,
									`*${csQuery.q}* 검색 ${searchResponse.data.searchInformation.formattedTotalResults}건 중 ${searchResponse.data.items.length}건 표시 (${csQuery.start}~${csQuery.num}번째 결과) ${searchResponse.data.searchInformation.searchTime}초 소요`
								);

								const thumbnailAddrs = ["metatags.image", "metatags.og:image", "cse_image.src", "cse_thumbnail.src"];

								let sEmbeds = [];
								sEmbeds = searchResponse.data.items.map((item) => {
									/*thumbnailAddrs.map(anAddr => {
										return findDeepProperty(item, anAddr);
									})*/
									let eThumb = undefined;
									for (let anAddr of thumbnailAddrs) {
										if (eThumb === undefined) {
											eThumb = findDeepProperty(item, anAddr);
										}
									}
									/** @type {Discord.MessageEmbed} */
									let rEmbed = {
										color: COLOR_GREEN,
										title: `${htmlSnippetToMarkdown(item.htmlTitle)}\n${htmlSnippetToMarkdown(item.htmlFormattedUrl)}`,
										description: htmlSnippetToMarkdown(item.htmlSnippet),
										url: item.link,
										footer: {
											text: item.displayLink,
											//, icon_url: `http://${item.displayLink}/favicon.ico`
										},
									};
									if (eThumb !== undefined) {
										rEmbed.thumbnail = {
											url: eThumb.value,
										};
									}
									return rEmbed;
								});

								for (let anEmbed of sEmbeds) {
									await answer(callMsg, undefined, {
										embed: anEmbed,
									});
								}
								// callMsg.channel.stopTyping();
								stopTypingWithMsg(sentInfoMsg);
							} else {
								//	image, youtube, soundcloud
								/**	@typedef {object}	imageLink
								 *	@property	{string}	image
								 *	@property	{string}	thumbnail
								 */
								// printDebug(`csQuery = ${JSON.stringify(csQuery, undefined, "\t")}`);
								/**	@type	{Array<imageLink>} */
								let iLinks = [];
								iLinks = searchResponse.data.items.map((item) => {
									// printDebug(`search: item: ${JSON.stringify(item, undefined, "\t")}`);
									return {
										image: "" + item.link,
										thumbnail: "" + item.image.thumbnailLink,
									};
								});
								for (let link of iLinks) {
									// let isGetable = await checkHttpGetable(link.image);
									let isGetable = await checkHttpGetable(link.image);
									if (isGetable) {
										// printDebug(`search: isGetable: true`);
										await answer(callMsg, link.image);
									} else {
										// printDebug(`search: isGetable: false`);
										await answer(callMsg, link.thumbnail);
									}
								}
								callMsg.channel.stopTyping();
							}
							// printDebug(JSON.stringify(searchResponse.data.searchInformation.formattedTotalResults,undefined,"\t"));
							//callMsg.channel.stopTyping();

							// let sentInfoMsg = await answer(callMsg, `\`*${csQuery.q}* 검색 ${searchResponse.data.searchInformation.formattedTotalResults}건\``);

							// stopTypingWithMsg(sentInfoMsg);
						}
					} catch (searchErr) {
						printError(false, `search: responding error`, searchErr, callMsg);
						answer(callMsg, `검색 결과 표시 실패`).then(stopTypingWithMsg);
					}
				}
			}
			break;
		case "saucenao":
			answer(callMsg, `기능 준비중`);
			break;
		case "anime":
			answer(callMsg, `애니 기능`);
			break;
		case "meme":
			answer(callMsg, `밈 기능`);
			break;
	}
}

/* ~~~~ Event handling ~~~~ */
Bot.on("message", (message) => {
	checkBotCall(message);
});

Bot.on("ready", () => {
	BOT_SELF_ID = Bot.user.id;
	// prepareCommands();
	printLog(`${CONSOLE_COLOR_CODE.BgGreen}[LOG]${CONSOLE_COLOR_CODE.Reset}  Logged in`, undefined, {
		embed: {
			color: COLOR_GREEN,
			title: `Bot logged in`,
			footer: {
				text: getLogTimeString(),
			},
		},
	});
});

process.on("SIGINT", () => {
	if (BOT_SELF_ID.length > 0) {
		prepareExit("SIGINT").then(() => {
			Bot.destroy();
		});
	} else {
		console.log(`[SIGINT] Before log in`);
		Bot.destroy();
	}
});

process.on("SIGTERM", () => {
	if (BOT_SELF_ID.length > 0) {
		prepareExit("SIGTERM").then(() => {
			Bot.destroy();
		});
	} else {
		console.log(`[SIGTERM] Before log in`);
		Bot.destroy();
	}
});

/* ~~~~ All definitions end, login the bot ~~~~ */
Bot.login(BOT_TOKEN);
