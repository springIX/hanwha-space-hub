import * as fs from 'fs';
import path, { resolve } from 'path';
import { defineConfig } from 'vite';
import ejs, {render as ejsRender } from 'ejs';
import beautify from 'vite-plugin-beautify';

import faqData from './src/js/_faq.json';
import mediaRoomData from './src/js/_media-room.json';
import mediaRoomDataEn from './src/js/_media-room-en.json';
import spaceKidsMediaRoomData from './src/js/_space-kids-mediaroom.json';

const projectName = 'space-hub';
const directory = __dirname;
const title = 'Hanwha Space-Hub';

// js 상단 배너 추가
const bannerPlugin = (banner) => {
  return {
    name: 'banner',
    async writeBundle (NULL, bundle) {
      for (const fileName of Object.entries(bundle)) {
        const file = fileName[0]
        const extRegex = new RegExp(/\.(css|js)$/i)
        const vendorRegex = new RegExp(/vendor/)
        if (extRegex.test(file) && !vendorRegex.test(file)) {
          let data = fs.readFileSync('./build/' + file, { encoding: 'utf8' })
          data = `/* ${banner} */ ${data}`
          fs.writeFileSync('./build/' + file, data)
        }
      }
    }
  }
}

const dateFormat = (date) => {
	let month = date.getMonth() + 1;
	let day = date.getDate();
	let hour = date.getHours();
	let minute = date.getMinutes();
	let second = date.getSeconds();

	month = month >= 10 ? month : '0' + month;
	day = day >= 10 ? day : '0' + day;
	hour = hour >= 10 ? hour : '0' + hour;
	minute = minute >= 10 ? minute : '0' + minute;
	second = second >= 10 ? second : '0' + second;

	return date.getFullYear() + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
}


// get html file list to set rollupOptions.input
const htmlFileList = [...getHtmlFiles(directory)];
const inputsMap = {};

fs.readdirSync(directory).forEach((item) => {
	const file = path.join(directory, item);
	const stats = fs.lstatSync(file);

	if (stats.isDirectory()) {
		if (!(/^(\.git|_old|build|node_modules|public|src|@BACK)$/).test(item)) {
			htmlFileList.push(...getHtmlFiles(file, true));
		}
	}
});

htmlFileList.forEach((fileName) => {
	inputsMap[fileName.replace('.html', '')] = resolve(directory, fileName);
});

// console.log(htmlFileList)

// const template = fs.readFileSync('./src/include/media-room-detail.ejs', 'utf-8');
// const countDownMini = fs.readFileSync('./src/include/count-down-mini.ejs', 'utf-8');
// const header = ejs.render(
//   fs.readFileSync('./src/include/header.ejs', 'utf-8'),
//   { lang: 'ko', title: 'Media Room', gnbActive: 4, detailPage:true, countDownMini }
// );
// const footer = fs.readFileSync('./src/include/footer.ejs', 'utf-8');

// mediaRoomData.forEach((item, index) => {
// 	const filePath = path.resolve(__dirname, `./ko/media-room/${ index + 1 }/index.html`)
// 	const content = ejs.render(template, {
// 		data: item,
// 		header,
// 		footer
// 	});
// 	const directoryPath = filePath.split('/').slice(0, -1).join('/');

// 	if (!fs.existsSync(directoryPath)) {
//     fs.mkdirSync(directoryPath, { recursive: true });
// 	}
	
// 	fs.writeFileSync(filePath, content);
// });


export default defineConfig({
	base: '',
	build: {
		outDir: './build',

		rollupOptions: {
			input: inputsMap,
			output: {
				inlineDynamicImports: false,
				assetFileNames: (assetInfo) => {
					let extType = assetInfo.name.match(/\.([a-z0-9]+)$/i);
					if (!extType) {
						return '';
					}
					extType = extType[1];
					if (/(css)/i.test(extType)) {
						return `resources/${ extType }/${ projectName }-[hash][extname]`;
					} else if (/(png|jpe?g|svg|gif|tiff|bmp|ico)/i.test(extType)) {
						extType = 'images';
					} else if (/(woff2|woff2|otf|ttf)/i.test(extType)) {
						extType = 'fonts';
					}
					return `resources/${extType}/[name][extname]`; // remove hash
				},
				chunkFileNames: `resources/js/${ projectName }-[hash].js`,
				entryFileNames: `resources/js/${ projectName }-[hash].js`
			}
		}
	},

	plugins: [
		bannerPlugin(`
* @project  ${title}
* @author   www.fave.kr
* @build    ${dateFormat(new Date())}
`),
		VitePluginEjs({
			faqData: faqData,
			mediaRoomData: mediaRoomData,
			mediaRoomDataEn: mediaRoomDataEn,
			spaceKidsMediaRoomData: spaceKidsMediaRoomData,
		}),
		beautify({
			inDir: 'build',
			js: { enabled: false },
			css: { enabled: false }
		})
	]
});


// https://github.com/amazingdudu/vite-plugin-html-file-list/blob/main/src/index.ts
function getHtmlFiles (dir, recursive) {
	const results = [];
	const list = fs.existsSync(dir) ? fs.readdirSync(dir) : [];

	if (list.length === 0) {
		return [];
	}

	list.forEach(item => {
		let file = path.join(dir, item);
		const stats = fs.lstatSync(file);

		file = file.replace(directory + '/', '');
		if (recursive && stats.isDirectory()) {
			results.push(...getHtmlFiles(file, true));
		} else if (stats.isFile() && item.endsWith('.html')) {
			results.push(file);
		}
	});

	return results;
}

// https://github.com/trapcodeio/vite-plugin-ejs
function VitePluginEjs (data = {}, options) {
	let config;
	return {
		name: 'vite-plugin-ejs',
		// Get Resolved config
		configResolved(resolvedConfig) {
			config = resolvedConfig;
		},
		configureServer (server) {
			server.watcher.on('change', (file) => {
				if (!(/\.(scss|js)$/i).test(file)) {
					server.ws.send({ type: 'full-reload', path: '*' }); // reload
				}
			});
		},
		transformIndexHtml: {
			enforce: 'pre',
			transform(html) {
				if (typeof data === 'function') {
					data = data(config);
				}
				let ejsOptions = options && options.ejs ? options.ejs : {};
				if (typeof ejsOptions === 'function') {
					ejsOptions = ejsOptions(config);
				}
				html = ejsRender(
					html,
					Object.assign({ NODE_ENV: config.mode, isDev: config.mode === 'development' }, data),
					Object.assign(
						Object.assign(
							{ 
								// setting views enables includes support
								views: [config.root]
							},
							ejsOptions
						),
						{
							async: false // Force sync
						}
					)
				);
				return html;
			}
		}
	};
}