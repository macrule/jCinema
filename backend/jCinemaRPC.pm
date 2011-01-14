package jCinemaRPC;

use strict;
use base qw(JSON::RPC::Procedure);

use File::Basename;
use File::Find::Rule;
use URI::file;


our $cachedMovieList = ();


sub getUPnPHost : Public {
    my ($server, $args) = @_;
	return $server->raise_error(
		code	=> 501,
		message	=> "Not implemented."
	);
}

sub listMovies : String(searchPath) {
    my ($server, $args) = @_;
    my $searchPath = $args->{searchPath};
	if ($searchPath =~ /^file:\/\//) {
		$searchPath = URI->new($searchPath)->path;
	}
	
	print "listMovies start $searchPath\n";
	
	# FIXME: the cache is never refreshed
 	if (!exists $cachedMovieList->{$searchPath}) {
 		my @folders;
 		my @files;
 		
 		# find directories
 		for my $path (File::Find::Rule->new
 						->extras({ follow_fast => 1 })
 						->maxdepth(1)
 						->directory
 						->name( qr/^[^._]+/ )
 						->in($searchPath)
 						) {
 			my $thumbPath = "${path}/folder.jpg";
 			if (-e $thumbPath) {
 				$thumbPath = URI::file->new($thumbPath)->as_string;
 			} else {
 				$thumbPath = undef;
 			}
 			
 			push(@folders, {
 				type				=> "folder",
 				url					=> URI::file->new($path)->as_string,
 				thumbnailImageUrl	=> $thumbPath,
 			});
 		}
 		
 		# find files
 		for my $path (File::Find::Rule->new
 						->extras({ follow_fast => 1 })
 						->maxdepth(1)
 						->file
 						->name( qr/\.(avi|m4v|mov|mp4|mkv)$/ )
 						->in($searchPath)
 						) {
 			my ($filename, $directories, $suffix) = fileparse($path, qr/\.[^.]*/);
 			my $movieSheetsPath = "${directories}/_MovieSheets/${filename}";
 			
 			my $thumbPath = "${movieSheetsPath}/thumb.jpg";
 			my $sheetPath = "${movieSheetsPath}/sheet.jpg";
 			if (-e $thumbPath) {
 				$thumbPath = URI::file->new($thumbPath)->as_string;
 			} else {
 				$thumbPath = undef;
 			}
 			if (-e $sheetPath) {
 				$sheetPath = URI::file->new($sheetPath)->as_string;
 			} else {
 				$sheetPath = undef;
 			}
 			
 			push(@files, {
 				type				=> "file",
 				url					=> URI::file->new($path)->as_string,
 				thumbnailImageUrl	=> $thumbPath,
 				movieSheetImageUrl	=> $sheetPath,
 			});
 		}
 		
 		# sort alphabetically, but folders to the top
 		my @list;
 		push(@list, sort { $a->{url} cmp $b->{url}; } @folders);
 		push(@list, sort { $a->{url} cmp $b->{url}; } @files);
 		
	 	$cachedMovieList->{$searchPath} = \@list;
 	}
	
	print "listMovies end $searchPath\n";
	
	return $cachedMovieList->{$searchPath};
}

1;
__END__
