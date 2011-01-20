$.extend(jCinema.options, {
	// Currently allowed values are WDTV and Desktop.
	Platform:		(navigator.userAgent.indexOf('QtEmbedded') != -1) ? 'WDTV' : 'Desktop',
	
	// The host and port on which the backend daemon is listening.
	// Unless you modified that leave this as is.
	BackEndHost:	'127.0.0.1:8080',
	
	// The root path which will be first shown in the video browser.
	MediaSearchPath: '/tmp/media/usb',
	
	// these macros are available for patterns:
	//  - {path}   full path to folder or movie
	//  - {dir}    full path to parent directory of folder or movie
	//  - {name}   file name without suffix
	//  - {suffix} file suffix including the dot
	// you can specify multiple patterns, separated by
	// jCinema.options.PatternSeparator (default is semicolon).
	// the first one that matches will be used.
	FolderImagePathPattern:     '{path}/{name}.jpg;{path}/folder.jpg',
	ThumbnailImagePathPattern:  '{dir}/_MovieSheets/{name}/thumb.jpg;{dir}/{name}.jpg;{dir}/folder.jpg',
	MovieSheetImagePathPattern: '{dir}/_MovieSheets/{name}/sheet.jpg;{dir}/{name}{suffix}_sheet.jpg;{dir}/wd_tv.jpg',
	PatternSeparator:           ';'
});
