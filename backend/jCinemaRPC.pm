package jCinemaRPC;

use strict;
use base qw(JSON::RPC::Procedure);

use Cwd 'realpath';
use Encode;
use File::Basename;
use File::Find::Rule;
use URI::file;
use URI::Escape;


our $cachedMovieList = ();


sub getUPnPHost : Public {
    my ($server, $args) = @_;
	return $server->raise_error(
		code	=> 501,
		message	=> "Not implemented."
	);
}

sub applyPatternToPath : Private {
	my ($pattern, $path, $separator) = @_;
	
	my $returnVal = undef;

 	my ($name, $dirs, $suffix) = fileparse($path, qr/\.[^.]*$/);

	my @patterns = split(/$separator/,$pattern);
	
	for my $uri (@patterns) {
 	 	$uri =~ s/\{path\}/$path/g;
	 	$uri =~ s/\{dir\}/$dirs/g;
	 	$uri =~ s/\{name\}/$name/g;
	 	$uri =~ s/\{suffix\}/$suffix/g;
	 	$uri = realpath($uri);
	 	if (defined $uri && -e $uri) {
	 		$returnVal = URI::file->new($uri)->as_string;
			last;
	 	} 
	}

 	# returns a file uri or undef
 	return $returnVal;
}

sub listMovies : String(searchPath, folderImagePathPattern, thumbnailImagePathPattern, movieSheetImagePathPattern, patternSeparator) {
    my ($server, $args) = @_;
    my $searchPath = $args->{searchPath};
	if ($searchPath =~ /^file:\/\//) {
		$searchPath = uri_unescape(URI->new($searchPath)->path);
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
 			# we expect paths to be in UTF-8 encoding
 			$path = Encode::decode("UTF-8", $path);
 			
 			push(@folders, {
 				type				=> "folder",
 				url					=> URI::file->new($path)->as_string,
 				thumbnailImageUrl	=> applyPatternToPath($args->{folderImagePathPattern}, $path, $args->{patternSeparator}),
 				title				=> fileparse($path),
 			});
 		}
 		
 		# find files
 		for my $path (File::Find::Rule->new
 						->extras({ follow_fast => 1 })
 						->maxdepth(1)
 						->file
 						->name( qr/\.(avi|m4v|mov|mp4|mkv|ts|iso|vob)$/ )
 						->in($searchPath)
 						) {
 			# we expect paths to be in UTF-8 encoding
 			$path = Encode::decode("UTF-8", $path);
 			
 			push(@files, {
 				type				=> "file",
 				url					=> URI::file->new($path)->as_string,
 				thumbnailImageUrl	=> applyPatternToPath($args->{thumbnailImagePathPattern}, $path, $args->{patternSeparator}),
 				movieSheetImageUrl	=> applyPatternToPath($args->{movieSheetImagePathPattern}, $path, $args->{patternSeparator}),
 				title				=> fileparse($path, qr/\.[^.]*$/),
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
