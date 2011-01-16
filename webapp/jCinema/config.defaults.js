$.extend(jCinema.options, {
	// Currently allowed values are WDTV and Desktop.
	Platform:		'WDTV',
	
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
	FolderImagePathPattern:     '{path}/folder.jpg',
	ThumbnailImagePathPattern:  '{dir}/_MovieSheets/{name}/thumb.jpg',
	MovieSheetImagePathPattern: '{dir}/_MovieSheets/{name}/sheet.jpg',
});
