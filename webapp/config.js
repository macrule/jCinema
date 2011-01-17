// look in jCinema/config.defaults.js for options,
// and how they can be overridden.

$.extend(jCinema.options, {
	Platform:		'Desktop',
	//BackEndHost:	'127.0.0.1:8080',
	//MediaSearchPath: '/tmp/media/usb',
	FolderImagePathPattern:     '{path}/{name}.jpg;{path}/folder.jpg',
	ThumbnailImagePathPattern:  '{dir}/_MovieSheets/{name}/thumb.jpg;{dir}/{name}.jpg;{dir}/folder.jpg',
	MovieSheetImagePathPattern: '{dir}/_MovieSheets/{name}/sheet.jpg;{dir}/{name}{suffix}_sheet.jpg;{dir}/wd_tv.jpg',
	PatternSeparator: 	    ';',
});
